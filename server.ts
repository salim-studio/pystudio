import express from "express";
import path from "path";
import fs from "fs";
import { spawn, ChildProcess, exec } from "child_process";
import { promisify } from "util";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const execAsync = promisify(exec);
const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Gemini AI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// Persistent Python Kernel Manager
// ----------------------------------------------------
class KernelManager {
  private process: ChildProcess | null = null;
  private pendingResolvers: Map<string, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map();
  private buffer: string = "";
  public isReady: boolean = false;
  public startTime: number = Date.now();
  public executionCount: number = 0;

  constructor() {
    this.startKernel();
  }

  public startKernel() {
    if (this.process) {
      try {
        this.process.kill("SIGTERM");
      } catch (e) {}
    }

    this.isReady = false;
    this.buffer = "";
    this.pendingResolvers.clear();
    this.startTime = Date.now();

    // Spawn python3 py_kernel.py with unbuffered stdout/stderr
    const env = { ...process.env, PYTHONUNBUFFERED: "1" };
    this.process = spawn("python3", ["-u", "py_kernel.py"], {
      cwd: process.cwd(),
      env,
    });

    this.process.stdout?.on("data", (chunk: Buffer) => {
      this.buffer += chunk.toString("utf-8");
      this.processBuffer();
    });

    this.process.stderr?.on("data", (chunk: Buffer) => {
      console.error("[Kernel stderr]:", chunk.toString("utf-8"));
    });

    this.process.on("exit", (code, signal) => {
      console.log(`Kernel exited with code ${code}, signal ${signal}`);
      this.isReady = false;
      // Reject any pending promises
      this.pendingResolvers.forEach(({ reject }) => {
        reject(new Error("Kernel exited unexpectedly"));
      });
      this.pendingResolvers.clear();
    });
  }

  private processBuffer() {
    const lines = this.buffer.split("\n");
    // Keep last incomplete line in buffer
    this.buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const msg = JSON.parse(trimmed);
        if (msg.status === "ready") {
          this.isReady = true;
          continue;
        }

        // Resolve first waiting promise in FIFO order
        const firstKey = this.pendingResolvers.keys().next().value;
        if (firstKey) {
          const { resolve } = this.pendingResolvers.get(firstKey)!;
          this.pendingResolvers.delete(firstKey);
          resolve(msg);
        }
      } catch (e) {
        console.warn("Unparsed kernel output line:", trimmed);
      }
    }
  }

  public async sendCommand(command: any, timeoutMs: number = 30000): Promise<any> {
    if (!this.process || !this.isReady) {
      this.startKernel();
      // Wait up to 3s for ready
      await new Promise((r) => setTimeout(r, 1000));
    }

    const reqId = "req_" + Math.random().toString(36).substring(2, 9);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingResolvers.has(reqId)) {
          this.pendingResolvers.delete(reqId);
          reject(new Error(`Execution timed out after ${timeoutMs / 1000}s`));
        }
      }, timeoutMs);

      this.pendingResolvers.set(reqId, {
        resolve: (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });

      try {
        this.process?.stdin?.write(JSON.stringify(command) + "\n");
      } catch (err) {
        clearTimeout(timer);
        this.pendingResolvers.delete(reqId);
        reject(err);
      }
    });
  }

  public async execute(code: string): Promise<any> {
    this.executionCount++;
    return this.sendCommand({ action: "execute", code });
  }

  public async getVariables(): Promise<any> {
    return this.sendCommand({ action: "get_variables" });
  }

  public async reset(): Promise<any> {
    return this.sendCommand({ action: "reset" });
  }

  public restart() {
    this.startKernel();
    return { status: "ok", message: "Kernel restarted successfully" };
  }
}

const kernelManager = new KernelManager();

