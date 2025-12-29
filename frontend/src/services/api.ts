import axios, { AxiosInstance } from "axios";
import type {
  User,
  Class,
  Task,
  Submission,
  LoginResponse,
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
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
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
            }
          } catch (refreshError) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
            return Promise.reject(refreshError);
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
    return response.data;
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
    return response.data;
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

  async getMySubmissions(taskId?: number): Promise<Submission[]> {
    const params = taskId ? { task_id: taskId } : {};
    const response = await this.client.get("/submissions/my/", { params });
    return response.data;
  }

  async getSubmission(id: number): Promise<any> {
    const response = await this.client.get(`/submissions/${id}/`);
    return response.data;
  }

  async getClassSubmissions(classId: number, taskId?: number): Promise<Submission[]> {
    const params = taskId ? { task_id: taskId } : {};
    const response = await this.client.get(`/submissions/classes/${classId}/`, { params });
    return response.data;
  }

  async exportGrades(classId?: number, taskId?: number, format: "excel" | "csv" = "excel") {
    const params: any = { format };
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
    return response.data;
  }

  async updateUserRole(userId: number, role: "admin" | "teacher" | "student") {
    const response = await this.client.patch(`/auth/${userId}/role/`, { role });
    return response.data;
  }
}

export const api = new ApiClient();

