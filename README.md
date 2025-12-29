# 代码评估系统

一个基于Django + React的在线代码评估系统，支持管理员、教师、学生三种角色。

## 功能特性

- **用户管理**: 支持管理员、教师、学生三种角色
- **班级管理**: 教师可以创建班级，生成邀请码，学生通过邀请码加入
- **任务管理**: 教师可以创建编程任务（支持Java和Python）
- **代码执行**: 集成Judge0 API，支持在线代码测试和提交
- **自动评分**: 基于测试用例自动评分
- **成绩导出**: 支持导出Excel/CSV格式的成绩单
- **统计功能**: 记录测试次数和耗时

## 技术栈

### 后端
- Django 4.2
- Django REST Framework
- PostgreSQL
- JWT认证
- Judge0 API (代码执行)

### 前端
- React 18
- TypeScript
- Vite
- Monaco Editor (代码编辑器)
- React Router

## 安装和运行

### 后端设置

1. 创建虚拟环境并激活：
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 配置环境变量：
```bash
cp .env.example .env
# 编辑.env文件，配置数据库和Judge0 API密钥
```

4. 创建数据库：
```bash
# 确保PostgreSQL已安装并运行
# 创建数据库
createdb exam_management

# 运行迁移
python manage.py migrate

# 创建超级用户（可选）
python manage.py createsuperuser
```

5. 运行开发服务器：
```bash
python manage.py runserver
```

### 前端设置

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑.env文件，设置API基础URL
```

3. 运行开发服务器：
```bash
npm run dev
```

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
└── README.md
```

## 使用说明

### 教师
1. 注册/登录教师账号
2. 创建班级
3. 生成邀请码，分享给学生
4. 创建任务，设置测试用例
5. 查看学生提交和成绩
6. 导出成绩单

### 学生
1. 注册/登录学生账号
2. 通过邀请码加入班级
3. 查看任务列表
4. 在代码编辑器中编写代码
5. 点击"测试"按钮测试代码
6. 测试通过后点击"提交"
7. 查看提交历史和成绩

### 管理员
1. 登录管理员账号
2. 查看系统统计
3. 管理用户和角色

## 环境变量配置

### 后端 (.env)
- `SECRET_KEY`: Django密钥
- `DEBUG`: 调试模式
- `DB_*`: 数据库配置
- `JUDGE0_API_KEY`: Judge0 API密钥（需要注册RapidAPI账号）

### 前端 (.env)
- `VITE_API_BASE_URL`: 后端API地址

## 注意事项

1. 需要配置Judge0 API密钥才能使用代码执行功能
2. 确保PostgreSQL数据库已安装并运行
3. 开发环境下CORS已配置允许localhost访问

## 许可证

MIT

