export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "admin" | "teacher" | "student";
  created_at: string;
}

export interface Class {
  id: number;
  name: string;
  description?: string;
  teacher: number;
  teacher_name: string;
  student_count: number;
  students?: User[]; // 班级详情时包含学生列表
  active_invitation_code?: InvitationCode;
  invitation_codes?: InvitationCode[]; // 班级详情时包含所有邀请码
  created_at: string;
  updated_at: string;
}

export interface InvitationCode {
  id: number;
  code: string;
  expires_at?: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  language: "java" | "python";
  class_obj: number;
  class_name: string;
  created_by: number;
  created_by_name: string;
  deadline?: string;
  test_case_count: number;
  test_cases?: TestCase[]; // 任务详情时包含测试用例
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  id: number;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
  order: number;
  weight: number;
  created_at: string;
}

export interface Submission {
  id: number;
  task: number;
  task_title: string;
  student: number;
  student_name: string;
  code_content: string;
  language: "java" | "python";
  score: number;
  test_count: number;
  total_time: number;
  submitted_at: string;
  updated_at: string;
}

export interface SubmissionDetail extends Submission {
  test_results?: TestResult[];
}

export interface TestResult {
  id: number;
  test_case: number;
  test_case_info?: {
    id: number;
    order: number;
    is_hidden: boolean;
  };
  passed: boolean;
  output: string;
  error_message?: string;
  execution_time: number;
  created_at: string;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
}

