#!/bin/bash

# 代码评估系统启动脚本

echo "🚀 启动代码评估系统..."

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "❌ 虚拟环境不存在，请先运行: python3 -m venv venv"
    exit 1
fi

# 启动后端
echo "📦 启动后端服务器..."
cd backend
source ../venv/bin/activate
python manage.py migrate --noinput
echo "✅ 数据库迁移完成"
python manage.py runserver > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务器已启动 (PID: $BACKEND_PID)"
echo "   访问地址: http://localhost:8000"
cd ..

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端服务器..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ 前端服务器已启动 (PID: $FRONTEND_PID)"
echo "   访问地址: http://localhost:5173"
cd ..

echo ""
echo "✨ 系统启动完成！"
echo ""
echo "📝 访问地址："
echo "   前端: http://localhost:5173"
echo "   后端API: http://localhost:8000/api"
echo "   Django Admin: http://localhost:8000/admin"
echo ""
echo "📋 日志文件："
echo "   后端日志: backend.log"
echo "   前端日志: frontend.log"
echo ""
echo "🛑 停止服务器："
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   或运行: ./stop.sh"
echo ""

# 保存PID到文件
echo "$BACKEND_PID $FRONTEND_PID" > .server_pids

