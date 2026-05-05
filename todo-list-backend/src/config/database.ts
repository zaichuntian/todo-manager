import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '@utils/logger';

// 加载环境变量
dotenv.config();

// 从环境变量中读取数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'todo_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '0000',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: (process.env.DB_DIALECT || 'mysql') as any,
    logging: process.env.NODE_ENV === 'development' ? (msg: string) => logger.debug(msg) : false,
    port: parseInt(process.env.DB_PORT || '3300'),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20'), // 最大连接数
      min: parseInt(process.env.DB_POOL_MIN || '5'), // 最小连接数
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '60000'), // 连接超时时间
      idle: parseInt(process.env.DB_POOL_IDLE || '30000'), // 空闲连接超时时间
      evict: parseInt(process.env.DB_POOL_EVICT || '10000'), // 连接回收时间
    },
    dialectOptions: {
      charset: 'utf8mb4', // 支持emoji
      connectTimeout: 30000,
    },
    define: {
      underscored: false,
    },
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

// 自动同步数据库模型
const syncModels = async () => {
  try {
    // 仅在开发环境中同步，并且不使用alter模式以避免修改现有表结构
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false });
      logger.info('数据库模型同步成功');
    }
  } catch (error) {
    logger.error('数据库模型同步失败:', error);
    // 同步失败时不退出进程，让应用继续运行
    logger.warn('数据库同步失败，应用将继续运行，但某些功能可能无法正常工作');
  }
};

export { sequelize, testConnection, syncModels };
export default sequelize;
