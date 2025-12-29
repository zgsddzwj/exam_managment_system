import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { SubmissionDetail as SubmissionDetailType, TestResult } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<SubmissionDetailType | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadSubmission();
    }
  }, [id]);

  const loadSubmission = async () => {
    try {
      const data = await api.getSubmission(Number(id));
      setSubmission(data);
      // 从submission中提取test_results
      if (data.test_results) {
        setTestResults(data.test_results);
      }
    } catch (error: any) {
      console.error("加载提交详情失败:", error);
      alert(getErrorMessage(error, "加载提交详情失败"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>加载中...</div>;
  if (!submission) return <div style={{ padding: "20px" }}>提交不存在</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          返回
        </button>
      </div>

      <h2>提交详情</h2>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "20px",
          marginBottom: "20px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          <div>
            <h3>{submission.task_title}</h3>
            <p>
              <strong>学生:</strong> {submission.student_name}
            </p>
          </div>
          <div
            style={{
              padding: "10px 20px",
              backgroundColor: submission.score >= 60 ? "#28a745" : "#dc3545",
              color: "white",
              borderRadius: "4px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {submission.score.toFixed(2)}分
          </div>
        </div>
        <div style={{ display: "flex", gap: "30px" }}>
          <span>
            <strong>编程语言:</strong> {submission.language === "java" ? "Java" : "Python"}
          </span>
          <span>
            <strong>测试次数:</strong> {submission.test_count}
          </span>
          <span>
            <strong>总耗时:</strong> {submission.total_time.toFixed(2)}秒
          </span>
          <span>
            <strong>提交时间:</strong> {new Date(submission.submitted_at).toLocaleString()}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>代码内容</h3>
        <pre
          style={{
            backgroundColor: "#f4f4f4",
            padding: "15px",
            borderRadius: "4px",
            overflow: "auto",
            maxHeight: "400px",
          }}
        >
          {submission.code_content}
        </pre>
      </div>

      <div>
        <h3>测试结果 ({testResults.length})</h3>
        {testResults.length === 0 ? (
          <p>暂无测试结果</p>
        ) : (
          <div>
            {testResults.map((result, index) => (
              <div
                key={result.id || index}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: result.passed ? "#d4edda" : "#f8d7da",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <strong>
                    测试用例 {result.test_case_info?.order !== undefined ? result.test_case_info.order + 1 : index + 1}
                    {result.test_case_info?.is_hidden && " (隐藏测试)"}
                  </strong>
                  <span
                    style={{
                      padding: "5px 10px",
                      backgroundColor: result.passed ? "#28a745" : "#dc3545",
                      color: "white",
                      borderRadius: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    {result.passed ? "通过" : "失败"}
                  </span>
                </div>
                {result.output && (
                  <div style={{ marginTop: "10px" }}>
                    <strong>输出:</strong>
                    <pre style={{ backgroundColor: "white", padding: "10px", borderRadius: "4px", marginTop: "5px" }}>
                      {result.output}
                    </pre>
                  </div>
                )}
                {result.error_message && (
                  <div style={{ marginTop: "10px" }}>
                    <strong style={{ color: "#dc3545" }}>错误信息:</strong>
                    <pre
                      style={{
                        backgroundColor: "white",
                        padding: "10px",
                        borderRadius: "4px",
                        marginTop: "5px",
                        color: "#dc3545",
                      }}
                    >
                      {result.error_message}
                    </pre>
                  </div>
                )}
                <div style={{ marginTop: "10px" }}>
                  <strong>执行时间:</strong> {result.execution_time.toFixed(3)}秒
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

