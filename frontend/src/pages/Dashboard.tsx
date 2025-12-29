import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: "20px", width: "100%", maxWidth: "100%" }}>
      <h1>欢迎, {user?.username}!</h1>
      <p style={{ color: "#6c757d", marginTop: "10px" }}>
        角色: {user?.role === "admin" ? "管理员" : user?.role === "teacher" ? "教师" : "学生"}
      </p>

      <div style={{ marginTop: "40px" }}>
        {user?.role === "teacher" && (
          <div>
            <h2>教师功能</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <Link
                to="/classes"
                style={{
                  padding: "20px",
                  border: "2px solid #007bff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#007bff",
                  display: "block",
                  textAlign: "center",
                  transition: "all 0.3s",
                }}
              >
                <h3>管理班级</h3>
                <p>创建班级、生成邀请码、查看学生</p>
              </Link>
              <Link
                to="/tasks"
                style={{
                  padding: "20px",
                  border: "2px solid #28a745",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#28a745",
                  display: "block",
                  textAlign: "center",
                  transition: "all 0.3s",
                }}
              >
                <h3>管理任务</h3>
                <p>创建任务、设置测试用例、查看提交</p>
              </Link>
            </div>
          </div>
        )}
        {user?.role === "student" && (
          <div>
            <h2>学生功能</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <Link
                to="/my-classes"
                style={{
                  padding: "20px",
                  border: "2px solid #007bff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#007bff",
                  display: "block",
                  textAlign: "center",
                }}
              >
                <h3>我的班级</h3>
                <p>查看已加入的班级、通过邀请码加入新班级</p>
              </Link>
              <Link
                to="/my-tasks"
                style={{
                  padding: "20px",
                  border: "2px solid #28a745",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#28a745",
                  display: "block",
                  textAlign: "center",
                }}
              >
                <h3>我的任务</h3>
                <p>查看任务列表、编写代码、提交作业</p>
              </Link>
              <Link
                to="/submissions"
                style={{
                  padding: "20px",
                  border: "2px solid #ffc107",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#ffc107",
                  display: "block",
                  textAlign: "center",
                }}
              >
                <h3>提交历史</h3>
                <p>查看所有提交记录和成绩</p>
              </Link>
            </div>
          </div>
        )}
        {user?.role === "admin" && (
          <div>
            <h2>管理员功能</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <Link
                to="/admin"
                style={{
                  padding: "20px",
                  border: "2px solid #dc3545",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#dc3545",
                  display: "block",
                  textAlign: "center",
                }}
              >
                <h3>系统管理</h3>
                <p>查看系统统计、管理用户角色</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

