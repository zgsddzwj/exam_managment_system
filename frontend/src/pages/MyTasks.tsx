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

  if (loading) return <div>加载中...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>我的任务</h2>
      <div>
        {tasks.length === 0 ? (
          <p>暂无任务</p>
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
              <p>{task.description.substring(0, 100)}...</p>
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

