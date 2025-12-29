import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const CodeEditor: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<"java" | "python">("java");
  const [testResults, setTestResults] = useState<any>(null);
  const [testTime, setTestTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisContent, setAnalysisContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentTask(Number(taskId));
      setTask(data);
      setLanguage(data.language);
      setCode(getDefaultCode(data));
    } catch (error: any) {
      console.error("加载任务失败:", error);
      alert(getErrorMessage(error, "加载任务失败"));
      navigate("/my-tasks");
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCode = (task: Task): string => {
    // Python和Java代码始终使用函数模式（LeetCode风格）
    if (task.language === "python" || task.language === "java" || task.solution_mode === "function") {
      // 函数模式
      if (task.template_code) {
        return task.template_code;
      }
      
      // 如果没有模板代码，生成默认的函数框架
      const functionName = task.function_name || (task.language === "java" ? "solution" : "solve");
      
      if (task.language === "python") {
        return `def ${functionName}(nums, target):
    # 在这里编写你的代码
    # 只需要实现函数逻辑，不需要处理输入输出
    pass
`;
      } else if (task.language === "java") {
        // 根据函数名和任务情况，使用更通用的参数名
        // 对于两数之和等简单任务，使用 int a, int b
        return `public static int ${functionName}(int a, int b) {
    // 在这里编写你的代码
    // 只需要实现方法逻辑，不需要处理输入输出（不需要main方法和Scanner）
    // 例如：return a + b;
    return 0;
}`;
      }
    }
    
    // 其他语言或完整程序模式（向后兼容）
    if (task.language === "java") {
      return `public class Solution {
    public static void main(String[] args) {
        // 在这里编写你的代码
        
    }
}`;
    } else {
      return `# 在这里编写你的代码

`;
    }
  };

  const handleTest = async () => {
    if (!code.trim()) {
      alert("请输入代码");
      return;
    }
    setTesting(true);
    setTestResults(null);
    setTestTime(new Date().toLocaleString());
    try {
      const result = await api.testCode(Number(taskId), code, language);
      setTestResults(result);
    } catch (error: any) {
      alert(getErrorMessage(error, "测试代码失败"));
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("请输入代码");
      return;
    }
    if (!confirm("确定要提交吗？提交后将无法修改。")) {
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.submitCode(Number(taskId), code, language);
      alert("提交成功！");
      if (result.submission && result.submission.id) {
        navigate(`/submissions/${result.submission.id}`);
      } else {
        navigate("/my-tasks");
      }
    } catch (error: any) {
      alert(getErrorMessage(error, "提交代码失败"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalysis = async () => {
    if (!code.trim()) {
      alert("请输入代码");
      return;
    }
    setAnalyzing(true);
    setAnalysisContent("");
    setShowAnalysis(true);
    try {
      const result = await api.getCodeAnalysis(Number(taskId), code);
      if (result.success && result.analysis) {
        setAnalysisContent(result.analysis);
      } else {
        alert(getErrorMessage({ response: { data: result } }, "获取解析失败"));
        setShowAnalysis(false);
      }
    } catch (error: any) {
      alert(getErrorMessage(error, "获取解析失败"));
      setShowAnalysis(false);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !task) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          fontSize: "var(--font-size-lg, 18px)",
          color: "var(--text-secondary, #6b7280)",
        }}>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 80px)",
      backgroundColor: "var(--bg-secondary, #f9fafb)",
      position: "relative",
    }}>
      {/* 全屏Loading遮罩 */}
      {testing && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: "var(--bg-primary, #ffffff)",
            padding: "40px 60px",
            borderRadius: "var(--radius-lg, 8px)",
            boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))",
            textAlign: "center",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--border-color, #e5e7eb)",
              borderTopColor: "var(--primary-color, #1e40af)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 20px",
            }}></div>
            <div style={{
              fontSize: "var(--font-size-lg, 18px)",
              fontWeight: 500,
              color: "var(--text-primary, #1f2937)",
              marginBottom: "8px",
            }}>
              正在测试代码...
            </div>
            <div style={{
              fontSize: "var(--font-size-sm, 14px)",
              color: "var(--text-secondary, #6b7280)",
            }}>
              请稍候，正在执行测试用例
            </div>
          </div>
        </div>
      )}
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ padding: "10px", borderBottom: "1px solid #ddd", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ margin: 0 }}>{task.title}</h3>
            {task.solution_mode === "function" && (
              <span style={{
                padding: "4px 12px",
                backgroundColor: "var(--info-light, #cffafe)",
                color: "var(--info-hover, #0e7490)",
                borderRadius: "var(--radius-sm, 4px)",
                fontSize: "var(--font-size-xs, 12px)",
                fontWeight: 500,
              }}>
                LeetCode模式
              </span>
            )}
          </div>
          {(task.language === "python" || task.language === "java" || task.solution_mode === "function") && (
            <div style={{
              padding: "10px",
              backgroundColor: "var(--info-light, #cffafe)",
              borderRadius: "var(--radius-md, 6px)",
              marginBottom: "10px",
              fontSize: "var(--font-size-sm, 14px)",
              color: "var(--info-hover, #0e7490)",
            }}>
              💡 提示：您只需要编写函数/方法代码，系统会自动处理输入输出和测试。
              {task.function_name && (
                <span>函数/方法名称为 <strong>{task.function_name}</strong>。</span>
              )}
              <span>系统会使用老师设置的测试用例的输入和输出进行自动测试。您不需要编写main方法或处理输入输出。</span>
            </div>
          )}
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={handleTest}
              disabled={testing}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--success-color, #059669)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md, 6px)",
                cursor: testing ? "not-allowed" : "pointer",
                marginRight: "10px",
                fontSize: "var(--font-size-base, 16px)",
                fontWeight: 500,
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!testing) {
                  e.currentTarget.style.backgroundColor = "var(--success-hover, #047857)";
                }
              }}
              onMouseLeave={(e) => {
                if (!testing) {
                  e.currentTarget.style.backgroundColor = "var(--success-color, #059669)";
                }
              }}
            >
              {testing ? "测试中..." : "测试"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || testing}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--primary-color, #1e40af)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md, 6px)",
                cursor: (submitting || testing) ? "not-allowed" : "pointer",
                fontSize: "var(--font-size-base, 16px)",
                fontWeight: 500,
                transition: "background-color 0.2s ease",
                marginRight: "10px",
              }}
              onMouseEnter={(e) => {
                if (!submitting && !testing) {
                  e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting && !testing) {
                  e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)";
                }
              }}
            >
              {submitting ? "提交中..." : "提交"}
            </button>
            <button
              onClick={handleAnalysis}
              disabled={analyzing || testing || submitting}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--warning-color, #f59e0b)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md, 6px)",
                cursor: (analyzing || testing || submitting) ? "not-allowed" : "pointer",
                fontSize: "var(--font-size-base, 16px)",
                fontWeight: 500,
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!analyzing && !testing && !submitting) {
                  e.currentTarget.style.backgroundColor = "var(--warning-hover, #d97706)";
                }
              }}
              onMouseLeave={(e) => {
                if (!analyzing && !testing && !submitting) {
                  e.currentTarget.style.backgroundColor = "var(--warning-color, #f59e0b)";
                }
              }}
            >
              {analyzing ? "分析中..." : "查看解析"}
            </button>
          </div>
        </div>
        <div style={{ 
          flex: testResults ? "1 1 50%" : "1 1 100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        {testResults && (
          <div
            style={{
              flex: "1 1 50%",
              minHeight: 0,
              padding: "20px",
              backgroundColor: "var(--bg-primary, #ffffff)",
              borderTop: "2px solid var(--border-color, #e5e7eb)",
              overflow: "auto",
              boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--border-color, #e5e7eb)",
            }}>
              <h4 style={{
                marginTop: 0,
                marginBottom: "12px",
                color: "var(--text-primary, #1f2937)",
                fontSize: "var(--font-size-lg, 18px)",
              }}>
                测试结果
              </h4>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                fontSize: "var(--font-size-sm, 14px)",
              }}>
                <div>
                  <span style={{ color: "var(--text-secondary, #6b7280)", fontWeight: 500 }}>学生姓名：</span>
                  <span style={{ color: "var(--text-primary, #1f2937)", marginLeft: "8px" }}>
                    {user?.username || "未知"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary, #6b7280)", fontWeight: 500 }}>任务名称：</span>
                  <span style={{ color: "var(--text-primary, #1f2937)", marginLeft: "8px" }}>
                    {task?.title || "未知"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary, #6b7280)", fontWeight: 500 }}>测试时间：</span>
                  <span style={{ color: "var(--text-primary, #1f2937)", marginLeft: "8px" }}>
                    {testTime || "未知"}
                  </span>
                </div>
                {user?.email && (
                  <div>
                    <span style={{ color: "var(--text-secondary, #6b7280)", fontWeight: 500 }}>邮箱：</span>
                    <span style={{ color: "var(--text-primary, #1f2937)", marginLeft: "8px" }}>
                      {user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div style={{
              padding: "12px",
              marginBottom: "16px",
              backgroundColor: testResults.passed_count === testResults.total_count 
                ? "var(--success-light, #d1fae5)" 
                : "var(--warning-light, #fef3c7)",
              borderRadius: "var(--radius-md, 6px)",
              border: `1px solid ${testResults.passed_count === testResults.total_count 
                ? "var(--success-color, #059669)" 
                : "var(--warning-color, #d97706)"}`,
            }}>
              <p style={{
                margin: 0,
                fontSize: "var(--font-size-base, 16px)",
                fontWeight: 500,
                color: testResults.passed_count === testResults.total_count 
                  ? "var(--success-hover, #047857)" 
                  : "var(--warning-hover, #b45309)",
              }}>
                通过: {testResults.passed_count} / {testResults.total_count}
                {testResults.total_time && (
                  <span style={{ marginLeft: "16px", fontSize: "var(--font-size-sm, 14px)" }}>
                    耗时: {testResults.total_time.toFixed(2)}秒
                  </span>
                )}
              </p>
            </div>
            {testResults.test_results && testResults.test_results.length > 0 ? (
              testResults.test_results.map((result: any, index: number) => (
                <div
                  key={result.test_case_id || index}
                  style={{
                    marginBottom: "16px",
                    padding: "16px",
                    backgroundColor: result.passed ? "var(--success-light, #d1fae5)" : "var(--danger-light, #fee2e2)",
                    borderRadius: "var(--radius-md, 6px)",
                    border: `1px solid ${result.passed 
                      ? "var(--success-color, #059669)" 
                      : "var(--danger-color, #dc2626)"}`,
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}>
                    <strong style={{
                      fontSize: "var(--font-size-base, 16px)",
                      color: result.passed 
                        ? "var(--success-hover, #047857)" 
                        : "var(--danger-hover, #b91c1c)",
                    }}>
                      测试用例 {index + 1}:
                    </strong>
                    <span style={{
                      marginLeft: "12px",
                      padding: "4px 12px",
                      backgroundColor: result.passed 
                        ? "var(--success-color, #059669)" 
                        : "var(--danger-color, #dc2626)",
                      color: "white",
                      borderRadius: "var(--radius-sm, 4px)",
                      fontSize: "var(--font-size-xs, 12px)",
                      fontWeight: 500,
                    }}>
                      {result.passed ? "✓ 通过" : "✗ 失败"}
                    </span>
                  </div>
                  
                  {result.input_data && (
                    <div style={{ marginBottom: "8px" }}>
                      <strong style={{ color: "var(--text-primary, #1f2937)", fontSize: "var(--font-size-sm, 14px)" }}>
                        输入:
                      </strong>
                      <div style={{
                        marginTop: "4px",
                        padding: "8px",
                        backgroundColor: "rgba(0,0,0,0.05)",
                        borderRadius: "var(--radius-sm, 4px)",
                        fontFamily: "monospace",
                        fontSize: "var(--font-size-sm, 14px)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                      }}>
                        {result.input_data}
                      </div>
                    </div>
                  )}
                  
                  {result.expected_output && (
                    <div style={{ marginBottom: "12px" }}>
                      <strong style={{ color: "var(--text-primary, #1f2937)", fontSize: "var(--font-size-sm, 14px)" }}>
                        期望输出:
                      </strong>
                      <div style={{
                        marginTop: "4px",
                        padding: "8px",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        borderRadius: "var(--radius-sm, 4px)",
                        fontFamily: "monospace",
                        fontSize: "var(--font-size-sm, 14px)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        color: "var(--primary-color, #1e40af)",
                      }}>
                        {result.expected_output}
                      </div>
                    </div>
                  )}
                  
                  {/* 实际输出 - 紧跟在期望输出后面 */}
                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ color: "var(--text-primary, #1f2937)", fontSize: "var(--font-size-sm, 14px)" }}>
                      实际输出:
                    </strong>
                    <div style={{
                      marginTop: "4px",
                      padding: "8px",
                      backgroundColor: result.passed 
                        ? "rgba(5, 150, 105, 0.1)" 
                        : "rgba(220, 38, 38, 0.1)",
                      borderRadius: "var(--radius-sm, 4px)",
                      fontFamily: "monospace",
                      fontSize: "var(--font-size-sm, 14px)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      color: result.passed 
                        ? "var(--success-hover, #047857)" 
                        : "var(--danger-hover, #b91c1c)",
                      minHeight: "24px",
                    }}>
                      {result.stdout || result.output || (result.passed ? "(无输出)" : "(无输出或输出为空)")}
                    </div>
                  </div>
                  
                  {/* 错误信息 - 显示所有可能的错误信息 */}
                  {(result.error || result.error_message || result.stderr || result.compile_output || result.details) && (
                    <div style={{ marginTop: "12px", marginBottom: "8px" }}>
                      <strong style={{
                        color: "var(--danger-color, #dc2626)",
                        fontSize: "var(--font-size-sm, 14px)",
                        display: "block",
                        marginBottom: "8px",
                      }}>
                        错误信息:
                      </strong>
                      
                      {/* 主要错误信息 */}
                      {result.error && (
                        <div style={{
                          marginBottom: "8px",
                          padding: "10px",
                          backgroundColor: "rgba(220, 38, 38, 0.1)",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontFamily: "monospace",
                          fontSize: "var(--font-size-sm, 14px)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          color: "var(--danger-hover, #b91c1c)",
                        }}>
                          <strong style={{ display: "block", marginBottom: "4px", fontSize: "var(--font-size-xs, 12px)" }}>
                            [错误]:
                          </strong>
                          {result.error}
                          {result.details && (
                            <>
                              <br />
                              <strong style={{ fontSize: "var(--font-size-xs, 12px)", display: "block", marginTop: "4px" }}>
                                [详细信息]:
                              </strong>
                              <div style={{ fontSize: "var(--font-size-xs, 12px)", marginTop: "4px" }}>
                                {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      
                      {result.error_message && (
                        <div style={{
                          marginBottom: "8px",
                          padding: "10px",
                          backgroundColor: "rgba(220, 38, 38, 0.1)",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontFamily: "monospace",
                          fontSize: "var(--font-size-sm, 14px)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          color: "var(--danger-hover, #b91c1c)",
                        }}>
                          <strong style={{ display: "block", marginBottom: "4px", fontSize: "var(--font-size-xs, 12px)" }}>
                            [错误消息]:
                          </strong>
                          {result.error_message}
                        </div>
                      )}
                      
                      {/* 编译错误 */}
                      {result.compile_output && (
                        <div style={{
                          marginBottom: "8px",
                          padding: "10px",
                          backgroundColor: "rgba(217, 119, 6, 0.1)",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontFamily: "monospace",
                          fontSize: "var(--font-size-sm, 14px)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          color: "var(--warning-hover, #b45309)",
                        }}>
                          <strong style={{ display: "block", marginBottom: "4px", fontSize: "var(--font-size-xs, 12px)" }}>
                            [编译错误]:
                          </strong>
                          {result.compile_output}
                        </div>
                      )}
                      
                      {/* 标准错误输出 */}
                      {result.stderr && (
                        <div style={{
                          marginBottom: "8px",
                          padding: "10px",
                          backgroundColor: "rgba(220, 38, 38, 0.1)",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontFamily: "monospace",
                          fontSize: "var(--font-size-sm, 14px)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          color: "var(--danger-hover, #b91c1c)",
                        }}>
                          <strong style={{ display: "block", marginBottom: "4px", fontSize: "var(--font-size-xs, 12px)" }}>
                            [标准错误输出]:
                          </strong>
                          {result.stderr}
                        </div>
                      )}
                      
                      {/* 详细信息 */}
                      {result.details && (
                        <div style={{
                          marginBottom: "8px",
                          padding: "10px",
                          backgroundColor: "rgba(107, 114, 128, 0.1)",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontFamily: "monospace",
                          fontSize: "var(--font-size-xs, 12px)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          color: "var(--text-secondary, #6b7280)",
                        }}>
                          <strong style={{ display: "block", marginBottom: "4px", fontSize: "var(--font-size-xs, 12px)" }}>
                            [详细信息]:
                          </strong>
                          {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {result.time_used && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "var(--font-size-xs, 12px)",
                      color: "var(--text-secondary, #6b7280)",
                    }}>
                      执行时间: {typeof result.time_used === 'number' ? result.time_used.toFixed(2) : result.time_used}秒
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                padding: "16px",
                textAlign: "center",
                color: "var(--text-secondary, #6b7280)",
              }}>
                暂无测试结果
              </div>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          width: "400px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderLeft: "1px solid #ddd",
          overflow: "auto",
        }}
      >
        <h3>任务描述</h3>
        <div style={{ whiteSpace: "pre-wrap", marginTop: "15px", marginBottom: "20px" }}>{task.description}</div>
        
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <strong>编程语言:</strong> {language === "java" ? "Java" : "Python"}
        </div>
        
        {task.deadline && (
          <div style={{ marginTop: "10px", marginBottom: "20px" }}>
            <strong>截止时间:</strong> {new Date(task.deadline).toLocaleString()}
          </div>
        )}

        {/* 测试用例部分 */}
        {task.test_cases && task.test_cases.length > 0 && (
          <div style={{ marginTop: "30px", borderTop: "2px solid #ddd", paddingTop: "20px" }}>
            <h3 style={{ marginBottom: "15px", color: "#007bff" }}>测试用例</h3>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
              以下是用于测试的输入和预期输出，点击"测试"按钮时会使用这些测试用例进行验证。
            </div>
            {task.test_cases.map((testCase, index) => (
              <div
                key={testCase.id || index}
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ 
                  fontSize: "16px", 
                  fontWeight: "bold", 
                  marginBottom: "10px",
                  color: "#495057",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <span style={{
                    display: "inline-block",
                    width: "24px",
                    height: "24px",
                    lineHeight: "24px",
                    textAlign: "center",
                    backgroundColor: "#007bff",
                    color: "white",
                    borderRadius: "50%",
                    marginRight: "8px",
                    fontSize: "12px"
                  }}>
                    {index + 1}
                  </span>
                  测试用例 {index + 1}
                </div>
                
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ 
                    fontWeight: "600", 
                    color: "#495057", 
                    marginBottom: "5px",
                    fontSize: "14px"
                  }}>
                    输入:
                  </div>
                  <div style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    color: "#212529"
                  }}>
                    {testCase.input_data || "(无)"}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontWeight: "600", 
                    color: "#495057", 
                    marginBottom: "5px",
                    fontSize: "14px"
                  }}>
                    预期输出:
                  </div>
                  <div style={{
                    padding: "10px",
                    backgroundColor: "#e7f3ff",
                    border: "1px solid #b3d9ff",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    color: "#004085"
                  }}>
                    {testCase.expected_output || "(无)"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {(!task.test_cases || task.test_cases.length === 0) && (
          <div style={{ 
            marginTop: "30px", 
            padding: "15px", 
            backgroundColor: "#fff3cd", 
            border: "1px solid #ffc107",
            borderRadius: "4px",
            color: "#856404"
          }}>
            <strong>提示:</strong> 该任务暂无测试用例。
          </div>
        )}
      </div>
      
      {/* 解析模态框 */}
      {showAnalysis && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }} onClick={() => setShowAnalysis(false)}>
          <div style={{
            backgroundColor: "var(--bg-primary, #ffffff)",
            borderRadius: "var(--radius-lg, 12px)",
            boxShadow: "var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))",
            maxWidth: "800px",
            width: "90%",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
          }} onClick={(e) => e.stopPropagation()}>
            {/* 模态框头部 */}
            <div style={{
              padding: "20px",
              borderBottom: "1px solid var(--border-color, #e5e7eb)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h2 style={{
                margin: 0,
                fontSize: "var(--font-size-xl, 20px)",
                fontWeight: 600,
                color: "var(--text-primary, #1f2937)",
              }}>
                💡 题目解析
              </h2>
              <button
                onClick={() => setShowAnalysis(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "var(--text-secondary, #6b7280)",
                  padding: "0",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary, #f9fafb)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                ×
              </button>
            </div>
            
            {/* 模态框内容 */}
            <div style={{
              padding: "24px",
              overflowY: "auto",
              flex: 1,
            }}>
              {analyzing ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px",
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid var(--border-color, #e5e7eb)",
                    borderTopColor: "var(--warning-color, #f59e0b)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 20px",
                  }}></div>
                  <div style={{
                    fontSize: "var(--font-size-base, 16px)",
                    color: "var(--text-secondary, #6b7280)",
                  }}>
                    AI正在分析题目和您的代码...
                  </div>
                </div>
              ) : analysisContent ? (
                <div style={{
                  fontSize: "var(--font-size-base, 16px)",
                  lineHeight: 1.8,
                  color: "var(--text-primary, #1f2937)",
                  whiteSpace: "pre-wrap",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}>
                  {analysisContent}
                </div>
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-secondary, #6b7280)",
                }}>
                  暂无解析内容
                </div>
              )}
            </div>
            
            {/* 模态框底部 */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--border-color, #e5e7eb)",
              display: "flex",
              justifyContent: "flex-end",
            }}>
              <button
                onClick={() => setShowAnalysis(false)}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "var(--primary-color, #1e40af)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-md, 6px)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-base, 16px)",
                  fontWeight: 500,
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)";
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

