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
        <h3>学生列表 ({classData.student_count || (classData.students ? classData.students.length : 0)})</h3>
        {classData.students && classData.students.length > 0 ? (
          <div style={{ marginTop: "15px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "#fff",
                borderRadius: "4px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #dee2e6" }}>
                    序号
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #dee2e6" }}>
                    用户名
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #dee2e6" }}>
                    邮箱
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #dee2e6" }}>
                    姓名
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #dee2e6" }}>
                    加入时间
                  </th>
                </tr>
              </thead>
              <tbody>
                {classData.students.map((student, index) => (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom: "1px solid #dee2e6",
                      backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa",
                    }}
                  >
                    <td style={{ padding: "12px" }}>{index + 1}</td>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{student.username}</td>
                    <td style={{ padding: "12px", color: "#6c757d" }}>{student.email}</td>
                    <td style={{ padding: "12px" }}>
                      {student.first_name || student.last_name
                        ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
                        : "-"}
                    </td>
                    <td style={{ padding: "12px", color: "#6c757d" }}>
                      {new Date(student.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              textAlign: "center",
              color: "#6c757d",
              marginTop: "15px",
            }}
          >
            <p style={{ margin: "0" }}>暂无学生加入此班级</p>
            <p style={{ margin: "10px 0 0 0", fontSize: "14px" }}>
              学生可以通过邀请码加入班级
            </p>
          </div>
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

