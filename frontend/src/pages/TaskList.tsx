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
    solution_mode: "full" as "full" | "function",
    function_name: "",
    template_code: "",
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

    // 验证函数模式必需的字段
    if (newTask.solution_mode === "function" && !newTask.function_name.trim()) {
      alert("函数模式下必须指定函数名称");
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
      setNewTask({ title: "", description: "", language: "python", deadline: "", solution_mode: "full", function_name: "", template_code: "" });
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
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: "2px solid var(--border-light, #f3f4f6)",
      }}>
        <h2 style={{
          margin: 0,
          color: "var(--text-primary, #1f2937)",
          fontSize: "var(--font-size-2xl, 24px)",
        }}>任务管理</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--primary-color, #1e40af)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md, 6px)",
            cursor: "pointer",
            fontSize: "var(--font-size-base, 16px)",
            fontWeight: 500,
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)"}
        >
          {showCreateForm ? "取消" : "创建任务"}
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          style={{
            marginBottom: "24px",
            padding: "24px",
            border: "1px solid var(--border-color, #e5e7eb)",
            borderRadius: "var(--radius-lg, 8px)",
            backgroundColor: "var(--bg-primary, #ffffff)",
            boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
          }}
        >
          <h3 style={{
            marginTop: "0",
            marginBottom: "24px",
            color: "var(--text-primary, #1f2937)",
            fontSize: "var(--font-size-xl, 20px)",
          }}>创建新任务</h3>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              fontWeight: 500,
              display: "block",
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>
              所属班级<span style={{ color: "var(--danger-color, #dc2626)", marginLeft: "4px" }}>*</span>
            </label>
            {classes.length === 0 ? (
              <div style={{
                padding: "12px",
                backgroundColor: "var(--warning-light, #fef3c7)",
                borderRadius: "var(--radius-md, 6px)",
                border: "1px solid var(--warning-color, #d97706)",
              }}>
                <p style={{
                  margin: "0",
                  color: "var(--warning-hover, #b45309)",
                  fontSize: "var(--font-size-sm, 14px)",
                }}>
                  您还没有创建班级，请先{" "}
                  <Link to="/classes" style={{
                    color: "var(--primary-color, #1e40af)",
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}>
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
                  padding: "12px",
                  marginTop: "4px",
                  border: "1px solid var(--border-color, #e5e7eb)",
                  borderRadius: "var(--radius-md, 6px)",
                  fontSize: "var(--font-size-base, 16px)",
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
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              fontWeight: 500,
              display: "block",
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>
              任务标题<span style={{ color: "var(--danger-color, #dc2626)", marginLeft: "4px" }}>*</span>
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
              placeholder="例如：计算两数之和"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "4px",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "var(--radius-md, 6px)",
                fontSize: "var(--font-size-base, 16px)",
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
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              fontWeight: 500,
              display: "block",
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>
              任务描述<span style={{ color: "var(--danger-color, #dc2626)", marginLeft: "4px" }}>*</span>
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              required
              rows={6}
              placeholder="详细描述任务要求，包括输入输出格式、示例等..."
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "4px",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "var(--radius-md, 6px)",
                fontSize: "var(--font-size-base, 16px)",
                fontFamily: "inherit",
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
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              fontWeight: 500,
              display: "block",
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>
              编程语言<span style={{ color: "var(--danger-color, #dc2626)", marginLeft: "4px" }}>*</span>
            </label>
            <select
              value={newTask.language}
              onChange={(e) =>
                setNewTask({ ...newTask, language: e.target.value as "java" | "python" })
              }
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "4px",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "var(--radius-md, 6px)",
                fontSize: "var(--font-size-base, 16px)",
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
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              fontWeight: 500,
              display: "block",
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>
              代码模式<span style={{ color: "var(--danger-color, #dc2626)", marginLeft: "4px" }}>*</span>
            </label>
            <select
              value={newTask.solution_mode}
              onChange={(e) => setNewTask({ ...newTask, solution_mode: e.target.value as "full" | "function" })}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "4px",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "var(--radius-md, 6px)",
                fontSize: "var(--font-size-base, 16px)",
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
            >
              <option value="full">完整程序模式（学生编写完整可执行程序）</option>
              <option value="function">函数模式（LeetCode风格，学生只需编写函数）</option>
            </select>
            <div style={{
              marginTop: "8px",
              padding: "10px",
              backgroundColor: newTask.solution_mode === "function" ? "var(--info-light, #cffafe)" : "var(--bg-tertiary, #f3f4f6)",
              borderRadius: "var(--radius-md, 6px)",
              fontSize: "var(--font-size-sm, 14px)",
              color: newTask.solution_mode === "function" ? "var(--info-hover, #0e7490)" : "var(--text-secondary, #6b7280)",
            }}>
              {newTask.solution_mode === "function" 
                ? "✓ LeetCode模式：学生只需编写函数代码，系统会自动处理输入输出和测试。适合算法练习。"
                : "完整程序模式：学生需要编写完整的可执行程序，包括main函数和输入输出处理。"}
            </div>
          </div>

          {newTask.solution_mode === "function" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "8px",
                  color: "var(--text-primary, #1f2937)",
                }}>
                  函数名称<span style={{ color: "var(--danger-color, #dc2626)", marginLeft: "4px" }}>*</span>
                </label>
                <input
                  type="text"
                  value={newTask.function_name}
                  onChange={(e) => setNewTask({ ...newTask, function_name: e.target.value })}
                  required={newTask.solution_mode === "function"}
                  placeholder={newTask.language === "python" ? "例如：twoSum" : "例如：twoSum"}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "4px",
                    border: "1px solid var(--border-color, #e5e7eb)",
                    borderRadius: "var(--radius-md, 6px)",
                    fontSize: "var(--font-size-base, 16px)",
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
                <div style={{
                  marginTop: "6px",
                  fontSize: "var(--font-size-xs, 12px)",
                  color: "var(--text-secondary, #6b7280)",
                }}>
                  学生需要实现的函数名称
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "8px",
                  color: "var(--text-primary, #1f2937)",
                }}>
                  模板代码（可选）
                </label>
                <textarea
                  value={newTask.template_code}
                  onChange={(e) => setNewTask({ ...newTask, template_code: e.target.value })}
                  rows={8}
                  placeholder={newTask.language === "python" 
                    ? `# Python示例：\ndef ${newTask.function_name || "function"}(nums, target):\n    # 在这里编写你的代码\n    pass`
                    : `// Java示例：\npublic class Solution {\n    public int ${newTask.function_name || "function"}(int[] nums, int target) {\n        // 在这里编写你的代码\n        return 0;\n    }\n}`}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "4px",
                    border: "1px solid var(--border-color, #e5e7eb)",
                    borderRadius: "var(--radius-md, 6px)",
                    fontSize: "var(--font-size-sm, 14px)",
                    fontFamily: "monospace",
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
                <div style={{
                  marginTop: "6px",
                  fontSize: "var(--font-size-xs, 12px)",
                  color: "var(--text-secondary, #6b7280)",
                }}>
                  可选：提供函数签名和基础代码框架。如果不提供，学生需要从头编写函数定义。
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              fontWeight: 500,
              display: "block",
              marginBottom: "8px",
              color: "var(--text-primary, #1f2937)",
            }}>
              截止时间（可选）
            </label>
            <input
              type="datetime-local"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "4px",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "var(--radius-md, 6px)",
                fontSize: "var(--font-size-base, 16px)",
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

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              type="submit"
              disabled={classes.length === 0}
              style={{
                padding: "12px 24px",
                backgroundColor: classes.length === 0 ? "var(--text-muted, #9ca3af)" : "var(--success-color, #059669)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md, 6px)",
                cursor: classes.length === 0 ? "not-allowed" : "pointer",
                fontSize: "var(--font-size-base, 16px)",
                fontWeight: 500,
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (classes.length > 0) {
                  e.currentTarget.style.backgroundColor = "var(--success-hover, #047857)";
                }
              }}
              onMouseLeave={(e) => {
                if (classes.length > 0) {
                  e.currentTarget.style.backgroundColor = "var(--success-color, #059669)";
                }
              }}
            >
              创建任务
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewTask({ 
                  title: "", 
                  description: "", 
                  language: "python", 
                  deadline: "",
                  solution_mode: "full",
                  function_name: "",
                  template_code: "",
                });
                setTestCases([
                  { input_data: "", expected_output: "", is_hidden: false, order: 0, weight: 1.0 },
                ]);
                setSelectedClassId("");
              }}
              style={{
                padding: "12px 24px",
                backgroundColor: "var(--bg-tertiary, #f3f4f6)",
                color: "var(--text-primary, #1f2937)",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "var(--radius-md, 6px)",
                cursor: "pointer",
                fontSize: "var(--font-size-base, 16px)",
                fontWeight: 500,
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--border-color, #e5e7eb)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary, #f3f4f6)"}
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 style={{
          marginBottom: "20px",
          color: "var(--text-primary, #1f2937)",
          fontSize: "var(--font-size-xl, 20px)",
        }}>任务列表</h3>
        {tasks.length === 0 ? (
          <div
            style={{
              padding: "60px 40px",
              textAlign: "center",
              border: "2px dashed var(--border-color, #e5e7eb)",
              borderRadius: "var(--radius-lg, 8px)",
              backgroundColor: "var(--bg-primary, #ffffff)",
            }}
          >
            <h3 style={{
              color: "var(--text-secondary, #6b7280)",
              marginBottom: "12px",
              fontSize: "var(--font-size-xl, 20px)",
            }}>暂无任务</h3>
            <p style={{
              color: "var(--text-secondary, #6b7280)",
              marginBottom: "24px",
              fontSize: "var(--font-size-base, 16px)",
            }}>
              {classes.length === 0
                ? "请先创建班级，然后才能创建任务"
                : '点击"创建任务"按钮开始创建您的第一个任务'}
            </p>
            {!showCreateForm && classes.length > 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "var(--primary-color, #1e40af)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-md, 6px)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-base, 16px)",
                  fontWeight: 500,
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)"}
              >
                立即创建任务
              </button>
            )}
            {classes.length === 0 && (
              <Link
                to="/classes"
                style={{
                  padding: "12px 24px",
                  backgroundColor: "var(--success-color, #059669)",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "var(--radius-md, 6px)",
                  fontSize: "var(--font-size-base, 16px)",
                  display: "inline-block",
                  fontWeight: 500,
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--success-hover, #047857)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--success-color, #059669)"}
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
                  border: "1px solid var(--border-color, #e5e7eb)",
                  borderRadius: "var(--radius-lg, 8px)",
                  padding: "20px",
                  marginBottom: "16px",
                  backgroundColor: "var(--bg-primary, #ffffff)",
                  boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
                  transition: "box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: "0 0 12px 0",
                      fontSize: "var(--font-size-lg, 18px)",
                      color: "var(--text-primary, #1f2937)",
                    }}>
                      <Link
                        to={`/tasks/${task.id}`}
                        style={{
                          textDecoration: "none",
                          color: "var(--primary-color, #1e40af)",
                          fontWeight: 600,
                        }}
                      >
                        {task.title}
                      </Link>
                    </h4>
                    <p style={{
                      color: "var(--text-secondary, #6b7280)",
                      margin: "8px 0",
                      lineHeight: "var(--line-height-relaxed, 1.75)",
                    }}>
                      {task.description.length > 150
                        ? task.description.substring(0, 150) + "..."
                        : task.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "24px",
                        marginTop: "16px",
                        fontSize: "var(--font-size-sm, 14px)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "var(--text-secondary, #6b7280)" }}>
                        <strong style={{ color: "var(--text-primary, #1f2937)" }}>班级:</strong> {task.class_name}
                      </span>
                      <span style={{ color: "var(--text-secondary, #6b7280)" }}>
                        <strong style={{ color: "var(--text-primary, #1f2937)" }}>语言:</strong>{" "}
                        <span
                          style={{
                            padding: "4px 8px",
                            backgroundColor: task.language === "java" ? "var(--danger-light, #fee2e2)" : "var(--success-light, #d1fae5)",
                            color: task.language === "java" ? "var(--danger-color, #dc2626)" : "var(--success-color, #059669)",
                            borderRadius: "var(--radius-sm, 4px)",
                            fontSize: "var(--font-size-xs, 12px)",
                            fontWeight: 500,
                          }}
                        >
                          {task.language === "java" ? "Java" : "Python"}
                        </span>
                      </span>
                      <span style={{ color: "var(--text-secondary, #6b7280)" }}>
                        <strong style={{ color: "var(--text-primary, #1f2937)" }}>测试用例:</strong> {task.test_case_count || 0}
                      </span>
                      {task.deadline && (
                        <span style={{ color: "var(--text-secondary, #6b7280)" }}>
                          <strong style={{ color: "var(--text-primary, #1f2937)" }}>截止:</strong> {new Date(task.deadline).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link
                    to={`/submissions/classes/${task.class_obj}?task_id=${task.id}`}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--primary-color, #1e40af)",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "var(--radius-md, 6px)",
                      fontSize: "var(--font-size-sm, 14px)",
                      fontWeight: 500,
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover, #1e3a8a)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color, #1e40af)"}
                  >
                    查看提交
                  </Link>
                  <Link
                    to={`/tasks/${task.id}/statistics`}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--info-color, #0891b2)",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "var(--radius-md, 6px)",
                      fontSize: "var(--font-size-sm, 14px)",
                      fontWeight: 500,
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--info-hover, #0e7490)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--info-color, #0891b2)"}
                  >
                    统计
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        console.log("开始导出成绩，任务ID:", task.id);
                        const blob = await api.exportGrades(undefined, task.id);
                        console.log("导出成功，Blob大小:", blob.size);
                        
                        if (!blob || blob.size === 0) {
                          alert("导出失败：返回的文件为空");
                          return;
                        }
                        
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `任务_${task.id}_成绩统计.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        console.log("文件下载已触发");
                      } catch (error: any) {
                        console.error("导出成绩失败:", error);
                        console.error("错误详情:", error.response);
                        alert(getErrorMessage(error, "导出成绩失败，请检查是否有学生提交"));
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--success-color, #059669)",
                      color: "white",
                      border: "none",
                      borderRadius: "var(--radius-md, 6px)",
                      cursor: "pointer",
                      fontSize: "var(--font-size-sm, 14px)",
                      fontWeight: 500,
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--success-hover, #047857)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--success-color, #059669)"}
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

