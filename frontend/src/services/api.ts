import axios, { type AxiosInstance } from "axios";
import type {
  User,
  Class,
  Task,
  Submission,
  LoginResponse,
  InvitationCode,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 请求拦截器：添加token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器：处理token过期
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // 处理401未授权错误（token过期）
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // 如果是在登录接口，直接返回错误（避免无限循环）
          if (originalRequest.url?.includes("/auth/login/") || 
              originalRequest.url?.includes("/auth/register/")) {
            return Promise.reject(error);
          }
          
          try {
            const refresh = localStorage.getItem("refresh_token");
            if (refresh) {
              const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                refresh,
              });
              const { access } = response.data;
              localStorage.setItem("access_token", access);
              originalRequest.headers.Authorization = `Bearer ${access}`;
              return this.client(originalRequest);
            } else {
              // 没有refresh token，清除并跳转登录
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              // 修改错误信息，避免显示"用户名或密码错误"
              error.response.data = {
                ...error.response.data,
                detail: "登录已过期，请重新登录",
                token_expired: true,
              };
              window.location.href = "/login";
              return Promise.reject(error);
            }
          } catch (refreshError: any) {
            // token刷新失败，清除并跳转登录
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            // 修改错误信息
            if (error.response) {
              error.response.data = {
                ...error.response.data,
                detail: "登录已过期，请重新登录",
                token_expired: true,
              };
            }
            // 如果是登录页面，不跳转
            if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
            }
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // 认证相关
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post("/auth/login/", {
      username,
      password,
    });
    return response.data;
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    role: "admin" | "teacher" | "student";
    first_name?: string;
    last_name?: string;
  }): Promise<LoginResponse> {
    const response = await this.client.post("/auth/register/", data);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get("/auth/profile/");
    return response.data;
  }

  // 班级相关
  async getClasses(): Promise<Class[]> {
    const response = await this.client.get("/classes/");
    // 处理分页响应格式
    return response.data.results || response.data;
  }

  async getMyClasses(): Promise<Class[]> {
    const response = await this.client.get("/classes/my/");
    return response.data;
  }

  async getClass(id: number): Promise<Class> {
    const response = await this.client.get(`/classes/${id}/`);
    return response.data;
  }

  async createClass(data: { name: string; description?: string }): Promise<Class> {
    const response = await this.client.post("/classes/", data);
    return response.data;
  }

  async createInvitationCode(classId: number, maxUses?: number): Promise<InvitationCode> {
    const response = await this.client.post(`/classes/${classId}/invitation/`, {
      max_uses: maxUses || 0,
    });
    return response.data;
  }

  async joinClass(code: string): Promise<{ message: string; class: Class }> {
    const response = await this.client.post("/classes/join/", { code });
    return response.data;
  }

  // 任务相关
  async getTasks(classId?: number): Promise<Task[]> {
    const params = classId ? { class_id: classId } : {};
    const response = await this.client.get("/tasks/", { params });
    // 处理分页响应格式
    return response.data.results || response.data;
  }

  async getStudentTasks(): Promise<Task[]> {
    const response = await this.client.get("/tasks/student/");
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response = await this.client.get(`/tasks/${id}/`);
    return response.data;
  }

  async getStudentTask(id: number): Promise<Task> {
    const response = await this.client.get(`/tasks/student/${id}/`);
    return response.data;
  }

  async createTask(data: {
    title: string;
    description: string;
    language: "java" | "python";
    class_obj: number;
    deadline?: string;
    solution_mode?: "full" | "function";
    function_name?: string;
    template_code?: string;
    test_cases?: Array<{
      input_data: string;
      expected_output: string;
      is_hidden?: boolean;
      order?: number;
      weight?: number;
    }>;
  }): Promise<Task> {
    const response = await this.client.post("/tasks/", data);
    return response.data;
  }

  // 提交相关
  async testCode(taskId: number, codeContent: string, language: "java" | "python") {
    const response = await this.client.post(`/submissions/tasks/${taskId}/test/`, {
      code_content: codeContent,
      language,
    });
    return response.data;
  }

  async submitCode(taskId: number, codeContent: string, language: "java" | "python") {
    const response = await this.client.post(`/submissions/tasks/${taskId}/submit/`, {
      code_content: codeContent,
      language,
    });
    return response.data;
  }

  async getCodeAnalysis(taskId: number, codeContent: string) {
    const response = await this.client.post(`/submissions/tasks/${taskId}/analysis/`, {
      code_content: codeContent,
    });
    return response.data;
  }

  async getMySubmissions(taskId?: number): Promise<Submission[]> {
    const params = taskId ? { task_id: taskId } : {};
    const response = await this.client.get("/submissions/my/", { params });
    // 处理分页响应格式
    return response.data.results || response.data;
  }

  async getSubmission(id: number): Promise<any> {
    const response = await this.client.get(`/submissions/${id}/`);
    return response.data;
  }

  async getClassSubmissions(classId: number, taskId?: number): Promise<Submission[]> {
    const params = taskId ? { task_id: taskId } : {};
    const response = await this.client.get(`/submissions/classes/${classId}/`, { params });
    // 处理分页响应格式
    return response.data.results || response.data;
  }

  async exportGrades(classId?: number, taskId?: number, format: "excel" | "csv" = "excel") {
    const params: any = { format_type: format };  // 使用format_type避免与DRF的format参数冲突
    if (classId) params.class_id = classId;
    if (taskId) params.task_id = taskId;
    const response = await this.client.get("/submissions/export/", {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  // 管理员相关
  async getSystemStats() {
    const response = await this.client.get("/auth/admin/stats/");
    return response.data;
  }

  async getUserList(): Promise<User[]> {
    const response = await this.client.get("/auth/list/");
    // 处理分页响应格式
    return response.data.results || response.data;
  }

  async updateUserRole(userId: number, role: "admin" | "teacher" | "student") {
    const response = await this.client.patch(`/auth/${userId}/role/`, { role });
    return response.data;
  }

  async updateUser(userId: number, data: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  }) {
    const response = await this.client.patch(`/auth/${userId}/`, data);
    return response.data;
  }

  async deleteUser(userId: number) {
    const response = await this.client.delete(`/auth/${userId}/delete/`);
    return response.data;
  }
}

export const api = new ApiClient();

