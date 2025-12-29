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

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "4px",
    fontSize: "var(--font-size-base, 16px)",
    border: "1px solid var(--border-color, #e5e7eb)",
    borderRadius: "var(--radius-md, 6px)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--primary-color, #1e40af)";
    e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-lighter, #dbeafe)";
  };

  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--border-color, #e5e7eb)";
    e.currentTarget.style.boxShadow = "none";
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
        maxWidth: "480px",
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
        }}>注册</h2>
        <p style={{
          marginBottom: "32px",
          color: "var(--text-secondary, #6b7280)",
          fontSize: "var(--font-size-sm, 14px)",
        }}>创建新账户，开始使用代码评估系统</p>
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
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="请输入用户名"
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontWeight: 500,
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="请输入邮箱地址"
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontWeight: 500,
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>角色</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as "admin" | "teacher" | "student" })
              }
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            >
              <option value="student">学生</option>
              <option value="teacher">教师</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontWeight: 500,
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>密码</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="请输入密码"
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontWeight: 500,
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>确认密码</label>
            <input
              type="password"
              value={formData.password2}
              onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
              required
              placeholder="请再次输入密码"
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
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
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <p style={{
          marginTop: "24px",
          textAlign: "center",
          color: "var(--text-secondary, #6b7280)",
          fontSize: "var(--font-size-sm, 14px)",
        }}>
          已有账号？{" "}
          <Link to="/login" style={{
            color: "var(--primary-color, #1e40af)",
            fontWeight: 500,
            textDecoration: "none",
          }}>
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
};

