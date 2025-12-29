import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });

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
    // 不能修改自己的角色
    if (userId === currentUser?.id) {
      alert("不能修改自己的角色");
      return;
    }

    try {
      await api.updateUserRole(userId, newRole);
      loadData();
      alert("角色更新成功！");
    } catch (error: any) {
      alert(getErrorMessage(error, "更新用户角色失败"));
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      await api.updateUser(editingUser.id, editForm);
      setEditingUser(null);
      loadData();
      alert("用户信息更新成功！");
    } catch (error: any) {
      alert(getErrorMessage(error, "更新用户信息失败"));
    }
  };

  const handleDelete = async (userId: number, username: string, role: string) => {
    // 不能删除自己
    if (userId === currentUser?.id) {
      alert("不能删除自己的账号");
      return;
    }

    // 不能删除管理员
    if (role === "admin") {
      alert("不能直接删除管理员，请先将管理员角色转给其他用户后再删除");
      return;
    }

    if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      await api.deleteUser(userId);
      loadData();
      alert("用户删除成功！");
    } catch (error: any) {
      alert(getErrorMessage(error, "删除用户失败"));
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
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>用户名</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>邮箱</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>姓名</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>角色</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>角色操作</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isCurrentUser = user.id === currentUser?.id;
                    const isAdmin = user.role === "admin";
                    return (
                      <tr
                        key={user.id}
                        style={{
                          backgroundColor: isCurrentUser ? "#fff3cd" : "transparent",
                        }}
                      >
                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>{user.id}</td>
                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                          {user.username}
                          {isCurrentUser && (
                            <span style={{ marginLeft: "8px", color: "#856404", fontSize: "12px" }}>(当前用户)</span>
                          )}
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>{user.email}</td>
                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                          {user.first_name || user.last_name
                            ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                            : "-"}
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              backgroundColor:
                                user.role === "admin"
                                  ? "#dc3545"
                                  : user.role === "teacher"
                                  ? "#ffc107"
                                  : "#28a745",
                              color: user.role === "teacher" ? "#000" : "#fff",
                            }}
                          >
                            {user.role === "admin" ? "管理员" : user.role === "teacher" ? "教师" : "学生"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleUpdateRole(user.id, e.target.value as "admin" | "teacher" | "student")
                            }
                            disabled={isCurrentUser}
                            style={{
                              padding: "6px 10px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              cursor: isCurrentUser ? "not-allowed" : "pointer",
                              opacity: isCurrentUser ? 0.6 : 1,
                            }}
                          >
                            <option value="student">学生</option>
                            <option value="teacher">教师</option>
                            <option value="admin">管理员</option>
                          </select>
                          {isCurrentUser && (
                            <div style={{ fontSize: "11px", color: "#856404", marginTop: "4px" }}>
                              不能修改自己的角色
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEdit(user)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "13px",
                              }}
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.username, user.role)}
                              disabled={isCurrentUser || isAdmin}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: isCurrentUser || isAdmin ? "#6c757d" : "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isCurrentUser || isAdmin ? "not-allowed" : "pointer",
                                fontSize: "13px",
                                opacity: isCurrentUser || isAdmin ? 0.6 : 1,
                              }}
                            >
                              删除
                            </button>
                          </div>
                          {isAdmin && !isCurrentUser && (
                            <div style={{ fontSize: "11px", color: "#856404", marginTop: "4px" }}>
                              管理员只能转让角色
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 编辑用户对话框 */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setEditingUser(null)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>编辑用户信息</h3>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                用户名：
              </label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                邮箱：
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                名：
              </label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                姓：
              </label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

