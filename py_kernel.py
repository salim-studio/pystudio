"""
PyStudio Isolated Stateful Execution Kernel
Emulates Jupyter/IPython execution semantics with AST expression inspection,
Matplotlib/Seaborn automatic figure rendering, Pandas DataFrame serialization,
LaTeX formula generation, and variable namespace inspection.
"""

import sys
import os
import io
import ast
import json
import time
import traceback
import base64

# Force non-interactive matplotlib backend before importing matplotlib
os.environ["MPLBACKEND"] = "Agg"

class PythonKernel:
    def __init__(self):
        self.user_globals = {
            "__name__": "__main__",
            "__doc__": None,
            "__package__": None,
        }
        self.execution_count = 0
        self.history = []

    def reset(self):
        self.user_globals = {
            "__name__": "__main__",
            "__doc__": None,
            "__package__": None,
        }
        self.execution_count = 0
        return {"status": "ok", "message": "Kernel reset successfully"}

    def execute(self, code: str):
        self.execution_count += 1
        start_time = time.time()
        stdout_buf = io.StringIO()
        stderr_buf = io.StringIO()
        old_stdout = sys.stdout
        old_stderr = sys.stderr

        sys.stdout = stdout_buf
        sys.stderr = stderr_buf

        error_info = None
        result_payload = None
        plots = []

        try:
            import subprocess
            import importlib
            importlib.invalidate_caches()

            # Separate and execute shell commands (!cmd or %pip) and python statements
            lines = code.split("\n")
            py_lines = []
            
            for line in lines:
                stripped = line.strip()
                if stripped.startswith("!") or stripped.startswith("%pip "):
                    # Flush any pending python code
                    if py_lines:
                        sub_code = "\n".join(py_lines)
                        py_lines = []
                        result_payload = self._exec_ast_block(sub_code)

                    # Execute shell command
                    cmd = stripped[1:] if stripped.startswith("!") else ("python3 -m " + stripped[1:])
                    proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                    if proc.stdout:
                        sys.stdout.write(proc.stdout)
                    if proc.stderr:
                        sys.stderr.write(proc.stderr)
                    importlib.invalidate_caches()
                else:
                    py_lines.append(line)

            if py_lines:
                remaining_code = "\n".join(py_lines)
                if remaining_code.strip():
                    result_payload = self._exec_ast_block(remaining_code)

            # Check for matplotlib plots
            plots = self._extract_matplotlib_plots()

        except Exception as exc:
            # Capture error details
            exc_type, exc_val, exc_tb = sys.exc_info()
            tb_lines = traceback.format_exception(exc_type, exc_val, exc_tb)
            tb_text = "".join(tb_lines)
            
            # Extract line number from traceback
            line_no = None
            for frame in traceback.extract_tb(exc_tb):
                if frame.filename == "<cell>":
                    line_no = frame.lineno
            
            suggestion = self._generate_error_suggestion(exc_type.__name__, str(exc_val))

            error_info = {
                "type": exc_type.__name__,
                "message": str(exc_val),
                "traceback": tb_text,
                "line": line_no,
                "suggestion": suggestion
            }
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr

        elapsed = time.time() - start_time
        stdout_text = stdout_buf.getvalue()
        stderr_text = stderr_buf.getvalue()

        return {
            "execution_count": self.execution_count,
            "stdout": stdout_text,
            "stderr": stderr_text,
            "result": result_payload,
            "plots": plots,
            "error": error_info,
            "elapsed_seconds": round(elapsed, 4)
        }

    def _exec_ast_block(self, sub_code: str):
        parsed_ast = ast.parse(sub_code)
        last_expr = None
        if parsed_ast.body and isinstance(parsed_ast.body[-1], ast.Expr):
            last_expr = parsed_ast.body.pop()
        
        if parsed_ast.body:
            compiled_body = compile(parsed_ast, filename="<cell>", mode="exec")
            exec(compiled_body, self.user_globals)
        
        if last_expr is not None:
            compiled_expr = compile(ast.Expression(body=last_expr.value), filename="<cell>", mode="eval")
            eval_result = eval(compiled_expr, self.user_globals)
            return self._format_result(eval_result)
        return None

    def _format_result(self, val):
        if val is None:
            return None

        val_type = type(val).__name__

        # 1. Pandas DataFrame / Series
        if "DataFrame" in val_type or (hasattr(val, "to_dict") and hasattr(val, "columns")):
            try:
                shape = list(val.shape)
                columns = [str(c) for c in val.columns]
                dtypes = {str(c): str(t) for c, t in val.dtypes.items()}
                # Extract first 50 rows for viewing
                head_df = val.head(50)
                # Replace NaN with None for JSON compatibility
                cleaned = head_df.fillna("NaN").to_dict(orient="records")
                
                summary = {}
                try:
                    num_desc = val.describe().to_dict()
                    summary = {str(k): {str(sk): round(sv, 4) if isinstance(sv, (int, float)) else str(sv) for sk, sv in v.items()} for k, v in num_desc.items()}
                except Exception:
                    pass

                return {
                    "type": "dataframe",
                    "shape": shape,
                    "columns": columns,
                    "dtypes": dtypes,
                    "data": cleaned,
                    "total_rows": shape[0],
                    "total_cols": shape[1],
                    "summary": summary
                }
            except Exception as e:
                return {"type": "text", "value": repr(val)}

        if "Series" in val_type and hasattr(val, "to_frame"):
            try:
                df = val.to_frame()
                return self._format_result(df)
            except Exception:
                pass

        # 2. SymPy expression (LaTeX support)
        if hasattr(val, "free_symbols") or "sympy" in str(type(val)):
            try:
                import sympy as sp
                latex_str = sp.latex(val)
                return {
                    "type": "latex",
                    "latex": latex_str,
                    "text": str(val)
                }
            except Exception:
                pass

        # 3. Plotly figure
        if hasattr(val, "to_json"):
            try:
                return {
                    "type": "plotly",
                    "figure": json.loads(val.to_json())
                }
            except Exception:
                pass

        # 4. Standard types (dict, list, int, float, str, etc.)
        if isinstance(val, (dict, list, tuple, set, int, float, bool)):
            return {
                "type": "repr",
                "value": repr(val),
                "raw_type": val_type
            }

        return {
            "type": "repr",
            "value": repr(val),
            "raw_type": val_type
        }

    def _extract_matplotlib_plots(self):
        plots = []
        try:
            if "matplotlib" in sys.modules or "matplotlib.pyplot" in sys.modules:
                import matplotlib.pyplot as plt
                fignums = plt.get_fignums()
                for num in fignums:
                    fig = plt.figure(num)
                    buf = io.BytesIO()
                    fig.savefig(buf, format="png", bbox_inches="tight", dpi=130)
                    buf.seek(0)
                    img_b64 = base64.b64encode(buf.read()).decode("utf-8")
                    plots.append({
                        "format": "png",
                        "data": f"data:image/png;base64,{img_b64}"
                    })
                    buf.close()
                plt.close("all")
        except Exception as e:
            pass
        return plots

    def _generate_error_suggestion(self, exc_name: str, msg: str):
        if exc_name == "NameError":
            # Extract missing identifier
            import re
            m = re.search(r"name '([^']+)' is not defined", msg)
            if m:
                var = m.group(1)
                return f"Variable or function '{var}' is not defined. Ensure you defined it in this or an earlier cell, and ran that cell first."
            return "Make sure the variable or function is defined before using it."
        elif exc_name == "ModuleNotFoundError" or exc_name == "ImportError":
            import re
            m = re.search(r"No module named '([^']+)'", msg)
            mod = m.group(1) if m else "package"
            return f"Library '{mod}' is not installed. Go to the Libraries panel to install '{mod}' or run '!pip install {mod}'."
        elif exc_name == "SyntaxError":
            return "Check for missing parentheses, colons (:) at the end of if/for/def, or unbalanced quotation marks."
        elif exc_name == "IndentationError":
            return "Python relies on consistent indentation. Check that blocks inside loops, functions, or if-statements are indented with 4 spaces."
        elif exc_name == "TypeError":
            return "Check the types of your arguments or variables (e.g. attempting to add a string and an integer)."
        elif exc_name == "IndexError":
            return "You are accessing an index that is outside the bounds of the list or array."
        elif exc_name == "KeyError":
            return "The requested key does not exist in the dictionary. Use dict.get(key) to avoid KeyError."
        elif exc_name == "ZeroDivisionError":
            return "Division by zero is mathematically undefined. Check the divisor in your calculation."
        return "Review the code above the error line and ensure all variables and syntax are properly configured."

    def get_variables(self):
        variables = []
        excluded_keys = {
            "__name__", "__doc__", "__package__", "__loader__", "__spec__",
            "__annotations__", "__builtins__", "sys", "os", "io", "ast",
            "json", "time", "traceback", "base64"
        }
        
        for k, v in list(self.user_globals.items()):
            if k in excluded_keys or k.startswith("__"):
                continue
            
            var_type = type(v).__name__
            size_preview = ""
            details = {}

            # Check if dataframe
            if "DataFrame" in var_type and hasattr(v, "shape"):
                size_preview = f"{v.shape[0]} × {v.shape[1]}"
                details = {
                    "shape": list(v.shape),
                    "columns": [str(c) for c in v.columns],
                    "memory": f"{v.memory_usage(deep=True).sum() / 1024:.1f} KB" if hasattr(v, "memory_usage") else "N/A"
                }
            elif isinstance(v, (list, tuple, set, dict)):
                size_preview = f"len = {len(v)}"
            elif isinstance(v, (int, float, bool, str)):
                size_preview = str(v) if len(str(v)) < 50 else str(v)[:47] + "..."
            elif hasattr(v, "shape"): # numpy array
                size_preview = f"shape {v.shape}"
            else:
                size_preview = f"<{var_type}>"

            variables.append({
                "name": k,
                "type": var_type,
                "preview": size_preview,
                "details": details
            })

        return variables


def main():
    kernel = PythonKernel()
    
    # Ready signal
    sys.stdout.write(json.dumps({"status": "ready"}) + "\n")
    sys.stdout.flush()

    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            action = req.get("action")
            
            if action == "execute":
                code = req.get("code", "")
                result = kernel.execute(code)
                sys.stdout.write(json.dumps({"status": "success", "data": result}) + "\n")
                sys.stdout.flush()
            elif action == "get_variables":
                vars_list = kernel.get_variables()
                sys.stdout.write(json.dumps({"status": "success", "variables": vars_list}) + "\n")
                sys.stdout.flush()
            elif action == "reset":
                res = kernel.reset()
                sys.stdout.write(json.dumps(res) + "\n")
                sys.stdout.flush()
            elif action == "ping":
                sys.stdout.write(json.dumps({"status": "pong"}) + "\n")
                sys.stdout.flush()
            else:
                sys.stdout.write(json.dumps({"status": "error", "message": f"Unknown action {action}"}) + "\n")
                sys.stdout.flush()
        except Exception as e:
            sys.stdout.write(json.dumps({"status": "error", "message": str(e)}) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
