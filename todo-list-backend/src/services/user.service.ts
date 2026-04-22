// src/services/user.service.ts
import User from '../models/user.model';
import { BaseService } from './base.service';
import { RedisUtil } from '../utils/redis';

export class UserService extends BaseService<any> {
  // 查询用户列表（分页）
  static async findAll(pageNum: number, pageSize: number) {
    const cacheKey = `users:all:${pageNum}:${pageSize}`;
    const cachedData = await RedisUtil.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await super.findAll(User, pageNum, pageSize);
    await RedisUtil.set(cacheKey, data, 300);
    return data;
  }

  // 根据 uuid 查询单个用户
  static async findByUuid(uuid: string) {
    const cacheKey = `user:uuid:${uuid}`;
    const cachedData = await RedisUtil.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await super.findByUuid(User, uuid);
    if (data) {
      await RedisUtil.set(cacheKey, data, 3600);
    }
    return data;
  }

  // 根据用户名查询（登录/注册用）
  static async findByUsername(username: string) {
    const cacheKey = `user:username:${username}`;
    const cachedData = await RedisUtil.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await User.findOne({
      where: { username, isDeleted: 1 },
    });
    if (data) {
      await RedisUtil.set(cacheKey, data, 3600);
    }
    return data;
  }

  // 创建用户
  static async create(user: any) {
    const result = await super.create(User, user);
    // 清除相关缓存
    await RedisUtil.delByPattern('users:all:*');
    return result;
  }

  // 根据 uuid 修改用户
  static async updateByUuid(uuid: string, data: any) {
    const result = await super.updateByUuid(User, uuid, data);
    // 清除相关缓存
    await RedisUtil.delByPattern('users:all:*');
    await RedisUtil.del(`user:uuid:${uuid}`);
    if (data.username) {
      await RedisUtil.del(`user:username:${data.username}`);
    }
    return result;
  }

  // 根据 uuid 软删除用户
  static async deleteByUuid(uuid: string) {
    const user = await this.findByUuid(uuid);
    const result = await super.deleteByUuid(User, uuid);
    // 清除相关缓存
    await RedisUtil.delByPattern('users:all:*');
    await RedisUtil.del(`user:uuid:${uuid}`);
    if (user) {
      await RedisUtil.del(`user:username:${user.username}`);
    }
    return result;
  }
}
