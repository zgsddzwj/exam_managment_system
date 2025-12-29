import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { api } from "../services/api";
import type { Task } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const CodeEditor: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<"java" | "python">("java");
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      setCode(getDefaultCode(data.language));
    } catch (error: any) {
      console.error("加载任务失败:", error);
      alert(getErrorMessage(error, "加载任务失败"));
      navigate("/my-tasks");
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCode = (lang: "java" | "python"): string => {
    if (lang === "java") {
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
    setLoading(true);
    setTestResults(null);
    try {
      const result = await api.testCode(Number(taskId), code, language);
      setTestResults(result);
    } catch (error: any) {
      alert(getErrorMessage(error, "测试代码失败"));
    } finally {
      setLoading(false);
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

  if (loading || !task) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#6c757d" }}>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 100px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
          <h3>{task.title}</h3>
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={handleTest}
              disabled={loading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                marginRight: "10px",
              }}
            >
              {loading ? "测试中..." : "测试"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "提交中..." : "提交"}
            </button>
          </div>
        </div>
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
        {testResults && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderTop: "1px solid #ddd",
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            <h4>测试结果</h4>
            <p>
              通过: {testResults.passed_count} / {testResults.total_count}
            </p>
            {testResults.test_results?.map((result: any, index: number) => (
              <div
                key={index}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  backgroundColor: result.passed ? "#d4edda" : "#f8d7da",
                  borderRadius: "4px",
                }}
              >
                <strong>测试用例 {index + 1}:</strong> {result.passed ? "通过" : "失败"}
                {(result.error_message || result.error || result.stderr) && (
                  <div style={{ color: "red", marginTop: "5px" }}>
                    <strong>错误:</strong> {result.error_message || result.error || result.stderr}
                  </div>
                )}
                {(result.output || result.stdout) && (
                  <div style={{ marginTop: "5px" }}>
                    <strong>输出:</strong> {result.output || result.stdout}
                  </div>
                )}
                {result.expected_output && (
                  <div style={{ marginTop: "5px", color: "#666" }}>
                    <strong>期望输出:</strong> {result.expected_output}
                  </div>
                )}
              </div>
            ))}
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
    </div>
  );
};

