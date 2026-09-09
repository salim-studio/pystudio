/**
 * Client-Side Python Execution Engine (Pyodide / WebAssembly)
 * Serves as an instant, zero-latency fallback whenever the backend server
 * is reconnecting, restarting, or under proxy edge lag.
 */

let pyodideInstance: any = null;
let pyodideLoadingPromise: Promise<any> | null = null;

export async function getPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;

  if (!pyodideLoadingPromise) {
    pyodideLoadingPromise = (async () => {
      // 1. Check if pyodide script is already injected
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = (e) => reject(new Error("Failed to load Pyodide from CDN"));
          document.head.appendChild(script);
        });
      }

      // 2. Initialize Pyodide runtime
      const pyodide = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      });

      pyodideInstance = pyodide;
      return pyodide;
    })();
  }

  return pyodideLoadingPromise;
}

export interface ClientExecutionResult {
  stdout: string;
  stderr: string;
  result: string | null;
  plots: string[];
  error: {
    type: string;
    message: string;
    suggestion?: string;
  } | null;
  elapsed_seconds: number;
}

export async function executeInClientPython(code: string): Promise<ClientExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = await getPyodide();

    // Check if numpy/pandas are imported and auto-load if needed
    const packagesToLoad: string[] = [];
    if (code.includes("numpy") || code.includes("np.")) packagesToLoad.push("numpy");
    if (code.includes("pandas") || code.includes("pd.")) packagesToLoad.push("pandas");
    if (code.includes("matplotlib") || code.includes("plt.")) packagesToLoad.push("matplotlib");

    if (packagesToLoad.length > 0) {
      await pyodide.loadPackage(packagesToLoad).catch(() => {});
    }

    // Set up stdout/stderr redirection
    let stdoutBuffer = "";
    let stderrBuffer = "";

    pyodide.setStdout({
      batched: (text: string) => {
        stdoutBuffer += text + "\n";
      },
    });

    pyodide.setStderr({
      batched: (text: string) => {
        stderrBuffer += text + "\n";
      },
    });

    // Run Python code
    const rawResult = await pyodide.runPythonAsync(code);

    let resultStr: string | null = null;
    if (rawResult !== undefined && rawResult !== null) {
      resultStr = typeof rawResult === "object" ? JSON.stringify(rawResult) : String(rawResult);
    }

    const elapsed = Math.max(0.001, (performance.now() - startTime) / 1000);

    return {
      stdout: stdoutBuffer,
      stderr: stderrBuffer,
      result: resultStr,
      plots: [],
      error: null,
      elapsed_seconds: parseFloat(elapsed.toFixed(4)),
    };
  } catch (err: any) {
    const elapsed = Math.max(0.001, (performance.now() - startTime) / 1000);
    const errMessage = err?.message || String(err);

    return {
      stdout: "",
      stderr: "",
      result: null,
      plots: [],
      error: {
        type: "ExecutionNotice",
        message: errMessage.replace(/PythonError:\s*/, ""),
        suggestion: "Check syntax and indentation.",
      },
      elapsed_seconds: parseFloat(elapsed.toFixed(4)),
    };
  }
}
