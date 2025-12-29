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

  if (loading)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#6c757d" }}>加载中...</div>
      </div>
    );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>班级管理</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {showCreateForm ? "取消" : "创建班级"}
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          style={{
            marginBottom: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <label>班级名称：</label>
            <input
              type="text"
              value={newClass.name}
              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>描述：</label>
            <textarea
              value={newClass.description}
              onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
              style={{ width: "100%", padding: "8px", marginTop: "5px", minHeight: "80px" }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            创建
          </button>
        </form>
      )}

      <div>
        {classes.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              border: "2px dashed #ddd",
              borderRadius: "8px",
              backgroundColor: "#f8f9fa",
            }}
          >
            <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>暂无班级</h3>
            <p style={{ color: "#6c757d", marginBottom: "20px" }}>
              点击"创建班级"按钮开始创建您的第一个班级
            </p>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
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
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "20px" }}>
                  <Link
                    to={`/classes/${cls.id}`}
                    style={{ textDecoration: "none", color: "#007bff" }}
                  >
                    {cls.name}
                  </Link>
                </h3>
                <p style={{ color: "#6c757d", margin: "5px 0" }}>
                  {cls.description || "无描述"}
                </p>
                <div style={{ display: "flex", gap: "20px", marginTop: "10px", fontSize: "14px" }}>
                  <span>
                    <strong>学生数:</strong> {cls.student_count || 0}
                  </span>
                  <span>
                    <strong>创建时间:</strong> {new Date(cls.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Link
                to={`/classes/${cls.id}`}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                查看详情
              </Link>
            </div>
            {cls.active_invitation_code && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  backgroundColor: "#e7f3ff",
                  borderRadius: "4px",
                  border: "1px solid #b3d9ff",
                }}
              >
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>邀请码:</strong>{" "}
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#007bff",
                      fontFamily: "monospace",
                      letterSpacing: "2px",
                    }}
                  >
                    {cls.active_invitation_code.code}
                  </span>
                </p>
                <p style={{ margin: "0", fontSize: "12px", color: "#6c757d" }}>
                  使用次数: {cls.active_invitation_code.current_uses} /{" "}
                  {cls.active_invitation_code.max_uses || "∞"}
                </p>
                <button
                  onClick={() => handleCreateInvitation(cls.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "8px",
                    fontSize: "14px",
                  }}
                >
                  重新生成邀请码
                </button>
              </div>
            )}
            {!cls.active_invitation_code && (
              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={() => handleCreateInvitation(cls.id)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
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

