import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import type { Submission } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const SubmissionList: React.FC = () => {
  const { classId } = useParams<{ classId?: string }>();
  const [searchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskTitle, setTaskTitle] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, searchParams.toString()]); // 监听classId和查询参数变化

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const taskIdParam = searchParams.get("task_id");
      const taskId = taskIdParam ? Number(taskIdParam) : undefined;
      
      let data;
      if (classId) {
        // 从班级查看提交，可以按任务筛选
        data = await api.getClassSubmissions(Number(classId), taskId);
      } else {
        // 学生查看自己的提交，可以按任务筛选
        data = await api.getMySubmissions(taskId);
      }
      
      setSubmissions(data);
      
      // 如果指定了task_id，尝试获取任务标题用于显示
      if (taskId && data.length > 0) {
        setTaskTitle(data[0].task_title);
      } else {
        setTaskTitle("");
      }
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

      <h2>
        提交记录
        {taskTitle && (
          <span style={{ fontSize: "18px", color: "#6c757d", fontWeight: "normal", marginLeft: "10px" }}>
            - {taskTitle}
          </span>
        )}
      </h2>
      {submissions.length === 0 ? (
        <p>{taskTitle ? `该任务暂无提交记录` : "暂无提交记录"}</p>
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

