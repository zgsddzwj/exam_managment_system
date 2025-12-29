# 代码评估系统

一个基于Django + React的在线代码评估系统，支持管理员、教师、学生三种角色。

## 功能特性

- **用户管理**: 支持管理员、教师、学生三种角色
- **班级管理**: 教师可以创建班级，生成邀请码，学生通过邀请码加入
- **任务管理**: 教师可以创建编程任务（支持Java和Python）
- **代码执行**: 集成Judge0 API，支持在线代码测试和提交
- **自动评分**: 基于测试用例自动评分
- **成绩导出**: 支持导出Excel/CSV格式的成绩单
- **统计功能**: 记录测试次数和耗时，支持任务统计查看
- **个人信息管理**: 支持查看和修改个人信息，修改登录密码

## 技术栈

### 后端
- Django 4.2
- Django REST Framework
- PostgreSQL / SQLite
- JWT认证
- Judge0 API (代码执行)

### 前端
- React 18
- TypeScript
- Vite
- Monaco Editor (代码编辑器)
- React Router

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/zgsddzwj/exam_managment_system.git
cd exam_managment_system
```

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置数据库和Judge0 API密钥（见下方配置说明）

# 创建数据库（SQLite开发环境）
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 运行开发服务器
python manage.py runserver
```

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置API基础URL

# 运行开发服务器
npm run dev
```

### 4. 访问系统

- **前端**: http://localhost:5173
- **后端API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

## 环境变量配置

### 后端配置

复制 `backend/.env.example` 为 `backend/.env`，然后编辑配置：

**必需配置：**
- `SECRET_KEY`: Django密钥（使用 `python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` 生成）
- `JUDGE0_API_KEY`: Judge0 API密钥（必须配置才能使用代码执行功能）

**获取RapidAPI Key：**
1. 访问 https://rapidapi.com/ 注册/登录
2. 搜索并订阅 "Judge0 CE" API（免费套餐即可）
3. 在 Dashboard → Security 中获取 API Key
4. 将 API Key 填入 `.env` 文件

**生产环境数据库配置：**
如需使用PostgreSQL，取消注释并配置数据库相关项。

详细配置说明请参考 `backend/.env.example` 文件。

### 前端配置

复制 `frontend/.env.example` 为 `frontend/.env`，设置后端API地址：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

生产环境构建时，修改为实际的后端API地址。

## 项目结构

```
exam_management_system/
├── backend/              # Django后端
│   ├── config/          # Django配置
│   ├── users/           # 用户管理
│   ├── classes/         # 班级管理
│   ├── tasks/           # 任务管理
│   └── submissions/     # 提交和评分
├── frontend/            # React前端
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   ├── services/    # API服务
│   │   └── context/     # 上下文
│   └── dist/            # 构建输出
└── README.md
```

## 部署

生产环境部署请参考 [部署指南.md](部署指南.md)

## 许可证

MIT
