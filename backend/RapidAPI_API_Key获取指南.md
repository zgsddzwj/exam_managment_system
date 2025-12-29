# RapidAPI Judge0 API Key 获取指南

## 步骤详解

### 第一步：注册/登录 RapidAPI

1. 访问 RapidAPI 官网：https://rapidapi.com/
2. 如果您还没有账号，点击右上角 "Sign Up" 注册（可以使用GitHub、Google账号快速注册）
3. 如果已有账号，直接点击 "Log In" 登录

### 第二步：搜索并订阅 Judge0 CE API

1. 登录后，在搜索框中输入：`judge0-ce`
2. 或者直接访问：https://rapidapi.com/judge0-official/api/judge0-ce
3. 点击进入 "Judge0 CE" API 页面

### 第三步：订阅 API（选择套餐）

1. 在API页面，您会看到 "Pricing" 或"定价"区域
2. 通常有以下几个套餐：
   - **Basic（免费）**：通常每月有有限的请求次数
   - **Pro（付费）**：更多请求次数和更好的性能
   - **Ultra（付费）**：无限制请求
3. 对于开发和测试，**Basic免费套餐**通常足够
4. 点击 "Subscribe" 或"订阅"按钮，选择 Basic 套餐
5. 按照提示完成订阅（可能需要验证信用卡，但免费套餐通常不会收费）

### 第四步：获取 API Key

获取API Key有两种方式：

#### 方式1：从 Dashboard 获取（推荐）

1. 登录 RapidAPI 后，点击右上角的头像
2. 在下拉菜单中点击 **"Dashboard"** 或"仪表板"
3. 在 Dashboard 页面，查看左侧菜单
4. 找到并点击 **"Security"** 或"安全"选项
5. 在 Security 页面，您会看到：
   - **Default Application Key**（默认应用密钥）
   - 或者您创建的其他应用密钥
6. 点击 **"Show"** 或"显示"按钮来查看完整的 API Key
7. **复制**这个 API Key（格式类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

#### 方式2：从 API 页面获取

1. 在 Judge0 CE API 页面（https://rapidapi.com/judge0-official/api/judge0-ce）
2. 页面顶部通常会显示您的 API Key
3. 如果没有显示，点击 **"Test Endpoint"** 或"测试端点"
4. 在弹出的代码示例中，可以看到请求头部分：
   ```javascript
   headers: {
     "X-RapidAPI-Key": "你的API_Key_在这里"
   }
   ```

### 第五步：查看 Host

在同一个页面或代码示例中，您还会看到：
```
X-RapidAPI-Host: judge0-ce.p.rapidapi.com
```

这就是您需要的 Host 值。

## 配置到项目中

获取到 API Key 后，按照以下步骤配置：

### 1. 编辑 `.env` 文件

在 `backend` 目录下，编辑 `.env` 文件（如果不存在则创建）：

```env
# Judge0 API配置（RapidAPI）
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=你刚才复制的API_Key_粘贴在这里
JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
```

**重要提示：**
- 替换 `你刚才复制的API_Key_粘贴在这里` 为您从RapidAPI复制的实际API Key
- 确保没有多余的空格或引号
- API Key 通常很长，确保完整复制

### 2. 重启后端服务

配置完成后，重启Django后端服务：

```bash
# 停止当前运行的服务（Ctrl+C）
# 然后重新启动
cd backend
python manage.py runserver
```

## 验证配置

1. 重启后端服务后
2. 在前端页面尝试测试代码
3. 如果配置正确，代码应该能够正常执行

## 常见问题

### Q: 我在Security页面看不到API Key？
A: 请确保：
- 您已经登录了RapidAPI账号
- 已经订阅了Judge0 CE API（至少是免费套餐）
- 刷新页面重试

### Q: 免费套餐有多少请求次数？
A: 具体限制请查看RapidAPI上的套餐详情。通常Basic免费套餐每月有一定数量的请求，对于开发测试通常足够。

### Q: API Key显示为`****`，无法复制？
A: 点击"Show"按钮可以显示完整的API Key。

### Q: 配置后仍然报401错误？
A: 请检查：
- API Key是否正确复制（没有多余空格）
- `.env` 文件是否在 `backend` 目录下
- 是否已经重启后端服务
- 是否已经订阅了Judge0 CE API

## 截图位置参考

以下是关键页面的位置：

1. **Dashboard入口**：
   - 登录后 → 右上角头像 → Dashboard

2. **Security页面**：
   - Dashboard → 左侧菜单 → Security/Security & API Keys

3. **API Key位置**：
   - Security页面 → Default Application Key 部分

## 相关链接

- RapidAPI 官网：https://rapidapi.com/
- Judge0 CE API：https://rapidapi.com/judge0-official/api/judge0-ce
- RapidAPI Dashboard：https://rapidapi.com/developer/dashboard
- RapidAPI Security：https://rapidapi.com/developer/security

