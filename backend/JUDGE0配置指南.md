# Judge0 API 配置指南

## 问题说明

当学生点击测试时出现以下错误：
```json
{
    "error": "API请求失败: 401",
    "details": "{\"message\":\"Invalid API key. Go to https://docs.rapidapi.com/docs/keys for more info.\"}"
}
```

这是因为Judge0 API key未配置或配置错误。

## 解决方案

有两种配置Judge0的方式：

### 方案1: 使用RapidAPI（推荐用于生产环境）

**优点：**
- 稳定可靠
- 有技术支持和文档
- 适合生产环境使用

**步骤：**

1. 访问 [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. 注册/登录账号
3. 订阅免费套餐（或付费套餐）
4. 获取API Key：
   - 登录后进入 Dashboard
   - 在左侧菜单找到 "Security" 或"安全"
   - 复制您的API Key
5. 在 `backend` 目录下创建 `.env` 文件（如果不存在）
6. 添加以下配置：
```env
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=你的API_Key_在这里
JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
```

### 方案2: 使用Judge0 CE公共实例（适合开发测试）

**优点：**
- 免费使用
- 无需注册

**缺点：**
- 可能有速率限制
- 稳定性不如RapidAPI

**步骤：**

1. 在 `backend` 目录下创建 `.env` 文件（如果不存在）
2. 添加以下配置：
```env
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY=
JUDGE0_RAPIDAPI_HOST=
```

**注意：** 如果使用公共实例，`JUDGE0_API_KEY` 可以留空或删除该行。

## 配置示例

在 `backend` 目录下创建 `.env` 文件，内容如下：

### 使用RapidAPI
```env
# Django配置
SECRET_KEY=your-secret-key-here
DEBUG=True

# Judge0 API配置（RapidAPI）
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=你的RapidAPI_Key_在这里
JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
```

### 使用Judge0 CE公共实例
```env
# Django配置
SECRET_KEY=your-secret-key-here
DEBUG=True

# Judge0 API配置（公共实例）
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY=
JUDGE0_RAPIDAPI_HOST=
```

## 应用配置

配置完成后，需要重启Django后端服务：

```bash
# 如果后端服务正在运行，请先停止（Ctrl+C）
# 然后重新启动
cd backend
python manage.py runserver
```

## 验证配置

配置完成后，可以：
1. 重启后端服务
2. 在前端页面尝试测试代码
3. 如果配置正确，应该能够正常执行代码测试

## 常见问题

### Q: 我配置了API key但还是报401错误？
A: 请检查：
- API key是否正确复制（没有多余的空格）
- 是否使用的是RapidAPI的key（不是其他平台的key）
- 在RapidAPI上是否已订阅Judge0 CE服务

### Q: 公共实例是否可以用于生产环境？
A: 不建议。公共实例有速率限制且可能不稳定，生产环境建议使用RapidAPI。

### Q: 如何切换到另一种配置方式？
A: 修改 `.env` 文件中的配置，然后重启后端服务即可。

## 相关链接

- [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
- [Judge0 官方文档](https://github.com/judge0/judge0)
- [RapidAPI API Key 文档](https://docs.rapidapi.com/docs/keys)

