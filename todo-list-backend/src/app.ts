import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import registerRoutes from './routes/index';

// 导入模型关联文件
import './models/index';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// 全局请求日志中间件 —— 必须放在 最前面！！！
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// 然后是 cors、json 解析
app.use(
  cors({
    origin: isProd ? 'https://todo-list-backend.vercel.app' : 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// 注册路由
registerRoutes(app);

// 404错误处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

export default app;
