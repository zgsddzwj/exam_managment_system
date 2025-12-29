import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

interface TaskStatisticsData {
  task: {
    id: number;
    title: string;
    class_name: string;
    class_id: number;
  };
  summary: {
    total_students: number;
    submitted_count: number;
    not_submitted_count: number;
    submission_rate: number;
    average_score: number;
  };
  statistics: Array<{
    student_id: number;
    student_username: string;
    student_email: string;
    student_first_name: string;
    student_last_name: string;
    has_submitted: boolean;
    submission_id: number | null;
    score: number;
    test_count: number;
    total_time: number;
    submitted_at: string | null;
    language: string | null;
  }>;
}

export const TaskStatistics: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TaskStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taskId) {
      loadStatistics();
    }
  }, [taskId]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.getTaskStatistics(Number(taskId));
      setData(response);
    } catch (err: any) {
      setError(getErrorMessage(err, "加载统计数据失败"));
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (stat: TaskStatisticsData["statistics"][0]) => {
    const fullName = `${stat.student_first_name} ${stat.student_last_name}`.trim();
    return fullName || stat.student_username;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}秒`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}分${secs}秒`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${hours}小时${minutes}分${secs}秒`;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "var(--radius-md, 6px)",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
        <button
          onClick={() => navigate("/tasks")}
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--primary-color, #1e40af)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md, 6px)",
            cursor: "pointer",
          }}
        >
          返回任务列表
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div>暂无数据</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* 头部 */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h1
            style={{
              fontSize: "var(--font-size-2xl, 24px)",
              fontWeight: 600,
              color: "var(--text-primary, #1f2937)",
              margin: 0,
            }}
          >
            任务统计
          </h1>
          <Link
            to="/tasks"
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--bg-tertiary, #f3f4f6)",
              color: "var(--text-primary, #1f2937)",
              textDecoration: "none",
              borderRadius: "var(--radius-md, 6px)",
              fontSize: "var(--font-size-sm, 14px)",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border-color, #e5e7eb)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary, #f3f4f6)")}
          >
            返回任务列表
          </Link>
        </div>
        <div
          style={{
            padding: "16px",
            backgroundColor: "white",
            borderRadius: "var(--radius-lg, 8px)",
            boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-size-xl, 20px)",
              fontWeight: 600,
              color: "var(--text-primary, #1f2937)",
              margin: "0 0 12px 0",
            }}
          >
            {data.task.title}
          </h2>
          <p style={{ color: "var(--text-secondary, #6b7280)", margin: 0 }}>
            班级：{data.task.class_name}
          </p>
        </div>
      </div>

      {/* 统计摘要 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "var(--radius-lg, 8px)",
            boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm, 14px)", color: "var(--text-secondary, #6b7280)", marginBottom: "8px" }}>
            总学生数
          </div>
          <div style={{ fontSize: "var(--font-size-2xl, 24px)", fontWeight: 600, color: "var(--text-primary, #1f2937)" }}>
            {data.summary.total_students}
          </div>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "var(--radius-lg, 8px)",
            boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm, 14px)", color: "var(--text-secondary, #6b7280)", marginBottom: "8px" }}>
            已提交
          </div>
          <div style={{ fontSize: "var(--font-size-2xl, 24px)", fontWeight: 600, color: "var(--success-color, #059669)" }}>
            {data.summary.submitted_count}
          </div>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "var(--radius-lg, 8px)",
            boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm, 14px)", color: "var(--text-secondary, #6b7280)", marginBottom: "8px" }}>
            未提交
          </div>
          <div style={{ fontSize: "var(--font-size-2xl, 24px)", fontWeight: 600, color: "var(--warning-color, #d97706)" }}>
            {data.summary.not_submitted_count}
          </div>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "var(--radius-lg, 8px)",
            boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm, 14px)", color: "var(--text-secondary, #6b7280)", marginBottom: "8px" }}>
            提交率
          </div>
          <div style={{ fontSize: "var(--font-size-2xl, 24px)", fontWeight: 600, color: "var(--primary-color, #1e40af)" }}>
            {data.summary.submission_rate.toFixed(1)}%
          </div>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "var(--radius-lg, 8px)",
            boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm, 14px)", color: "var(--text-secondary, #6b7280)", marginBottom: "8px" }}>
            平均分
          </div>
          <div style={{ fontSize: "var(--font-size-2xl, 24px)", fontWeight: 600, color: "var(--primary-color, #1e40af)" }}>
            {data.summary.average_score.toFixed(1)}
          </div>
        </div>
      </div>

      {/* 学生作答表格 */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "var(--radius-lg, 8px)",
          boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color, #e5e7eb)" }}>
          <h2
            style={{
              fontSize: "var(--font-size-lg, 18px)",
              fontWeight: 600,
              color: "var(--text-primary, #1f2937)",
              margin: 0,
            }}
          >
            学生作答详情
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "var(--bg-secondary, #f9fafb)" }}>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 600,
                    color: "var(--text-primary, #1f2937)",
                    borderBottom: "2px solid var(--border-color, #e5e7eb)",
                  }}
                >
                  学生姓名
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 600,
                    color: "var(--text-primary, #1f2937)",
                    borderBottom: "2px solid var(--border-color, #e5e7eb)",
                  }}
                >
                  邮箱
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 600,
                    color: "var(--text-primary, #1f2937)",
                    borderBottom: "2px solid var(--border-color, #e5e7eb)",
                  }}
                >
                  提交状态
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 600,
                    color: "var(--text-primary, #1f2937)",
                    borderBottom: "2px solid var(--border-color, #e5e7eb)",
                  }}
                >
                  得分
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 600,
                    color: "var(--text-primary, #1f2937)",
                    borderBottom: "2px solid var(--border-color, #e5e7eb)",
                  }}
                >
                  测试用例
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 600,
                    color: "var(--text-primary, #1f2937)",
                    borderBottom: "2px solid var(--border-color, #e5e7eb)",
                  }}
                >
                  编程语言
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 600,
                    color: "var(--text-primary, #1f2937)",
                    borderBottom: "2px solid var(--border-color, #e5e7eb)",
                  }}
                >
                  编写耗时
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 600,
                    color: "var(--text-primary, #1f2937)",
                    borderBottom: "2px solid var(--border-color, #e5e7eb)",
                  }}
                >
                  提交时间
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 600,
                    color: "var(--text-primary, #1f2937)",
                    borderBottom: "2px solid var(--border-color, #e5e7eb)",
                  }}
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {data.statistics.map((stat, index) => (
                <tr
                  key={stat.student_id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "white" : "var(--bg-secondary, #f9fafb)",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary, #f3f4f6)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "var(--bg-secondary, #f9fafb)")
                  }
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "var(--font-size-base, 16px)",
                      color: "var(--text-primary, #1f2937)",
                    }}
                  >
                    {getStudentName(stat)}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "var(--font-size-base, 16px)",
                      color: "var(--text-primary, #1f2937)",
                    }}
                  >
                    {stat.student_email || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {stat.has_submitted ? (
                      <span
                        style={{
                          padding: "4px 12px",
                          backgroundColor: "var(--success-light, #d1fae5)",
                          color: "var(--success-color, #059669)",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontSize: "var(--font-size-sm, 14px)",
                          fontWeight: 500,
                        }}
                      >
                        已提交
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: "4px 12px",
                          backgroundColor: "var(--warning-light, #fef3c7)",
                          color: "var(--warning-color, #d97706)",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontSize: "var(--font-size-sm, 14px)",
                          fontWeight: 500,
                        }}
                      >
                        未提交
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {stat.has_submitted ? (
                      <span
                        style={{
                          fontSize: "var(--font-size-base, 16px)",
                          fontWeight: 600,
                          color: stat.score === 100 ? "var(--success-color, #059669)" : "var(--text-primary, #1f2937)",
                        }}
                      >
                        {stat.score.toFixed(1)}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-secondary, #6b7280)" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {stat.has_submitted ? (
                      <span style={{ fontSize: "var(--font-size-base, 16px)", color: "var(--text-primary, #1f2937)" }}>
                        {stat.test_count}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-secondary, #6b7280)" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {stat.has_submitted && stat.language ? (
                      <span
                        style={{
                          padding: "4px 8px",
                          backgroundColor: stat.language === "java" ? "var(--danger-light, #fee2e2)" : "var(--success-light, #d1fae5)",
                          color: stat.language === "java" ? "var(--danger-color, #dc2626)" : "var(--success-color, #059669)",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontSize: "var(--font-size-xs, 12px)",
                          fontWeight: 500,
                        }}
                      >
                        {stat.language === "java" ? "Java" : "Python"}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-secondary, #6b7280)" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {stat.has_submitted && stat.total_time > 0 ? (
                      <span style={{ fontSize: "var(--font-size-base, 16px)", color: "var(--text-primary, #1f2937)", fontWeight: 500 }}>
                        {formatTime(stat.total_time)}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-secondary, #6b7280)" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {stat.has_submitted && stat.submitted_at ? (
                      <span style={{ fontSize: "var(--font-size-sm, 14px)", color: "var(--text-primary, #1f2937)" }}>
                        {new Date(stat.submitted_at).toLocaleString("zh-CN")}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-secondary, #6b7280)" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {stat.has_submitted && stat.submission_id ? (
                      <Link
                        to={`/submissions/${stat.submission_id}`}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "var(--primary-color, #1e40af)",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontSize: "var(--font-size-sm, 14px)",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)")}
                      >
                        查看详情
                      </Link>
                    ) : (
                      <span style={{ color: "var(--text-secondary, #6b7280)", fontSize: "var(--font-size-sm, 14px)" }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};