import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorHandler";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 如果已经登录，自动跳转到dashboard
  useEffect(() => {
    if (!authLoading && user) {
      // 使用setTimeout确保在下一个事件循环中执行，避免与handleSubmit冲突
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      // 登录成功后，检查token是否存在，然后跳转
      // 使用window.location.href确保可靠跳转
      if (localStorage.getItem("access_token")) {
        window.location.href = "/dashboard";
      } else {
        // 如果token不存在，使用navigate作为后备
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "登录失败，请检查用户名和密码"));
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", width: "100%" }}>
      <h2>登录</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>用户名：</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>密码：</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        还没有账号？<Link to="/register">注册</Link>
      </p>
    </div>
  );
};

