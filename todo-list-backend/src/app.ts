import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import sequelize from './config/database';
import todoRoutes from './routes/todo.route';
import userRoutes from './routes/user.route';
import categoryRoutes from './routes/category.route';
import cors from 'cors';

import './models/user.model';
import './models/todo.model';
import './models/category.model';

const app = express();

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
    origin: 'http://localhost:5137',
    credentials: true,
  })
);
app.use(express.json());

// 最后才是 路由！！！
app.use('/api', userRoutes);
app.use('/api', todoRoutes);
app.use('/api', categoryRoutes);

// 数据库同步
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ 数据库同步完成');
});

app.listen(3001, '0.0.0.0', () => {
  console.log('🚀 服务运行在 http://localhost:3001');
});
