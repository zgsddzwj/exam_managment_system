import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorHandler";

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "student" as "admin" | "teacher" | "student",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 如果已经登录，自动跳转到dashboard
  useEffect(() => {
    if (!authLoading && user) {
      // 使用setTimeout确保在下一个事件循环中执行
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError("两次密码输入不一致");
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      // 注册成功后，检查token是否存在，然后跳转
      // 使用window.location.href确保可靠跳转
      if (localStorage.getItem("access_token")) {
        window.location.href = "/dashboard";
      } else {
        // 如果token不存在，使用navigate作为后备
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "注册失败"));
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", width: "100%" }}>
      <h2>注册</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>用户名：</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>邮箱：</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>角色：</label>
          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as "admin" | "teacher" | "student" })
            }
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="student">学生</option>
            <option value="teacher">教师</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>密码：</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>确认密码：</label>
          <input
            type="password"
            value={formData.password2}
            onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        已有账号？<Link to="/login">登录</Link>
      </p>
    </div>
  );
};

