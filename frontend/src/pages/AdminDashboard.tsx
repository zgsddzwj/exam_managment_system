import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import type { User } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        api.getSystemStats(),
        api.getUserList(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error: any) {
      console.error("加载数据失败:", error);
      alert(getErrorMessage(error, "加载系统数据失败"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: "admin" | "teacher" | "student") => {
    try {
      await api.updateUserRole(userId, newRole);
      loadData();
      alert("角色更新成功！");
    } catch (error: any) {
      alert(getErrorMessage(error, "更新用户角色失败"));
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>加载中...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>管理员控制台</h2>

      <div style={{ marginBottom: "40px" }}>
        <h3>系统统计</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "4px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats?.total_users || 0}</div>
            <div>总用户数</div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#28a745",
              color: "white",
              borderRadius: "4px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats?.total_students || 0}</div>
            <div>学生数</div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#ffc107",
              color: "black",
              borderRadius: "4px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats?.total_teachers || 0}</div>
            <div>教师数</div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#17a2b8",
              color: "white",
              borderRadius: "4px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats?.total_classes || 0}</div>
            <div>班级数</div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#6c757d",
              color: "white",
              borderRadius: "4px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats?.total_tasks || 0}</div>
            <div>任务数</div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#dc3545",
              color: "white",
              borderRadius: "4px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats?.total_submissions || 0}</div>
            <div>提交数</div>
          </div>
        </div>
      </div>

      <div>
        <h3>用户管理</h3>
        <div style={{ marginTop: "20px" }}>
          {users.length === 0 ? (
            <p>暂无用户</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>用户名</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>邮箱</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>角色</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.id}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.username}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.email}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {user.role === "admin" ? "管理员" : user.role === "teacher" ? "教师" : "学生"}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateRole(user.id, e.target.value as "admin" | "teacher" | "student")
                        }
                        style={{ padding: "5px" }}
                      >
                        <option value="student">学生</option>
                        <option value="teacher">教师</option>
                        <option value="admin">管理员</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

