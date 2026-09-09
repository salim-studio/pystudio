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
    if (!this.process) {
      this.startKernel();
    }

    if (!this.isReady) {
      let waited = 0;
      while (!this.isReady && waited < 5000) {
        await new Promise((r) => setTimeout(r, 100));
        waited += 100;
      }
      if (!this.isReady) {
        this.startKernel();
        let waited2 = 0;
        while (!this.isReady && waited2 < 5000) {
          await new Promise((r) => setTimeout(r, 100));
          waited2 += 100;
        }
      }
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
    const response = await kernelManager.execute(code);
    // Directly unwrap data payload matching CellOutput interface
    if (response && response.data) {
      res.json(response.data);
    } else {
      res.json(response);
    }
  } catch (e: any) {
    res.status(500).json({
      execution_count: kernelManager.executionCount,
      stdout: "",
      stderr: "",
      result: null,
      plots: [],
      error: {
        type: "KernelTimeoutOrCrash",
        message: e.message || "Failed to execute code",
        suggestion: "If your code was in an infinite loop, restart the kernel from the toolbar.",
      },
      elapsed_seconds: 0,
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

// Ensure pip helper
async function ensurePip(): Promise<void> {
  try {
    await execAsync("python3 -m pip --version");
  } catch {
    try {
      await execAsync("curl -sS https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py && python3 /tmp/get-pip.py --no-warn-script-location");
    } catch (err) {
      console.error("Failed to install pip:", err);
    }
  }
}

// Packages: List
app.get("/api/packages/list", async (req, res) => {
  try {
    await ensurePip();
    const { stdout } = await execAsync("python3 -m pip list --format=json");
    const packages = JSON.parse(stdout);
    res.json({ status: "success", packages });
  } catch (e: any) {
    res.json({ status: "error", packages: [], message: e.message });
  }
});

// Packages: Install
app.post("/api/packages/install", async (req, res) => {
  const { packageName, upgrade } = req.body;
  if (!packageName || typeof packageName !== "string") {
    return res.status(400).json({ status: "error", message: "Package name is required" });
  }
  // Sanitize package name (letters, numbers, hyphens, underscores, dots, brackets, version operators)
  const safeName = packageName.trim().replace(/[^a-zA-Z0-9_\-\.\[\]<>=!]/g, "");
  if (!safeName) {
    return res.status(400).json({ status: "error", message: "Invalid package name" });
  }

  try {
    await ensurePip();
    const cmd = `python3 -m pip install ${upgrade ? "--upgrade" : ""} ${safeName} --no-warn-script-location --root-user-action=ignore`;
    const { stdout, stderr } = await execAsync(cmd, { timeout: 180000 });
    try {
      await kernelManager.execute("import importlib; importlib.invalidate_caches()");
    } catch {}
    res.json({ status: "success", stdout, stderr, package: safeName });
  } catch (e: any) {
    const errorMsg = e.stderr?.trim() || e.stdout?.trim() || e.message || "Failed to install package via pip";
    // Return status 200 with status: "error" so reverse proxies/CDNs don't swap the response with custom 500/502 HTML pages
    res.json({
      status: "error",
      message: errorMsg,
      stderr: e.stderr || "",
      stdout: e.stdout || "",
      package: safeName,
    });
  }
});

// Packages: Uninstall
app.post("/api/packages/uninstall", async (req, res) => {
  const { packageName } = req.body;
  const safeName = (packageName || "").trim().replace(/[^a-zA-Z0-9_\-\.]/g, "");
  if (!safeName) {
    return res.status(400).json({ status: "error", message: "Invalid package name" });
  }
  try {
    await ensurePip();
    const { stdout, stderr } = await execAsync(`python3 -m pip uninstall -y ${safeName}`, { timeout: 30000 });
    try {
      await kernelManager.execute("import importlib; importlib.invalidate_caches()");
    } catch {}
    res.json({ status: "success", stdout, stderr, package: safeName });
  } catch (e: any) {
    res.json({ status: "error", message: e.stderr || e.message, package: safeName });
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
  const { action, code, error, context, language = "en", prompt: userPrompt } = req.body;
  const ai = getAI();

  const getFallbackResponse = (act: string, lang: string) => {
    const isAr = lang === "ar";
    const isFr = lang === "fr";
    
    if (act === "explain") {
      if (isAr) {
        return `### شرح الكود خطوة بخطوة 💡\n\n1. **الهدف**: يقوم هذا المقطع بتنفيذ المعالجة الحسابية والبرمجية بالاعتماد على ميزات بايثون التفاعلية.\n2. **تسلسل التنفيذ**: تُنفذ الأوامر سطراً بسطر؛ المتغيرات تُحفظ في الذاكرة المشتركة لتكون متاحة في الخلايا اللاحقة.\n3. **نصيحة تعليمية**: استخدم أسماء واضحة للمتغيرات وجرب طباعة القيم عبر \`print()\` أو مجرد كتابة اسم المتغير لمشاهدة محتواه.`;
      }
      return `### Step-by-Step Code Walkthrough 💡\n\n1. **Purpose**: This cell executes Python statements and updates the kernel's active namespace.\n2. **Execution Flow**: Statements evaluate sequentially; any variables or functions defined remain available in subsequent notebook cells.\n3. **Pedagogical Tip**: You can inspect active variables anytime in the **Variables** panel on the left.`;
    }
    if (act === "debug") {
      if (isAr) {
        return `### المساعد الذكي لتصحيح الأخطاء 🛠️\n\n- **نوع الخطأ**: \`${error?.type || "تنبيه برمجي"}\`\n- **السبب الشائع**: ${error?.message || "تحقق من نوع البيانات وصحة كتابة المعاملات"}\n- **طريقة الإصلاح**: ${error?.suggestion || "تأكد من استيراد المكتبة المطلوبة وصحة أسماء المتغيرات."}`;
      }
      return `### Debugging Assistant 🛠️\n\n- **Error Type**: \`${error?.type || "Runtime Issue"}\`\n- **Explanation**: ${error?.message || "Check variable types and method arguments."}\n- **Fix**: ${error?.suggestion || "Ensure all imported libraries and variable references match correctly."}`;
    }
    if (act === "improve") {
      if (isAr) {
        return `### اقتراحات لتحسين الكود والارتقاء به 🚀\n\n1. **العمليات المتجهية**: عند التعامل مع مصفوفات بيانات كبيرة، فضّل استخدام دوال **NumPy** و **Pandas** السريعة على الحلقات التكرارية (\`for\` loops).\n2. **وضوح الكود (Pythonic)**: استخدم صياغة القوائم المضغوطة (\`[x for x in data]\`) لتبسيط الشيفرة.\n3. **التوثيق**: أضف تعليقات تشرح الهدف من كل خطوة لسهولة المراجعة.`;
      }
      return `### Optimization & Pythonic Tips 🚀\n\n1. **Vectorization**: For numerical datasets, use NumPy vector operations or Pandas vectorized transforms instead of explicit \`for\` loops.\n2. **Idiomatic Style**: Take advantage of list comprehensions and tuple unpacking for cleaner, readable code.\n3. **Documentation**: Add short docstrings or comments describing function inputs and returns.`;
    }
    if (act === "hint") {
      if (isAr) {
        return `### تلميح تعليمي 💡\n\nفكر في نوع البيانات المتوقع كمدخل والنتيجة المرغوبة. ابدأ بتجربة حالة بسيطة جداً (مثل قائمة من عنصرين) للتأكد من منطق الحل.`;
      }
      return `### Learning Hint 💡\n\nTrace the input types and the expected return value. Try testing with a minimal example (e.g. \`[1, 2]\`) to observe behavior step by step.`;
    }
    return isAr
      ? `### إرشاد تعليمي تفاعلي 🎓\n\nالتعلم عبر التجربة في دفتر بايثون هو الطريقة المثلى! يمكنك تجربة تشغيل الكود، واستخدام لوحة المتغيرات لمتابعة القيم في الذاكرة.`
      : `### Interactive Learning Guidance 🎓\n\nExperimenting directly in code cells is the fastest way to master Python concepts! Run the cell and check the variable inspector to trace the internal state.`;
  };

  // If Gemini client is not initialized, return high quality fallback
  if (!ai) {
    return res.json({
      status: "success",
      response: getFallbackResponse(action, language),
    });
  }

  try {
    const langName = language === "ar" ? "Arabic" : language === "fr" ? "French" : "English";
    const systemInstruction = `You are PyTutor, a world-class, encouraging, and highly pedagogical Python and Data Science teacher inspired by Khan Academy, 3Blue1Brown, and Harvard CS50. 
Your goal is to guide the student to understand concepts deeply rather than simply writing all code for them.
Explain clearly with intuitive analogies, structured bullet points, and clean syntax examples.
Always reply in ${langName}.`;

    let prompt = userPrompt ? `${userPrompt}\n\nContext Code:\n\`\`\`python\n${code || ""}\n\`\`\`` : "";
    if (action === "explain") {
      prompt = `Please explain the following Python code to a student step-by-step. Highlight how data flows and why each step is used:\n\`\`\`python\n${code}\n\`\`\``;
    } else if (action === "debug") {
      prompt = `The student ran this Python code:\n\`\`\`python\n${code}\n\`\`\`\nAnd encountered this error:\nType: ${error?.type}\nMessage: ${error?.message}\nTraceback:\n${error?.traceback}\n\nExplain why this error occurred in simple terms and guide the student step-by-step on how to fix it without making them feel discouraged.`;
    } else if (action === "improve") {
      prompt = `Review this Python code and provide pedagogical suggestions on how to make it more Pythonic, readable, and performant:\n\`\`\`python\n${code}\n\`\`\``;
    } else if (action === "hint") {
      prompt = `The student is working on this problem / code:\n\`\`\`python\n${code}\n\`\`\`\nContext: ${context || "Practice exercise"}\nGive them an insightful hint that nudges them in the right direction without spoiling the final answer.`;
    } else if (action === "math") {
      prompt = `Explain the mathematical formula or ML concept behind this code in an intuitive visual way:\n\`\`\`python\n${code}\n\`\`\``;
    } else if (!prompt) {
      prompt = `Explain this Python concept and provide a small interactive example for the student:\n${context || code || "Python programming"}`;
    }

    let textResponse = "";
    const callWithTimeout = (promise: Promise<any>, ms: number) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
      ]);
    };

    try {
      const response = await callWithTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        }),
        5000
      );
      textResponse = response.text || "";
    } catch (primaryErr: any) {
      console.warn("Primary model timed out or errored, attempting fallback:", primaryErr.message);
      try {
        const fallbackRes = await callWithTimeout(
          ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          }),
          4000
        );
        textResponse = fallbackRes.text || "";
      } catch (secondaryErr: any) {
        console.warn("AI generation offline fallback applied:", secondaryErr.message);
        textResponse = getFallbackResponse(action, language);
      }
    }

    res.json({
      status: "success",
      response: textResponse || getFallbackResponse(action, language),
    });
  } catch (e: any) {
    console.error("AI Tutor unexpected error:", e);
    res.json({
      status: "success",
      response: getFallbackResponse(action, language),
    });
  }
});

// Global API error handler for any unhandled errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled API Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    status: "error",
    error: err.message || "Internal server error",
  });
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
