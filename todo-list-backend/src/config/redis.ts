import Redis from 'ioredis';

// 创建 Redis 客户端实例
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost', // Redis 服务器地址
  port: parseInt(process.env.REDIS_PORT || '6379'), // Redis 端口
  password: process.env.REDIS_PASSWORD || '', // Redis 密码（如果有）
  db: 0, // 使用的数据库编号
  maxRetriesPerRequest: 3, // 最大重试次数
  retryStrategy: times => Math.min(times * 50, 2000), // 重试策略
});

// 监听连接事件
redis.on('connect', () => {
  console.log('Redis 连接成功');
});

// 监听错误事件
redis.on('error', err => {
  console.error('Redis 连接失败:', err);
});

export default redis;
