import redis from '../config/redis';

export class RedisUtil {
  // 设置缓存（带过期时间）
  static async set(key: string, value: any, expire = 3600): Promise<void> {
    try {
      const data = typeof value === 'object' ? JSON.stringify(value) : value;
      await redis.set(key, data, 'EX', expire);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  // 获取缓存
  static async get(key: string): Promise<any> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  // 删除缓存
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  // 清除匹配模式的缓存
  static async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis delByPattern error:', error);
    }
  }
}
