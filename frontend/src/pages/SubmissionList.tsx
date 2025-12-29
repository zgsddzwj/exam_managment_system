import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Submission } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const SubmissionList: React.FC = () => {
  const { taskId, classId } = useParams<{ taskId?: string; classId?: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubmissions();
  }, [taskId, classId]);

  const loadSubmissions = async () => {
    try {
      let data;
      if (classId) {
        data = await api.getClassSubmissions(Number(classId), taskId ? Number(taskId) : undefined);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const taskIdParam = urlParams.get("task_id");
        data = await api.getMySubmissions(taskIdParam ? Number(taskIdParam) : (taskId ? Number(taskId) : undefined));
      }
      setSubmissions(data);
    } catch (error: any) {
      console.error("加载提交失败:", error);
      alert(getErrorMessage(error, "加载提交记录失败"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>加载中...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          返回
        </button>
      </div>

      <h2>提交记录</h2>
      {submissions.length === 0 ? (
        <p>暂无提交记录</p>
      ) : (
        <div>
          {submissions.map((submission) => (
            <div
              key={submission.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <h4>
                  <Link to={`/submissions/${submission.id}`}>
                    {submission.task_title} - {submission.student_name}
                  </Link>
                </h4>
                <span
                  style={{
                    padding: "5px 10px",
                    backgroundColor: submission.score >= 60 ? "#28a745" : "#dc3545",
                    color: "white",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  {submission.score.toFixed(2)}分
                </span>
              </div>
              <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                <span>
                  <strong>语言:</strong> {submission.language === "java" ? "Java" : "Python"}
                </span>
                <span>
                  <strong>测试次数:</strong> {submission.test_count}
                </span>
                <span>
                  <strong>耗时:</strong> {submission.total_time.toFixed(2)}秒
                </span>
                <span>
                  <strong>提交时间:</strong> {new Date(submission.submitted_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

