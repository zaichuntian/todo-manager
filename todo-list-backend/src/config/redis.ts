import Redis from 'ioredis';
import { logger } from '@utils/logger';

// 创建 Redis 客户端实例
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || '',
  db: 0, // 使用的数据库编号
  maxRetriesPerRequest: 3, // 最大重试次数
  retryStrategy: times => Math.min(times * 50, 2000), // 重试策略
});

// 监听连接事件
redis.on('connect', () => {
  return logger.info('Redis 连接成功', { msg: 'ok' });
});

// 监听错误事件
redis.on('error', err => {
  return logger.error('Redis 连接失败:', err);
});

export default redis;
