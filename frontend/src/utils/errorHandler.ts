/**
 * 从API错误响应中提取详细的错误消息
 * @param error - 错误对象
 * @param defaultMessage - 默认错误消息
 * @returns 友好的错误消息字符串
 */
export function getErrorMessage(error: any, defaultMessage: string = "操作失败"): string {
  // 如果没有错误响应，返回默认消息
  if (!error?.response) {
    if (error?.message) {
      return error.message;
    }
    if (error?.toString) {
      return error.toString();
    }
    return defaultMessage;
  }

  const response = error.response;
  const data = response.data;
  const errorMessage = typeof data === 'string' ? data : (data?.detail || data?.error || '');

  // 优先处理401错误（通常是token过期）
  if (response.status === 401) {
    // 检查是否有token过期标记
    if (data?.token_expired || 
        errorMessage?.includes("token") || 
        errorMessage?.includes("登录已过期") ||
        errorMessage?.includes("Invalid token") ||
        errorMessage?.includes("Token") ||
        errorMessage?.includes("not provided") ||
        errorMessage?.includes("Authentication credentials were not provided")) {
      return "登录已过期，请重新登录";
    }
    // 如果是登录接口的401，且错误消息明确提到用户名或密码，才显示"用户名或密码错误"
    if (error.config?.url?.includes("/auth/login/") && 
        (errorMessage?.includes("password") || errorMessage?.includes("username") || errorMessage?.includes("No active account"))) {
      return "用户名或密码错误";
    }
    // 其他401错误，默认显示登录过期
    return "登录已过期，请重新登录";
  }

  // 如果没有数据，根据状态码返回友好消息
  if (!data) {
    if (response.status === 403) {
      return "您没有权限执行此操作";
    }
    if (response.status === 404) {
      return "请求的资源不存在";
    }
    if (response.status === 500) {
      return "服务器错误，请稍后重试";
    }
    if (response.status >= 500) {
      return "服务器错误，请稍后重试";
    }
    if (response.status >= 400) {
      return "请求失败，请检查输入";
    }
    return defaultMessage;
  }

  // 处理字段级别的验证错误（Django REST Framework格式）
  // 格式: {field1: ["error1", "error2"], field2: ["error3"]}
  if (typeof data === "object" && !Array.isArray(data)) {
    const fieldErrors: string[] = [];
    
    // 检查是否有字段级别的错误
    for (const key in data) {
      const value = data[key];
      
      // 跳过非错误字段（如 detail, error 等会在后面处理）
      if (key === "detail" || key === "error") {
        continue;
      }
      
      // 如果值是数组，收集所有错误
      if (Array.isArray(value)) {
        value.forEach((msg: string) => {
          fieldErrors.push(`${getFieldName(key)}: ${msg}`);
        });
      }
      // 如果值是字符串，直接添加
      else if (typeof value === "string") {
        fieldErrors.push(`${getFieldName(key)}: ${value}`);
      }
      // 如果值是对象，递归处理
      else if (typeof value === "object") {
        const nestedErrors = Object.keys(value).map(
          (nestedKey) => `${getFieldName(key)}.${getFieldName(nestedKey)}: ${value[nestedKey]}`
        );
        fieldErrors.push(...nestedErrors);
      }
    }
    
    // 如果有字段级别的错误，优先返回
    if (fieldErrors.length > 0) {
      return fieldErrors.join("；");
    }
    
    // 处理简单字符串错误（detail 或 error 字段）
    if (data.detail) {
      return formatError(data.detail);
    }
    
    if (data.error) {
      return formatError(data.error);
    }
    
    // 如果整个data是字符串
    if (typeof data === "string") {
      return formatError(data);
    }
  }
  
  // 如果data是字符串
  if (typeof data === "string") {
    return formatError(data);
  }
  
  // 如果是数组
  if (Array.isArray(data) && data.length > 0) {
    return data.map((msg) => formatError(msg)).join("；");
  }

  return defaultMessage;
}

/**
 * 格式化错误消息，将常见的英文错误消息转换为中文
 */
function formatError(message: string): string {
  if (typeof message !== "string") {
    return String(message);
  }

  // 密码相关错误
  if (message.includes("This password is too short")) {
    return "密码过短，请至少使用8个字符";
  }
  if (message.includes("This password is too common")) {
    return "密码过于简单，请使用更复杂的密码";
  }
  if (message.includes("This password is entirely numeric")) {
    return "密码不能全为数字";
  }
  if (message.includes("password") && message.includes("similar")) {
    return "密码与用户名过于相似";
  }
  if (message.includes("password") && message.includes("match")) {
    return "两次密码输入不一致";
  }

  // 用户名相关错误
  if (message.includes("user") && message.includes("already exists")) {
    return "用户名已存在，请使用其他用户名";
  }
  if (message.includes("username") && message.includes("already exists")) {
    return "用户名已存在，请使用其他用户名";
  }
  if (message.includes("username") && message.includes("required")) {
    return "请输入用户名";
  }

  // 邮箱相关错误
  if (message.includes("email") && message.includes("already exists")) {
    return "邮箱已被注册，请使用其他邮箱";
  }
  if (message.includes("email") && message.includes("invalid")) {
    return "邮箱格式不正确";
  }
  if (message.includes("email") && message.includes("required")) {
    return "请输入邮箱地址";
  }

  // 认证相关错误
  if (message.includes("authentication") || message.includes("credentials")) {
    // 检查是否是token相关的认证错误或未提供认证信息
    if (message.includes("token") || 
        message.includes("Invalid token") || 
        message.includes("Token") ||
        message.includes("not provided") ||
        message.includes("were not provided") ||
        message.includes("Authentication credentials were not provided")) {
      return "登录已过期，请重新登录";
    }
    // 只有在明确是登录接口的错误时，才显示"用户名或密码错误"
    // 其他情况（如查看任务等）应该显示"登录已过期"
    return "登录已过期，请重新登录";
  }
  if (message.includes("token") && message.includes("invalid")) {
    return "登录已过期，请重新登录";
  }
  if (message.includes("Invalid token") || message.includes("Token is invalid") || message.includes("token is invalid")) {
    return "登录已过期，请重新登录";
  }
  if (message.includes("No active account")) {
    return "账号不存在或未激活";
  }
  // 网络连接错误
  if (message.includes("Network Error") || message.includes("ERR_CONNECTION_REFUSED") || message.includes("Failed to fetch")) {
    return "无法连接到服务器，请检查后端服务是否运行";
  }

  // 权限相关错误
  if (message.includes("permission") || message.includes("not authorized")) {
    return "您没有权限执行此操作";
  }

  // 资源不存在
  if (message.includes("not found") || message.includes("does not exist")) {
    return "请求的资源不存在";
  }

  // 网络相关错误
  if (message.includes("Network Error") || message.includes("network")) {
    return "网络连接失败，请检查网络设置";
  }
  if (message.includes("timeout")) {
    return "请求超时，请稍后重试";
  }

  // 返回原始消息（如果已经包含中文，直接返回）
  return message;
}

/**
 * 将字段名转换为中文
 */
function getFieldName(field: string): string {
  const fieldMap: { [key: string]: string } = {
    username: "用户名",
    password: "密码",
    password2: "确认密码",
    email: "邮箱",
    name: "名称",
    title: "标题",
    description: "描述",
    class_obj: "班级",
    language: "编程语言",
    deadline: "截止时间",
    test_cases: "测试用例",
    input_data: "输入数据",
    expected_output: "期望输出",
    code_content: "代码内容",
    role: "角色",
    first_name: "名",
    last_name: "姓",
  };

  return fieldMap[field] || field;
}

