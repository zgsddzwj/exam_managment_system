import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "var(--primary-color, #1e40af)",
        color: "white",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link 
          to="/dashboard" 
          style={{ 
            color: "white", 
            textDecoration: "none", 
            fontSize: "var(--font-size-xl, 20px)",
            fontWeight: 600,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          代码评估系统
        </Link>
        {user && (
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {user.role === "teacher" && (
              <>
                <Link 
                  to="/classes" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md, 6px)",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  班级管理
                </Link>
                <Link 
                  to="/tasks" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md, 6px)",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  任务管理
                </Link>
              </>
            )}
            {user.role === "student" && (
              <>
                <Link 
                  to="/my-classes" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md, 6px)",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  我的班级
                </Link>
                <Link 
                  to="/my-tasks" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md, 6px)",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  我的任务
                </Link>
              </>
            )}
            {user.role === "admin" && (
              <Link 
                to="/admin" 
                style={{ 
                  color: "white", 
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md, 6px)",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                系统管理
              </Link>
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {user ? (
          <>
            <span style={{ 
              fontSize: "var(--font-size-sm, 14px)",
              padding: "6px 12px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--radius-md, 6px)",
            }}>
              {user.username} ({user.role === "admin" ? "管理员" : user.role === "teacher" ? "教师" : "学生"})
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "8px 16px",
                borderRadius: "var(--radius-md, 6px)",
                cursor: "pointer",
                fontSize: "var(--font-size-sm, 14px)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
            >
              退出
            </button>
          </>
        ) : (
          <Link 
            to="/login" 
            style={{ 
              color: "white", 
              textDecoration: "none",
              padding: "8px 16px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "var(--radius-md, 6px)",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
          >
            登录
          </Link>
        )}
      </div>
    </nav>
  );
};

