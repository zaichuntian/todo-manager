# 使用 Node.js 20 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（包括开发依赖，用于编译 TypeScript）
RUN npm install

# 复制源代码
COPY . .

# 编译 TypeScript 为 JavaScript
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "dist/main.js"]