import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import type { Task } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await api.getTask(Number(id));
      setTask(data);
    } catch (error: any) {
      console.error("加载任务失败:", error);
      alert(getErrorMessage(error, "加载任务详情失败"));
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#6c757d" }}>加载中...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ padding: "20px" }}>
        <p>任务不存在</p>
        <button onClick={() => navigate("/tasks")}>返回任务列表</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/tasks")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          返回任务列表
        </button>
        <Link
          to={`/submissions/classes/${task.class_obj}?task_id=${task.id}`}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            marginRight: "10px",
            display: "inline-block",
          }}
        >
          查看提交
        </Link>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "30px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "28px", color: "#333" }}>{task.title}</h1>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "15px", fontSize: "14px", color: "#666" }}>
            <span>
              <strong>所属班级:</strong> {task.class_name}
            </span>
            <span>
              <strong>编程语言:</strong>{" "}
              <span
                style={{
                  padding: "4px 12px",
                  backgroundColor: task.language === "java" ? "#f8d7da" : "#d4edda",
                  borderRadius: "4px",
                  fontWeight: "bold",
                }}
              >
                {task.language === "java" ? "Java" : "Python"}
              </span>
            </span>
            <span>
              <strong>创建者:</strong> {task.created_by_name}
            </span>
            <span>
              <strong>测试用例数量:</strong> {task.test_case_count || 0}
            </span>
            {task.deadline && (
              <span>
                <strong>截止时间:</strong> {new Date(task.deadline).toLocaleString()}
              </span>
            )}
            <span>
              <strong>创建时间:</strong> {new Date(task.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#333", borderLeft: "4px solid #007bff", paddingLeft: "10px" }}>
            任务描述
          </h2>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
              fontSize: "15px",
              color: "#555",
            }}
          >
            {task.description}
          </div>
        </div>

        {task.test_cases && task.test_cases.length > 0 && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#333", borderLeft: "4px solid #28a745", paddingLeft: "10px" }}>
              测试用例 ({task.test_cases.length})
            </h2>
            <div>
              {task.test_cases.map((testCase, index) => (
                <div
                  key={testCase.id || index}
                  style={{
                    marginBottom: "20px",
                    padding: "20px",
                    backgroundColor: "#ffffff",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      marginBottom: "15px",
                      color: "#495057",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "32px",
                          height: "32px",
                          lineHeight: "32px",
                          textAlign: "center",
                          backgroundColor: "#007bff",
                          color: "white",
                          borderRadius: "50%",
                          marginRight: "12px",
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </span>
                      测试用例 {index + 1}
                    </div>
                    {testCase.is_hidden && (
                      <span
                        style={{
                          padding: "4px 12px",
                          backgroundColor: "#ffc107",
                          color: "#856404",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        隐藏测试
                      </span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#495057",
                          marginBottom: "8px",
                          fontSize: "14px",
                        }}
                      >
                        输入数据:
                      </div>
                      <div
                        style={{
                          padding: "15px",
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #e9ecef",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                          fontSize: "14px",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          color: "#212529",
                          minHeight: "60px",
                        }}
                      >
                        {testCase.input_data || "(无)"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#495057",
                          marginBottom: "8px",
                          fontSize: "14px",
                        }}
                      >
                        期望输出:
                      </div>
                      <div
                        style={{
                          padding: "15px",
                          backgroundColor: "#e7f3ff",
                          border: "1px solid #b3d9ff",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                          fontSize: "14px",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          color: "#004085",
                          minHeight: "60px",
                        }}
                      >
                        {testCase.expected_output || "(无)"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "30px", fontSize: "13px", color: "#6c757d" }}>
                    <span>
                      <strong>权重:</strong> {testCase.weight}
                    </span>
                    <span>
                      <strong>排序:</strong> {testCase.order}
                    </span>
                    <span>
                      <strong>创建时间:</strong> {new Date(testCase.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!task.test_cases || task.test_cases.length === 0) && (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "6px",
              color: "#856404",
            }}
          >
            <strong>提示:</strong> 该任务暂无测试用例。
          </div>
        )}
      </div>
    </div>
  );
};