// ----------------------------------------------------
// API Routes
// ----------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Kernel Status & Metrics
app.get("/api/kernel/status", async (req, res) => {
  try {
    const memory = process.memoryUsage();
    res.json({
      status: kernelManager.isReady ? "ready" : "starting",
      pythonVersion: "3.10.12",
      executionCount: kernelManager.executionCount,
      uptimeSeconds: Math.floor((Date.now() - kernelManager.startTime) / 1000),
      memoryMb: Math.round(memory.rss / (1024 * 1024)),
      heapMb: Math.round(memory.heapUsed / (1024 * 1024)),
      hardware: {
        platform: process.platform,
        arch: process.arch,
        hasCuda: false,
        device: "CPU (Optimized)",
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Kernel Execute
app.post("/api/kernel/execute", async (req, res) => {
  const { code } = req.body;
  if (typeof code !== "string") {
    return res.status(400).json({ error: "Code must be a string" });
  }
  try {
    const result = await kernelManager.execute(code);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({
      status: "error",
      error: {
        type: "KernelTimeoutOrCrash",
        message: e.message || "Failed to execute code",
        suggestion: "If your code was in an infinite loop, restart the kernel from the toolbar.",
      },
    });
  }
});

// Kernel Reset / Restart
app.post("/api/kernel/reset", async (req, res) => {
  try {
    const result = await kernelManager.reset();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/kernel/restart", (req, res) => {
  const result = kernelManager.restart();
  res.json(result);
});

// Variables Inspector
app.get("/api/kernel/variables", async (req, res) => {
  try {
    const result = await kernelManager.getVariables();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Packages: List
app.get("/api/packages/list", async (req, res) => {
  try {
    const { stdout } = await execAsync("python3 -m pip list --format=json");
    const packages = JSON.parse(stdout);
    res.json({ status: "success", packages });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Packages: Install
app.post("/api/packages/install", async (req, res) => {
  const { packageName, upgrade } = req.body;
  if (!packageName || typeof packageName !== "string") {
    return res.status(400).json({ error: "Package name is required" });
  }
  // Sanitize package name (letters, numbers, hyphens, underscores, dots, brackets)
  const safeName = packageName.trim().replace(/[^a-zA-Z0-9_\-\.\[\]<>=]/g, "");
  if (!safeName) {
    return res.status(400).json({ error: "Invalid package name" });
  }

  try {
    const cmd = `python3 -m pip install --user ${upgrade ? "--upgrade" : ""} ${safeName} --no-warn-script-location`;
    const { stdout, stderr } = await execAsync(cmd, { timeout: 120000 });
    res.json({ status: "success", stdout, stderr, package: safeName });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message, stderr: e.stderr });
  }
});

// Packages: Uninstall
app.post("/api/packages/uninstall", async (req, res) => {
  const { packageName } = req.body;
  const safeName = (packageName || "").trim().replace(/[^a-zA-Z0-9_\-\.]/g, "");
  if (!safeName) {
    return res.status(400).json({ error: "Invalid package name" });
  }
  try {
    const { stdout, stderr } = await execAsync(`python3 -m pip uninstall -y ${safeName}`, { timeout: 30000 });
    res.json({ status: "success", stdout, stderr });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// File Management
const WORKSPACE_DIR = path.join(process.cwd(), "workspace");

function getDirectoryTree(dirPath: string): any[] {
  if (!fs.existsSync(dirPath)) return [];
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  return items.map((item) => {
    const fullPath = path.join(dirPath, item.name);
    const relPath = path.relative(process.cwd(), fullPath);
    if (item.isDirectory()) {
      return {
        name: item.name,
        path: relPath,
        type: "directory",
        children: getDirectoryTree(fullPath),
      };
    }
    const stats = fs.statSync(fullPath);
    return {
      name: item.name,
      path: relPath,
      type: "file",
      size: stats.size,
      updatedAt: stats.mtime,
      ext: path.extname(item.name).toLowerCase(),
    };
  });
}

app.get("/api/files/tree", (req, res) => {
  try {
    const tree = getDirectoryTree(WORKSPACE_DIR);
    res.json({ status: "success", tree });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/files/read", (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) return res.status(400).json({ error: "Path is required" });
  
  const resolved = path.resolve(process.cwd(), filePath);
  if (!resolved.startsWith(process.cwd())) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    if (!fs.existsSync(resolved)) {
      return res.status(404).json({ error: "File not found" });
    }
    const content = fs.readFileSync(resolved, "utf-8");
    res.json({ status: "success", content, path: filePath });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/files/write", (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: "Path and content are required" });
  }

  const resolved = path.resolve(process.cwd(), filePath);
  if (!resolved.startsWith(process.cwd())) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolved, content, "utf-8");
    res.json({ status: "success", path: filePath });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/files/upload", (req, res) => {
  const { name, content, targetDir = "workspace/data" } = req.body;
  if (!name || content === undefined) {
    return res.status(400).json({ error: "Name and content are required" });
  }

  const safeName = path.basename(name);
  const targetPath = path.join(process.cwd(), targetDir, safeName);

  try {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(targetPath, content, "utf-8");
    res.json({ status: "success", path: path.relative(process.cwd(), targetPath) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// AI Python Teacher (Gemini Powered)
app.post("/api/ai/tutor", async (req, res) => {
  const { action, code, error, context, language = "en" } = req.body;
  const ai = getAI();

  // If Gemini API Key is not set, provide high quality pedagogical fallback guidance
  if (!ai) {
    const fallbackResponses: Record<string, string> = {
      explain: `### Code Walkthrough (Offline Pedagogical Mode)\n\n1. **Structure**: This block defines computational logic or loads libraries.\n2. **Best Practice**: In Python, code execution proceeds sequentially from top to bottom.\n3. **Tip**: Add informative comments and verify function arguments for clean code.`,
      debug: `### Debugging Assistant\n\n- **Error**: ${error?.type || "Review"} - ${error?.message || "Check logic"}\n- **Insight**: Verify your variable types and ensure any modules required are imported.\n- **Fix**: ${error?.suggestion || "Review line syntax and variables."}`,
      improve: `### Code Optimization Suggestions\n\n- Use list comprehensions for cleaner loops.\n- For numerical tasks, prefer vectorized operations with NumPy over standard Python loops.\n- Use descriptive variable names that convey meaning.`,
      hint: `### Learning Hint 💡\n\nThink about what input types the function expects, and trace the return value on a small example (e.g. [1, 2, 3]).`,
    };
    return res.json({
      status: "success",
      response: fallbackResponses[action] || "Keep experimenting! Python's interactive feedback loop helps you master concepts quickly.",
    });
  }

  try {
    let systemInstruction = `You are PyTutor, a world-class, encouraging, and highly pedagogical Python and Data Science teacher inspired by Khan Academy, 3Blue1Brown, and Harvard CS50. 
Your goal is to guide the student to understand concepts deeply rather than simply writing all code for them.
Explain clearly with intuitive analogies, structured bullet points, and clean syntax examples.
Always reply in the requested language: ${language === "ar" ? "Arabic" : language === "fr" ? "French" : "English"}.`;

    let prompt = "";
    if (action === "explain") {
      prompt = `Please explain the following Python code to a student step-by-step. Highlight how data flows and why each step is used:\n\`\`\`python\n${code}\n\`\`\``;
    } else if (action === "debug") {
      prompt = `The student ran this Python code:\n\`\`\`python\n${code}\n\`\`\`\nAnd encountered this error:\nType: ${error?.type}\nMessage: ${error?.message}\nTraceback:\n${error?.traceback}\n\nExplain why this error occurred in simple terms and guide the student step-by-step on how to fix it without making them feel discouraged.`;
    } else if (action === "improve") {
      prompt = `Review this Python code and provide pedagogical suggestions on how to make it more Pythonic, readable, and performant (e.g., NumPy vectorization or Pandas idiomatic methods):\n\`\`\`python\n${code}\n\`\`\``;
    } else if (action === "hint") {
      prompt = `The student is working on this problem / code:\n\`\`\`python\n${code}\n\`\`\`\nContext: ${context || "Practice exercise"}\nGive them an insightful hint that nudges them in the right direction without spoiling the final answer.`;
    } else if (action === "math") {
      prompt = `Explain the mathematical formula or ML concept behind this code in an intuitive visual way:\n\`\`\`python\n${code}\n\`\`\``;
    } else {
      prompt = `Explain this Python concept and provide a small interactive example for the student:\n${context || code}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      status: "success",
      response: response.text || "No response generated.",
    });
  } catch (e: any) {
    console.error("AI Tutor error:", e);
    res.status(500).json({
      status: "error",
      message: e.message || "Failed to communicate with AI teacher.",
    });
  }
});

// ----------------------------------------------------
// Vite Middleware / Static Serve
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PyStudio server running on http://localhost:${PORT}`);
  });
}

startServer();
