import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

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
    logging: false,
    port: parseInt(process.env.DB_PORT || '3300'),
    pool: {
      max: 10, // 最大连接数
      min: 0, // 最小连接数
      acquire: 30000, // 连接超时时间
      idle: 10000, // 空闲连接超时时间
    },
  }
);

export default sequelize;
