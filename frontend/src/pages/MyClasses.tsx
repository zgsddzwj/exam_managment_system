import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import type { Class } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const MyClasses: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitationCode, setInvitationCode] = useState("");

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await api.getMyClasses();
      setClasses(data);
    } catch (error: any) {
      console.error("加载班级失败:", error);
      alert(getErrorMessage(error, "加载班级失败"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.joinClass(invitationCode);
      setInvitationCode("");
      loadClasses();
      alert("加入班级成功！");
    } catch (error: any) {
      alert(getErrorMessage(error, "加入班级失败"));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#6c757d" }}>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>我的班级</h2>
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "4px" }}>
        <h3>通过邀请码加入班级</h3>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value)}
            placeholder="请输入邀请码"
            required
            style={{ padding: "8px", marginRight: "10px", width: "200px" }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            加入
          </button>
        </form>
      </div>
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
            <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>您还没有加入任何班级</h3>
            <p style={{ color: "#6c757d" }}>使用上方的邀请码加入班级</p>
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
              <h3>{cls.name}</h3>
              <p>{cls.description || "无描述"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

