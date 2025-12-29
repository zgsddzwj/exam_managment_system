import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Class } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const ClassList: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", description: "" });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await api.getClasses();
      console.log("班级数据:", data);
      setClasses(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("加载班级失败:", error);
      if (error.response?.status !== 401) {
        // 401是未认证，不需要alert
        alert(getErrorMessage(error, "加载班级失败，请检查网络连接"));
      }
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClass(newClass);
      setShowCreateForm(false);
      setNewClass({ name: "", description: "" });
      loadClasses();
    } catch (error: any) {
      alert(getErrorMessage(error, "创建班级失败"));
    }
  };

  const handleCreateInvitation = async (classId: number) => {
    try {
      await api.createInvitationCode(classId);
      loadClasses();
    } catch (error: any) {
      alert(getErrorMessage(error, "生成邀请码失败"));
    }
  };

  const handleCopyInvitationCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      alert("邀请码已复制到剪贴板！");
    } catch (error) {
      // 如果 clipboard API 不可用，使用备用方法
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        alert("邀请码已复制到剪贴板！");
      } catch (err) {
        alert("复制失败，请手动复制邀请码");
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "var(--font-size-lg, 18px)", color: "var(--text-secondary, #6b7280)" }}>加载中...</div>
      </div>
    );

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: "2px solid var(--border-light, #f3f4f6)",
      }}>
        <h2 style={{
          margin: 0,
          color: "var(--text-primary, #1f2937)",
          fontSize: "var(--font-size-2xl, 24px)",
        }}>班级管理</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--primary-color, #1e40af)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md, 6px)",
            cursor: "pointer",
            fontSize: "var(--font-size-base, 16px)",
            fontWeight: 500,
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)"}
        >
          {showCreateForm ? "取消" : "创建班级"}
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          style={{
            marginBottom: "24px",
            padding: "24px",
            border: "1px solid var(--border-color, #e5e7eb)",
            borderRadius: "var(--radius-lg, 8px)",
            backgroundColor: "var(--bg-primary, #ffffff)",
            boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
          }}
        >
          <h3 style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "var(--text-primary, #1f2937)",
            fontSize: "var(--font-size-xl, 20px)",
          }}>创建新班级</h3>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontWeight: 500,
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>班级名称</label>
            <input
              type="text"
              value={newClass.name}
              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              required
              placeholder="请输入班级名称"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "4px",
                fontSize: "var(--font-size-base, 16px)",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "var(--radius-md, 6px)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--primary-color, #1e40af)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-lighter, #dbeafe)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color, #e5e7eb)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontWeight: 500,
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>描述</label>
            <textarea
              value={newClass.description}
              onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
              placeholder="请输入班级描述（可选）"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "4px",
                minHeight: "100px",
                fontSize: "var(--font-size-base, 16px)",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "var(--radius-md, 6px)",
                fontFamily: "inherit",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--primary-color, #1e40af)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-lighter, #dbeafe)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color, #e5e7eb)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "12px 24px",
              backgroundColor: "var(--success-color, #059669)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md, 6px)",
              cursor: "pointer",
              fontSize: "var(--font-size-base, 16px)",
              fontWeight: 500,
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--success-hover, #047857)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--success-color, #059669)"}
          >
            创建
          </button>
        </form>
      )}

      <div>
        {classes.length === 0 ? (
          <div
            style={{
              padding: "60px 40px",
              textAlign: "center",
              border: "2px dashed var(--border-color, #e5e7eb)",
              borderRadius: "var(--radius-lg, 8px)",
              backgroundColor: "var(--bg-primary, #ffffff)",
            }}
          >
            <h3 style={{
              color: "var(--text-secondary, #6b7280)",
              marginBottom: "12px",
              fontSize: "var(--font-size-xl, 20px)",
            }}>暂无班级</h3>
            <p style={{
              color: "var(--text-secondary, #6b7280)",
              marginBottom: "24px",
              fontSize: "var(--font-size-base, 16px)",
            }}>
              点击"创建班级"按钮开始创建您的第一个班级
            </p>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "var(--primary-color, #1e40af)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-md, 6px)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-base, 16px)",
                  fontWeight: 500,
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)"}
              >
                立即创建班级
              </button>
            )}
          </div>
        ) : (
          classes.map((cls) => (
          <div
            key={cls.id}
            style={{
              border: "1px solid var(--border-color, #e5e7eb)",
              borderRadius: "var(--radius-lg, 8px)",
              padding: "20px",
              marginBottom: "16px",
              backgroundColor: "var(--bg-primary, #ffffff)",
              boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
              transition: "box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: "0 0 12px 0",
                  fontSize: "var(--font-size-xl, 20px)",
                  color: "var(--text-primary, #1f2937)",
                }}>
                  <Link
                    to={`/classes/${cls.id}`}
                    style={{
                      textDecoration: "none",
                      color: "var(--primary-color, #1e40af)",
                      fontWeight: 600,
                    }}
                  >
                    {cls.name}
                  </Link>
                </h3>
                <p style={{
                  color: "var(--text-secondary, #6b7280)",
                  margin: "8px 0",
                  lineHeight: "var(--line-height-relaxed, 1.75)",
                }}>
                  {cls.description || "无描述"}
                </p>
                <div style={{
                  display: "flex",
                  gap: "24px",
                  marginTop: "12px",
                  fontSize: "var(--font-size-sm, 14px)",
                  flexWrap: "wrap",
                }}>
                  <span style={{ color: "var(--text-secondary, #6b7280)" }}>
                    <strong style={{ color: "var(--text-primary, #1f2937)" }}>学生数:</strong> {cls.student_count || 0}
                  </span>
                  <span style={{ color: "var(--text-secondary, #6b7280)" }}>
                    <strong style={{ color: "var(--text-primary, #1f2937)" }}>创建时间:</strong> {new Date(cls.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Link
                to={`/classes/${cls.id}`}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--primary-color, #1e40af)",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "var(--radius-md, 6px)",
                  fontSize: "var(--font-size-sm, 14px)",
                  fontWeight: 500,
                  transition: "background-color 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)"}
              >
                查看详情
              </Link>
            </div>
            {cls.active_invitation_code && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  backgroundColor: "var(--primary-lighter, #dbeafe)",
                  borderRadius: "var(--radius-md, 6px)",
                  border: "1px solid var(--primary-light, #3b82f6)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <p style={{
                    margin: 0,
                    fontSize: "var(--font-size-sm, 14px)",
                    color: "var(--text-primary, #1f2937)",
                  }}>
                    <strong>邀请码:</strong>{" "}
                    <span
                      style={{
                        fontSize: "var(--font-size-xl, 20px)",
                        fontWeight: "bold",
                        color: "var(--primary-color, #1e40af)",
                        fontFamily: "monospace",
                        letterSpacing: "2px",
                      }}
                    >
                      {cls.active_invitation_code.code}
                    </span>
                  </p>
                  <button
                    onClick={() => cls.active_invitation_code && handleCopyInvitationCode(cls.active_invitation_code.code)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "var(--success-color, #059669)",
                      color: "white",
                      border: "none",
                      borderRadius: "var(--radius-md, 6px)",
                      cursor: "pointer",
                      fontSize: "var(--font-size-sm, 14px)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--success-hover, #047857)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--success-color, #059669)"}
                  >
                    📋 复制
                  </button>
                </div>
                <p style={{
                  margin: "0 0 12px 0",
                  fontSize: "var(--font-size-xs, 12px)",
                  color: "var(--text-secondary, #6b7280)",
                }}>
                  使用次数: {cls.active_invitation_code.current_uses} /{" "}
                  {cls.active_invitation_code.max_uses || "∞"}
                </p>
                <button
                  onClick={() => handleCreateInvitation(cls.id)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "var(--warning-color, #d97706)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-md, 6px)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 500,
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--warning-hover, #b45309)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--warning-color, #d97706)"}
                >
                  重新生成邀请码
                </button>
              </div>
            )}
            {!cls.active_invitation_code && (
              <div style={{ marginTop: "16px" }}>
                <button
                  onClick={() => handleCreateInvitation(cls.id)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "var(--primary-color, #1e40af)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-md, 6px)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontWeight: 500,
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)"}
                >
                  生成邀请码
                </button>
              </div>
            )}
          </div>
          ))
        )}
      </div>
    </div>
  );
};

