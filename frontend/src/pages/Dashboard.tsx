import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const cardStyle = {
    padding: "24px",
    backgroundColor: "var(--bg-primary, #ffffff)",
    border: "1px solid var(--border-color, #e5e7eb)",
    borderRadius: "var(--radius-lg, 8px)",
    textDecoration: "none",
    display: "block",
    transition: "all 0.2s ease",
    boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
  };

  const cardHover = (e: React.MouseEvent<HTMLAnchorElement>, color: string) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))";
    e.currentTarget.style.borderColor = color;
  };

  const cardLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))";
    e.currentTarget.style.borderColor = "var(--border-color, #e5e7eb)";
  };

  return (
    <div style={{ padding: "24px", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{
        backgroundColor: "var(--bg-primary, #ffffff)",
        padding: "32px",
        borderRadius: "var(--radius-lg, 8px)",
        boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
        marginBottom: "32px",
      }}>
        <h1 style={{
          marginBottom: "8px",
          color: "var(--text-primary, #1f2937)",
          fontSize: "var(--font-size-3xl, 30px)",
        }}>
          欢迎, {user?.username}!
        </h1>
        <p style={{
          color: "var(--text-secondary, #6b7280)",
          fontSize: "var(--font-size-base, 16px)",
          margin: 0,
        }}>
          角色: {user?.role === "admin" ? "管理员" : user?.role === "teacher" ? "教师" : "学生"}
        </p>
      </div>

      <div style={{ marginTop: "40px" }}>
        {user?.role === "teacher" && (
          <div>
            <h2 style={{
              marginBottom: "24px",
              color: "var(--text-primary, #1f2937)",
              fontSize: "var(--font-size-2xl, 24px)",
            }}>教师功能</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              <Link
                to="/classes"
                style={{
                  ...cardStyle,
                  borderLeft: "4px solid var(--primary-color, #1e40af)",
                }}
                onMouseEnter={(e) => cardHover(e, "var(--primary-color, #1e40af)")}
                onMouseLeave={cardLeave}
              >
                <h3 style={{
                  margin: "0 0 12px 0",
                  color: "var(--primary-color, #1e40af)",
                  fontSize: "var(--font-size-xl, 20px)",
                }}>管理班级</h3>
                <p style={{
                  margin: 0,
                  color: "var(--text-secondary, #6b7280)",
                  fontSize: "var(--font-size-sm, 14px)",
                  lineHeight: "var(--line-height-relaxed, 1.75)",
                }}>创建班级、生成邀请码、查看学生</p>
              </Link>
              <Link
                to="/tasks"
                style={{
                  ...cardStyle,
                  borderLeft: "4px solid var(--success-color, #059669)",
                }}
                onMouseEnter={(e) => cardHover(e, "var(--success-color, #059669)")}
                onMouseLeave={cardLeave}
              >
                <h3 style={{
                  margin: "0 0 12px 0",
                  color: "var(--success-color, #059669)",
                  fontSize: "var(--font-size-xl, 20px)",
                }}>管理任务</h3>
                <p style={{
                  margin: 0,
                  color: "var(--text-secondary, #6b7280)",
                  fontSize: "var(--font-size-sm, 14px)",
                  lineHeight: "var(--line-height-relaxed, 1.75)",
                }}>创建任务、设置测试用例、查看提交</p>
              </Link>
            </div>
          </div>
        )}
        {user?.role === "student" && (
          <div>
            <h2 style={{
              marginBottom: "24px",
              color: "var(--text-primary, #1f2937)",
              fontSize: "var(--font-size-2xl, 24px)",
            }}>学生功能</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              <Link
                to="/my-classes"
                style={{
                  ...cardStyle,
                  borderLeft: "4px solid var(--primary-color, #1e40af)",
                }}
                onMouseEnter={(e) => cardHover(e, "var(--primary-color, #1e40af)")}
                onMouseLeave={cardLeave}
              >
                <h3 style={{
                  margin: "0 0 12px 0",
                  color: "var(--primary-color, #1e40af)",
                  fontSize: "var(--font-size-xl, 20px)",
                }}>我的班级</h3>
                <p style={{
                  margin: 0,
                  color: "var(--text-secondary, #6b7280)",
                  fontSize: "var(--font-size-sm, 14px)",
                  lineHeight: "var(--line-height-relaxed, 1.75)",
                }}>查看已加入的班级、通过邀请码加入新班级</p>
              </Link>
              <Link
                to="/my-tasks"
                style={{
                  ...cardStyle,
                  borderLeft: "4px solid var(--success-color, #059669)",
                }}
                onMouseEnter={(e) => cardHover(e, "var(--success-color, #059669)")}
                onMouseLeave={cardLeave}
              >
                <h3 style={{
                  margin: "0 0 12px 0",
                  color: "var(--success-color, #059669)",
                  fontSize: "var(--font-size-xl, 20px)",
                }}>我的任务</h3>
                <p style={{
                  margin: 0,
                  color: "var(--text-secondary, #6b7280)",
                  fontSize: "var(--font-size-sm, 14px)",
                  lineHeight: "var(--line-height-relaxed, 1.75)",
                }}>查看任务列表、编写代码、提交作业</p>
              </Link>
              <Link
                to="/submissions"
                style={{
                  ...cardStyle,
                  borderLeft: "4px solid var(--warning-color, #d97706)",
                }}
                onMouseEnter={(e) => cardHover(e, "var(--warning-color, #d97706)")}
                onMouseLeave={cardLeave}
              >
                <h3 style={{
                  margin: "0 0 12px 0",
                  color: "var(--warning-color, #d97706)",
                  fontSize: "var(--font-size-xl, 20px)",
                }}>提交历史</h3>
                <p style={{
                  margin: 0,
                  color: "var(--text-secondary, #6b7280)",
                  fontSize: "var(--font-size-sm, 14px)",
                  lineHeight: "var(--line-height-relaxed, 1.75)",
                }}>查看所有提交记录和成绩</p>
              </Link>
            </div>
          </div>
        )}
        {user?.role === "admin" && (
          <div>
            <h2 style={{
              marginBottom: "24px",
              color: "var(--text-primary, #1f2937)",
              fontSize: "var(--font-size-2xl, 24px)",
            }}>管理员功能</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              <Link
                to="/admin"
                style={{
                  ...cardStyle,
                  borderLeft: "4px solid var(--danger-color, #dc2626)",
                }}
                onMouseEnter={(e) => cardHover(e, "var(--danger-color, #dc2626)")}
                onMouseLeave={cardLeave}
              >
                <h3 style={{
                  margin: "0 0 12px 0",
                  color: "var(--danger-color, #dc2626)",
                  fontSize: "var(--font-size-xl, 20px)",
                }}>系统管理</h3>
                <p style={{
                  margin: 0,
                  color: "var(--text-secondary, #6b7280)",
                  fontSize: "var(--font-size-sm, 14px)",
                  lineHeight: "var(--line-height-relaxed, 1.75)",
                }}>查看系统统计、管理用户角色</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

