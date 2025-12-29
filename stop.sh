#!/bin/bash

# 停止服务器脚本

echo "🛑 停止代码评估系统..."

if [ -f ".server_pids" ]; then
    PIDS=$(cat .server_pids)
    for PID in $PIDS; do
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID
            echo "✅ 已停止进程 $PID"
        fi
    done
    rm .server_pids
    echo "✅ 所有服务器已停止"
else
    echo "⚠️  未找到运行中的服务器"
    # 尝试查找并停止
    pkill -f "manage.py runserver"
    pkill -f "vite"
    echo "✅ 已尝试停止相关进程"
fi

