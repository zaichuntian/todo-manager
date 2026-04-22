import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import sequelize from './config/database';
import todoRoutes from './routes/todo.route';
import userRoutes from './routes/user.route';
import categoryRoutes from './routes/category.route';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// 导入模型关联文件
import './models/index';

const app = express();
const port = parseInt(process.env.DEV_API_PORT || '3001');
const isProd = process.env.NODE_ENV === 'production';

// 全局请求日志中间件 —— 必须放在 最前面！！！
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// 然后是 cors、json 解析
app.use(
  cors({
    origin: isProd ? 'https://todo-list-backend.vercel.app' : 'http://localhost:5173', // 仅开发环境使用
    credentials: true,
  })
);
app.use(express.json());

// 最后才是 路由！！！
app.use('/api', userRoutes);
app.use('/api', todoRoutes);
app.use('/api', categoryRoutes);

// 404错误处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 数据库同步
sequelize.sync({ alter: !isProd }).then(() => {
  console.log('✅ 数据库同步完成');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 服务运行在 http://localhost:${port}`);
});
