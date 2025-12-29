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
        backgroundColor: "#343a40",
        color: "white",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <Link to="/dashboard" style={{ color: "white", textDecoration: "none", marginRight: "20px" }}>
          代码评估系统
        </Link>
        {user && (
          <>
            {user.role === "teacher" && (
              <>
                <Link to="/classes" style={{ color: "white", textDecoration: "none", marginRight: "15px" }}>
                  班级管理
                </Link>
                <Link to="/tasks" style={{ color: "white", textDecoration: "none", marginRight: "15px" }}>
                  任务管理
                </Link>
              </>
            )}
            {user.role === "student" && (
              <>
                <Link to="/my-classes" style={{ color: "white", textDecoration: "none", marginRight: "15px" }}>
                  我的班级
                </Link>
                <Link to="/my-tasks" style={{ color: "white", textDecoration: "none", marginRight: "15px" }}>
                  我的任务
                </Link>
              </>
            )}
            {user.role === "admin" && (
              <Link to="/admin" style={{ color: "white", textDecoration: "none", marginRight: "15px" }}>
                管理员
              </Link>
            )}
          </>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: "15px" }}>{user.username} ({user.role === "admin" ? "管理员" : user.role === "teacher" ? "教师" : "学生"})</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid white",
                padding: "5px 15px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              退出
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
            登录
          </Link>
        )}
      </div>
    </nav>
  );
};

