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
    <div style={{
      minHeight: "calc(100vh - 80px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, var(--primary-lighter, #dbeafe) 0%, var(--bg-secondary, #f9fafb) 100%)",
    }}>
      <div style={{
        maxWidth: "420px",
        width: "100%",
        backgroundColor: "var(--bg-primary, #ffffff)",
        padding: "40px",
        borderRadius: "var(--radius-xl, 12px)",
        boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))",
      }}>
        <h2 style={{
          marginBottom: "8px",
          color: "var(--text-primary, #1f2937)",
          fontSize: "var(--font-size-2xl, 24px)",
        }}>登录</h2>
        <p style={{
          marginBottom: "32px",
          color: "var(--text-secondary, #6b7280)",
          fontSize: "var(--font-size-sm, 14px)",
        }}>欢迎回来，请登录您的账户</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontWeight: 500,
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="请输入用户名"
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
            }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="请输入密码"
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
          {error && (
            <div style={{
              padding: "12px",
              marginBottom: "20px",
              backgroundColor: "var(--danger-light, #fee2e2)",
              color: "var(--danger-color, #dc2626)",
              borderRadius: "var(--radius-md, 6px)",
              fontSize: "var(--font-size-sm, 14px)",
              borderLeft: "4px solid var(--danger-color, #dc2626)",
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "var(--text-muted, #9ca3af)" : "var(--primary-color, #1e40af)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md, 6px)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "var(--font-size-base, 16px)",
              fontWeight: 500,
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)";
              }
            }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <p style={{
          marginTop: "24px",
          textAlign: "center",
          color: "var(--text-secondary, #6b7280)",
          fontSize: "var(--font-size-sm, 14px)",
        }}>
          还没有账号？{" "}
          <Link to="/register" style={{
            color: "var(--primary-color, #1e40af)",
            fontWeight: 500,
            textDecoration: "none",
          }}>
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
};

