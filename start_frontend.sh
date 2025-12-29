#!/bin/bash

# 前端启动脚本（使用Node.js 20）

echo "🚀 启动前端服务器..."

# 加载nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 使用Node.js 20
nvm use 20

# 检查Node.js版本
NODE_VERSION=$(node --version)
echo "当前Node.js版本: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v20\. ]]; then
    echo "❌ 错误：需要Node.js 20.x，当前版本: $NODE_VERSION"
    echo "正在安装Node.js 20..."
    nvm install 20
    nvm use 20
fi

# 进入前端目录
cd "$(dirname "$0")/frontend"

# 启动服务器
echo "✅ 启动Vite开发服务器..."
npm run dev

