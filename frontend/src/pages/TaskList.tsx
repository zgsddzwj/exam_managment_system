import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Task, Class } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    language: "python" as "java" | "python",
    deadline: "",
  });
  const [testCases, setTestCases] = useState([
    { input_data: "", expected_output: "", is_hidden: false, order: 0, weight: 1.0 },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, classesData] = await Promise.all([
        api.getTasks(),
        api.getClasses(),
      ]);
      console.log("任务数据:", tasksData);
      console.log("班级数据:", classesData);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error: any) {
      console.error("加载数据失败:", error);
      alert(getErrorMessage(error, "加载数据失败，请检查网络连接"));
      setTasks([]);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      {
        input_data: "",
        expected_output: "",
        is_hidden: false,
        order: testCases.length,
        weight: 1.0,
      },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: string, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      alert("请选择班级");
      return;
    }
    
    // 验证测试用例
    const validTestCases = testCases.filter(
      (tc) => tc.input_data.trim() && tc.expected_output.trim()
    );
    
    if (validTestCases.length === 0) {
      alert("请至少添加一个有效的测试用例（输入和输出都不能为空）");
      return;
    }

    try {
      await api.createTask({
        ...newTask,
        class_obj: Number(selectedClassId),
        test_cases: validTestCases.map((tc, index) => ({
          input_data: tc.input_data.trim(),
          expected_output: tc.expected_output.trim(),
          is_hidden: tc.is_hidden || false,
          order: index,
          weight: tc.weight || 1.0,
        })),
      });
      setShowCreateForm(false);
      setNewTask({ title: "", description: "", language: "python", deadline: "" });
      setTestCases([
        { input_data: "", expected_output: "", is_hidden: false, order: 0, weight: 1.0 },
      ]);
      setSelectedClassId("");
      loadData();
      alert("任务创建成功！");
    } catch (error: any) {
      console.error("创建任务错误:", error);
      alert(getErrorMessage(error, "创建任务失败，请检查输入"));
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
        <h2>任务管理</h2>
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
          {showCreateForm ? "取消" : "创建任务"}
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          style={{
            marginBottom: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginTop: "0", marginBottom: "20px" }}>创建新任务</h3>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              所属班级：<span style={{ color: "red" }}>*</span>
            </label>
            {classes.length === 0 ? (
              <div style={{ padding: "10px", backgroundColor: "#fff3cd", borderRadius: "4px", border: "1px solid #ffc107" }}>
                <p style={{ margin: "0", color: "#856404" }}>
                  您还没有创建班级，请先{" "}
                  <Link to="/classes" style={{ color: "#007bff", textDecoration: "underline" }}>
                    创建班级
                  </Link>
                </p>
              </div>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(Number(e.target.value) || "")}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                <option value="">请选择班级</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.student_count} 名学生)
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              任务标题：<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
              placeholder="例如：计算两数之和"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              任务描述：<span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              required
              rows={6}
              placeholder="详细描述任务要求，包括输入输出格式、示例等..."
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              编程语言：<span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={newTask.language}
              onChange={(e) =>
                setNewTask({ ...newTask, language: e.target.value as "java" | "python" })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              截止时间（可选）：
            </label>
            <input
              type="datetime-local"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <label style={{ fontWeight: "bold", fontSize: "16px" }}>
                测试用例：<span style={{ color: "red" }}>*</span>
              </label>
              <button
                type="button"
                onClick={handleAddTestCase}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                + 添加测试用例
              </button>
            </div>
            {testCases.length === 0 && (
              <div style={{ padding: "15px", backgroundColor: "#fff3cd", borderRadius: "4px", border: "1px solid #ffc107", marginBottom: "15px" }}>
                <p style={{ margin: "0", color: "#856404" }}>
                  请至少添加一个测试用例。测试用例用于自动评分。
                </p>
              </div>
            )}
            {testCases.map((testCase, index) => (
              <div
                key={index}
                style={{
                  border: "2px solid #ddd",
                  padding: "20px",
                  marginBottom: "15px",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong style={{ fontSize: "16px", color: "#333" }}>
                    测试用例 {index + 1}
                  </strong>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase(index)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      删除
                    </button>
                  )}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
                    输入数据：<span style={{ color: "red" }}>*</span>
                  </label>
                  <textarea
                    value={testCase.input_data}
                    onChange={(e) =>
                      handleTestCaseChange(index, "input_data", e.target.value)
                    }
                    required
                    rows={3}
                    placeholder="例如：5 10 或 hello"
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
                    期望输出：<span style={{ color: "red" }}>*</span>
                  </label>
                  <textarea
                    value={testCase.expected_output}
                    onChange={(e) =>
                      handleTestCaseChange(index, "expected_output", e.target.value)
                    }
                    required
                    rows={3}
                    placeholder="例如：15 或 HELLO"
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={testCase.is_hidden}
                      onChange={(e) =>
                        handleTestCaseChange(index, "is_hidden", e.target.checked)
                      }
                      style={{ marginRight: "8px", width: "18px", height: "18px" }}
                    />
                    <span>隐藏测试（学生看不到此测试用例）</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "8px" }}>权重：</span>
                    <input
                      type="number"
                      value={testCase.weight}
                      onChange={(e) =>
                        handleTestCaseChange(index, "weight", parseFloat(e.target.value) || 1.0)
                      }
                      min="0"
                      step="0.1"
                      style={{
                        width: "80px",
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              disabled={classes.length === 0}
              style={{
                padding: "12px 24px",
                backgroundColor: classes.length === 0 ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: classes.length === 0 ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              创建任务
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewTask({ title: "", description: "", language: "python", deadline: "" });
                setTestCases([
                  { input_data: "", expected_output: "", is_hidden: false, order: 0, weight: 1.0 },
                ]);
                setSelectedClassId("");
              }}
              style={{
                padding: "12px 24px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div>
        <h3>任务列表</h3>
        {tasks.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              border: "2px dashed #ddd",
              borderRadius: "8px",
              backgroundColor: "#f8f9fa",
            }}
          >
            <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>暂无任务</h3>
            <p style={{ color: "#6c757d", marginBottom: "20px" }}>
              {classes.length === 0
                ? "请先创建班级，然后才能创建任务"
                : '点击"创建任务"按钮开始创建您的第一个任务'}
            </p>
            {!showCreateForm && classes.length > 0 && (
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
                立即创建任务
              </button>
            )}
            {classes.length === 0 && (
              <Link
                to="/classes"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  display: "inline-block",
                }}
              >
                先去创建班级
              </Link>
            )}
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "15px",
                  marginBottom: "15px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
                      <Link
                        to={`/tasks/${task.id}`}
                        style={{ textDecoration: "none", color: "#007bff" }}
                      >
                        {task.title}
                      </Link>
                    </h4>
                    <p style={{ color: "#6c757d", margin: "5px 0", lineHeight: "1.5" }}>
                      {task.description.length > 150
                        ? task.description.substring(0, 150) + "..."
                        : task.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        marginTop: "15px",
                        fontSize: "14px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        <strong>班级:</strong> {task.class_name}
                      </span>
                      <span>
                        <strong>语言:</strong>{" "}
                        <span
                          style={{
                            padding: "2px 8px",
                            backgroundColor: task.language === "java" ? "#f8d7da" : "#d4edda",
                            borderRadius: "4px",
                          }}
                        >
                          {task.language === "java" ? "Java" : "Python"}
                        </span>
                      </span>
                      <span>
                        <strong>测试用例:</strong> {task.test_case_count || 0}
                      </span>
                      {task.deadline && (
                        <span>
                          <strong>截止:</strong> {new Date(task.deadline).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <Link
                    to={`/submissions/classes/${task.class_obj}?task_id=${task.id}`}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#007bff",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      marginRight: "10px",
                    }}
                  >
                    查看提交
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        const blob = await api.exportGrades(undefined, task.id);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `任务_${task.id}_成绩统计.xlsx`;
                        a.click();
                      } catch (error: any) {
                        alert(getErrorMessage(error, "导出成绩失败"));
                      }
                    }}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    导出成绩
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

