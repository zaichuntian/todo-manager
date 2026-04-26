// src/services/user.service.ts
import User from '../models/user.model';
import { BaseService } from './base.service';
import { RedisUtil } from '../utils/redis';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export class UserService extends BaseService<any> {
  // 查询用户列表（分页，支持搜索）
  static async findAll(pageNum: number, pageSize: number, searchParams?: any) {
    try {
      // 生成缓存键，包含搜索参数
      const searchKey = searchParams ? JSON.stringify(searchParams) : 'empty';
      const cacheKey = `users:all:${pageNum}:${pageSize}:${searchKey}`;
      // 尝试从缓存获取数据
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取用户列表');
        return cachedData;
      }

      // 只添加isDeleted=0的条件，不添加其他限制
      const where: any = { isDeleted: 0 };

      // 添加搜索条件
      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value && typeof value === 'string' && value.trim() !== '') {
            where[key] = {
              [Op.like]: `%${value}%`,
            };
          } else if (value !== undefined && value !== null && value !== '') {
            where[key] = value;
          }
        });
      }

      logger.info('查询用户列表条件:', where);

      // 查询用户列表
      const data = await User.findAndCountAll({
        where,
        offset: (pageNum - 1) * pageSize,
        limit: pageSize,
        order: [['id', 'DESC']],
      });

      logger.info('查询用户列表结果:', data.count);
      // 缓存数据，设置 5 分钟过期
      await RedisUtil.set(cacheKey, data, 300);
      logger.debug('从数据库获取用户列表并缓存');
      return data;
    } catch (error) {
      logger.error('查询用户列表失败:', error);
      throw error;
    }
  }

  // 根据 uuid 查询单个用户
  static async findByUuid(uuid: string) {
    try {
      const cacheKey = `user:uuid:${uuid}`;
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取用户信息');
        return cachedData;
      }

      // 构建查询条件，只添加isDeleted=0的条件，不过滤status
      const options = {
        where: {
          isDeleted: 0,
        },
      };

      const data = await super.findByUuid(User, uuid, options);
      if (data) {
        await RedisUtil.set(cacheKey, data, 3600);
      }
      logger.debug('从数据库获取用户信息并缓存');
      return data;
    } catch (error) {
      logger.error('查询用户信息失败:', error);
      throw error;
    }
  }

  // 根据用户名查询（登录/注册用）
  static async findByUsername(username: string) {
    try {
      const cacheKey = `user:username:${username}`;
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取用户信息');
        return cachedData;
      }

      const data = await super.findByCondition(User, { username });
      if (data) {
        await RedisUtil.set(cacheKey, data, 3600);
      }
      logger.debug('从数据库获取用户信息并缓存');
      return data;
    } catch (error) {
      logger.error('根据用户名查询用户失败:', error);
      throw error;
    }
  }

  // 创建用户
  static async create(user: any) {
    try {
      logger.info('开始创建用户:', user.username);
      const result = await super.create(User, user);
      logger.info('数据库创建用户成功:', result.username);
      // 清除相关缓存
      await RedisUtil.delByPattern('users:all:*');
      await RedisUtil.del(`user:username:${user.username}`);
      logger.info('清除用户列表缓存成功');
      logger.info('创建用户成功:', result.username);
      return result;
    } catch (error) {
      logger.error('创建用户失败:', error);
      throw error;
    }
  }

  // 根据 uuid 修改用户
  static async updateByUuid(uuid: string, data: any) {
    try {
      logger.info('开始更新用户:', uuid, data);
      // 构建查询条件，只添加isDeleted=0的条件，不过滤status
      const where = {
        uuid,
        isDeleted: 0,
      };

      // 移除可能的敏感字段
      delete data.uuid;
      delete data.createdAt;

      const result = await User.update(data, { where });
      logger.info('数据库更新用户成功:', uuid, result);
      // 清除相关缓存
      await RedisUtil.delByPattern('users:all:*');
      await RedisUtil.del(`user:uuid:${uuid}`);
      if (data.username) {
        await RedisUtil.del(`user:username:${data.username}`);
      }
      logger.info('清除用户缓存成功:', uuid);
      logger.info('更新用户成功:', uuid);
      return result || [0];
    } catch (error) {
      logger.error('更新用户失败:', error);
      throw error;
    }
  }

  // 根据 uuid 软删除用户
  static async deleteByUuid(uuid: string) {
    try {
      logger.info('开始删除用户:', uuid);
      const user = await this.findByUuid(uuid);
      // 构建查询条件，只添加isDeleted=0的条件，不过滤status
      const where = {
        uuid,
        isDeleted: 0,
      };

      const result = await User.update({ isDeleted: 1 }, { where });
      logger.info('数据库删除用户成功:', uuid, result);
      // 清除相关缓存
      await RedisUtil.delByPattern('users:all:*');
      await RedisUtil.del(`user:uuid:${uuid}`);
      if (user) {
        await RedisUtil.del(`user:username:${user.username}`);
      }
      logger.info('清除用户缓存成功:', uuid);
      logger.info('删除用户成功:', uuid);
      return result || [0];
    } catch (error) {
      logger.error('删除用户失败:', error);
      throw error;
    }
  }

  // 批量删除用户
  static async batchDeleteByUuids(uuids: string[]) {
    try {
      // 先查询这些UUID对应的用户是否存在，不考虑isDeleted和status
      const users = await User.findAll({
        where: {
          uuid: {
            [Op.in]: uuids,
          },
        },
        attributes: ['uuid', 'username', 'isDeleted', 'status'],
      });

      // 构建查询条件，只添加isDeleted=0的条件，不过滤status
      const where = {
        uuid: {
          [Op.in]: uuids,
        },
        isDeleted: 0,
      };

      const result = await User.update({ isDeleted: 1 }, { where });
      // 清除相关缓存
      await RedisUtil.delByPattern('users:all:*');
      for (const uuid of uuids) {
        await RedisUtil.del(`user:uuid:${uuid}`);
      }
      logger.info('批量删除用户成功:', uuids.length);
      return result;
    } catch (error) {
      logger.error('批量删除用户失败:', error);
      throw error;
    }
  }

  // 清除所有用户相关缓存（用于手动修改数据库后刷新缓存）
  static async clearAllCache() {
    try {
      // 清除用户列表缓存
      await RedisUtil.delByPattern('users:all:*');
      // 清除单个用户缓存
      await RedisUtil.delByPattern('user:uuid:*');
      // 清除用户名缓存
      await RedisUtil.delByPattern('user:username:*');
      logger.info('清除所有用户相关缓存成功');
      return true;
    } catch (error) {
      logger.error('清除用户缓存失败:', error);
      throw error;
    }
  }

  // 根据条件查询用户列表
  static async findByConditions(conditions: any, options?: any) {
    try {
      return await User.findAll({
        where: { ...conditions, isDeleted: 0 },
        ...options,
      });
    } catch (error) {
      logger.error('根据条件查询用户失败:', error);
      throw error;
    }
  }
}
