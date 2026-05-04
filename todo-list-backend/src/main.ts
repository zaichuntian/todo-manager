import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { testConnection, syncModels } from './config';
import { logger } from './utils/logger';

const port = parseInt(process.env.DEV_API_PORT || '3001');

// 启动应用
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();

    // 同步数据库模型
    await syncModels();

    // 启动服务器
    app.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 服务运行在 http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('服务启动失败:', error);
    process.exit(1);
  }
};

startServer();
