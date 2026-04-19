import dotenv from 'dotenv';
dotenv.config(); // 加载 .env 文件

import express from 'express';
import sequelize from './config/database';
import todoRoutes from './routes/todo.route';
import userRoutes from './routes/user.route';
import cors from 'cors';

// 关键！必须导入 User 模型，Sequelize 才会识别它
import './models/user.model';
import './models/todo.model';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5137', // 你的前端地址
    credentials: true,
  }),
);
app.use(express.json());

// 路由
app.use('/api', todoRoutes);
app.use('/api', userRoutes);

// 所有模型导入后，再执行同步！
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ 数据库同步完成，所有表已创建/更新');
});

app.listen(3001, '0.0.0.0', () => {
  console.log('🚀 服务运行在 http://localhost:3001');
});
