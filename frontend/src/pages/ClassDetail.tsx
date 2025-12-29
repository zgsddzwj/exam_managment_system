import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import type { Class } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadClass();
    }
  }, [id]);

  const loadClass = async () => {
    try {
      const data = await api.getClass(Number(id));
      setClassData(data);
    } catch (error: any) {
      console.error("加载班级失败:", error);
      alert(getErrorMessage(error, "加载班级详情失败"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    if (!id) return;
    try {
      await api.createInvitationCode(Number(id));
      loadClass();
      alert("邀请码生成成功！");
    } catch (error: any) {
      alert(getErrorMessage(error, "生成邀请码失败"));
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>加载中...</div>;
  if (!classData) return <div style={{ padding: "20px" }}>班级不存在</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/classes")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          返回班级列表
        </button>
      </div>

      <h2>{classData.name}</h2>
      <p>{classData.description || "无描述"}</p>

      <div style={{ marginTop: "30px" }}>
        <h3>邀请码</h3>
        {classData.active_invitation_code ? (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            <p>
              <strong>邀请码:</strong>{" "}
              <span style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>
                {classData.active_invitation_code.code}
              </span>
            </p>
            <p>
              使用次数: {classData.active_invitation_code.current_uses} /{" "}
              {classData.active_invitation_code.max_uses || "∞"}
            </p>
            <button
              onClick={handleCreateInvitation}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ffc107",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              重新生成邀请码
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={handleCreateInvitation}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              生成邀请码
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>学生列表 ({classData.student_count})</h3>
        {classData.student_count > 0 ? (
          <p>共有 {classData.student_count} 名学生加入此班级</p>
        ) : (
          <p>暂无学生</p>
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>任务列表</h3>
        <Link
          to={`/tasks?class_id=${id}`}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            display: "inline-block",
            marginBottom: "15px",
          }}
        >
          查看所有任务
        </Link>
        <div>
          <Link
            to={`/submissions/classes/${id}`}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              display: "inline-block",
              marginLeft: "10px",
            }}
          >
            查看所有提交
          </Link>
          <button
            onClick={async () => {
              try {
                const blob = await api.exportGrades(Number(id));
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `班级_${id}_成绩统计.xlsx`;
                a.click();
              } catch (error: any) {
                alert(getErrorMessage(error, "导出成绩失败"));
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            导出成绩
          </button>
        </div>
      </div>
    </div>
  );
};

