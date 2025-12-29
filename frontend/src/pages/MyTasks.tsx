import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Task } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getStudentTasks();
      setTasks(data);
    } catch (error: any) {
      console.error("加载任务失败:", error);
      alert(getErrorMessage(error, "加载任务列表失败"));
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>我的任务</h2>
      <div>
        {tasks.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              border: "2px dashed #ddd",
              borderRadius: "8px",
              backgroundColor: "#f8f9fa",
            }}
          >
            <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>暂无任务</h3>
            <p style={{ color: "#6c757d" }}>您还没有加入任何班级，或者班级中还没有任务</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>
                <Link
                  to={`/tasks/${task.id}/editor`}
                  style={{ textDecoration: "none", color: "#007bff" }}
                >
                  {task.title}
                </Link>
              </h3>
              <p>{task.description.length > 100 ? task.description.substring(0, 100) + "..." : task.description}</p>
              <p>
                <strong>班级:</strong> {task.class_name}
              </p>
              <p>
                <strong>语言:</strong> {task.language === "java" ? "Java" : "Python"}
              </p>
              {task.deadline && (
                <p>
                  <strong>截止时间:</strong> {new Date(task.deadline).toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

