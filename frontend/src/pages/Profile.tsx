import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";
import type { User } from "../types";

export const Profile: React.FC = () => {
  const { setUser } = useAuth();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 编辑模式
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });

  // 密码修改
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password2: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await api.getProfile();
      setUserState(profileData);
      setEditForm({
        email: profileData.email || "",
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
      });
      setError("");
    } catch (err: any) {
      setError(getErrorMessage(err, "加载个人信息失败"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
    }
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");
      const updatedUser = await api.updateProfile(editForm);
      setUserState(updatedUser);
      // 更新AuthContext中的用户信息
      if (setUser) {
        setUser(updatedUser);
      }
      setIsEditing(false);
      setSuccess("个人信息更新成功");
    } catch (err: any) {
      setError(getErrorMessage(err, "更新个人信息失败"));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.new_password !== passwordForm.new_password2) {
      setPasswordError("两次新密码输入不一致");
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError("新密码长度至少为8位");
      return;
    }

    try {
      await api.changePassword(passwordForm);
      setPasswordSuccess("密码修改成功");
      setPasswordForm({
        old_password: "",
        new_password: "",
        new_password2: "",
      });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err: any) {
      setPasswordError(getErrorMessage(err, "密码修改失败"));
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return "管理员";
      case "teacher":
        return "教师";
      case "student":
        return "学生";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div>无法加载用户信息</div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-2xl, 24px)",
          fontWeight: 600,
          marginBottom: "24px",
          color: "var(--text-primary, #1f2937)",
        }}
      >
        个人信息
      </h1>

      {/* 错误和成功提示 */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "var(--radius-md, 6px)",
            marginBottom: "16px",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#d1fae5",
            color: "#065f46",
            borderRadius: "var(--radius-md, 6px)",
            marginBottom: "16px",
            border: "1px solid #a7f3d0",
          }}
        >
          {success}
        </div>
      )}

      {/* 基本信息卡片 */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "var(--radius-lg, 8px)",
          padding: "24px",
          boxShadow: "var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-size-xl, 20px)",
              fontWeight: 600,
              color: "var(--text-primary, #1f2937)",
            }}
          >
            基本信息
          </h2>
          {!isEditing && (
            <button
              onClick={handleEdit}
              style={{
                backgroundColor: "var(--primary-color, #1e40af)",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "var(--radius-md, 6px)",
                cursor: "pointer",
                fontSize: "var(--font-size-sm, 14px)",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1e3a8a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)";
              }}
            >
              编辑
            </button>
          )}
        </div>

        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  color: "var(--text-secondary, #4b5563)",
                }}
              >
                用户名
              </label>
              <input
                type="text"
                value={user.username}
                disabled
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "var(--radius-md, 6px)",
                  fontSize: "var(--font-size-base, 16px)",
                  backgroundColor: "#f3f4f6",
                  color: "#6b7280",
                }}
              />
              <div
                style={{
                  fontSize: "var(--font-size-xs, 12px)",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                用户名不可修改
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  color: "var(--text-secondary, #4b5563)",
                }}
              >
                邮箱
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "var(--radius-md, 6px)",
                  fontSize: "var(--font-size-base, 16px)",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  color: "var(--text-secondary, #4b5563)",
                }}
              >
                名
              </label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, first_name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "var(--radius-md, 6px)",
                  fontSize: "var(--font-size-base, 16px)",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  color: "var(--text-secondary, #4b5563)",
                }}
              >
                姓
              </label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, last_name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "var(--radius-md, 6px)",
                  fontSize: "var(--font-size-base, 16px)",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: "var(--primary-color, #1e40af)",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "var(--radius-md, 6px)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-base, 16px)",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1e3a8a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)";
                }}
              >
                保存
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: "white",
                  color: "var(--text-primary, #1f2937)",
                  border: "1px solid #d1d5db",
                  padding: "10px 20px",
                  borderRadius: "var(--radius-md, 6px)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-base, 16px)",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  color: "var(--text-secondary, #4b5563)",
                  marginBottom: "4px",
                }}
              >
                用户名
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-base, 16px)",
                  color: "var(--text-primary, #1f2937)",
                }}
              >
                {user.username}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  color: "var(--text-secondary, #4b5563)",
                  marginBottom: "4px",
                }}
              >
                邮箱
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-base, 16px)",
                  color: "var(--text-primary, #1f2937)",
                }}
              >
                {user.email || "未设置"}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  color: "var(--text-secondary, #4b5563)",
                  marginBottom: "4px",
                }}
              >
                姓名
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-base, 16px)",
                  color: "var(--text-primary, #1f2937)",
                }}
              >
                {user.first_name || user.last_name
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                  : "未设置"}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  color: "var(--text-secondary, #4b5563)",
                  marginBottom: "4px",
                }}
              >
                角色
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-base, 16px)",
                  color: "var(--text-primary, #1f2937)",
                }}
              >
                {getRoleDisplay(user.role)}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  color: "var(--text-secondary, #4b5563)",
                  marginBottom: "4px",
                }}
              >
                注册时间
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-base, 16px)",
                  color: "var(--text-primary, #1f2937)",
                }}
              >
                {new Date(user.created_at).toLocaleString("zh-CN")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 密码修改卡片 */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "var(--radius-lg, 8px)",
          padding: "24px",
          boxShadow: "var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-size-xl, 20px)",
              fontWeight: 600,
              color: "var(--text-primary, #1f2937)",
            }}
          >
            修改密码
          </h2>
          {!showPasswordForm && (
            <button
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordError("");
                setPasswordSuccess("");
              }}
              style={{
                backgroundColor: "var(--primary-color, #1e40af)",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "var(--radius-md, 6px)",
                cursor: "pointer",
                fontSize: "var(--font-size-sm, 14px)",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1e3a8a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)";
              }}
            >
              修改密码
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange}>
            {passwordError && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "var(--radius-md, 6px)",
                  marginBottom: "16px",
                  border: "1px solid #fecaca",
                }}
              >
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#d1fae5",
                  color: "#065f46",
                  borderRadius: "var(--radius-md, 6px)",
                  marginBottom: "16px",
                  border: "1px solid #a7f3d0",
                }}
              >
                {passwordSuccess}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 500,
                    color: "var(--text-secondary, #4b5563)",
                  }}
                >
                  原密码
                </label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      old_password: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "var(--radius-md, 6px)",
                    fontSize: "var(--font-size-base, 16px)",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 500,
                    color: "var(--text-secondary, #4b5563)",
                  }}
                >
                  新密码
                </label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "var(--radius-md, 6px)",
                    fontSize: "var(--font-size-base, 16px)",
                  }}
                />
                <div
                  style={{
                    fontSize: "var(--font-size-xs, 12px)",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  密码长度至少为8位
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 500,
                    color: "var(--text-secondary, #4b5563)",
                  }}
                >
                  确认新密码
                </label>
                <input
                  type="password"
                  value={passwordForm.new_password2}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password2: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "var(--radius-md, 6px)",
                    fontSize: "var(--font-size-base, 16px)",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "var(--primary-color, #1e40af)",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "var(--radius-md, 6px)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-base, 16px)",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1e3a8a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)";
                  }}
                >
                  确认修改
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      old_password: "",
                      new_password: "",
                      new_password2: "",
                    });
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  style={{
                    backgroundColor: "white",
                    color: "var(--text-primary, #1f2937)",
                    border: "1px solid #d1d5db",
                    padding: "10px 20px",
                    borderRadius: "var(--radius-md, 6px)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-base, 16px)",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

