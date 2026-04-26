import Todo from '../models/todo.model';
import User from '../models/user.model';
import Category from '../models/category.model';
import { Op } from 'sequelize';
import { BaseService } from './base.service';
import { RedisUtil } from '../utils/redis';
import { logger } from '../utils/logger';

export class TodoService extends BaseService<any> {
  // 获取所有任务（带分页，支持搜索）
  static async findAllTodos(pageNum: number, pageSize: number, searchParams?: any) {
    try {
      // 生成缓存键，包含搜索参数
      const searchKey = searchParams ? JSON.stringify(searchParams) : 'empty';
      const cacheKey = `todos:all:${pageNum}:${pageSize}:${searchKey}`;

      // 尝试从缓存获取
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取任务列表');
        return cachedData;
      }

      // 构建查询条件
      const where: any = { isDeleted: 0 };

      // 添加搜索条件
      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            where[key] = {
              [Op.like]: `%${value}%`,
            };
          } else if (value !== undefined && value !== null) {
            where[key] = value;
          }
        });
      }

      // 缓存未命中，从数据库查询
      const data = await Todo.findAndCountAll({
        where,
        offset: (pageNum - 1) * pageSize,
        limit: pageSize,
        order: [['id', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username'],
          },
          {
            model: Category,
            as: 'category',
            attributes: ['name', 'color'],
          },
        ],
      });

      // 将结果存入缓存（过期时间 5 分钟）
      await RedisUtil.set(cacheKey, data, 300);
      logger.debug('从数据库获取任务列表并缓存');
      return data;
    } catch (error) {
      logger.error('查询任务列表失败:', error);
      throw error;
    }
  }

  // 根据用户uuid获取任务列表
  static async findUserTodos(userUuid: string, pageNum: number, pageSize: number, searchParams?: any) {
    try {
      // 生成缓存键，包含搜索参数
      const searchKey = searchParams ? JSON.stringify(searchParams) : 'empty';
      const cacheKey = `todos:user:${userUuid}:${pageNum}:${pageSize}:${searchKey}`;

      // 尝试从缓存获取
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取用户任务列表');
        return cachedData;
      }

      // 构建查询条件
      const where: any = { userUuid, isDeleted: 0 };

      // 添加搜索条件
      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            where[key] = {
              [Op.like]: `%${value}%`,
            };
          } else if (value !== undefined && value !== null) {
            where[key] = value;
          }
        });
      }

      // 缓存未命中，从数据库查询
      const data = await Todo.findAndCountAll({
        where,
        offset: (pageNum - 1) * pageSize,
        limit: pageSize,
        order: [['id', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username'],
          },
          {
            model: Category,
            as: 'category',
            attributes: ['name', 'color'],
          },
        ],
      });

      // 将结果存入缓存（过期时间 5 分钟）
      await RedisUtil.set(cacheKey, data, 300);
      logger.debug('从数据库获取用户任务列表并缓存');
      return data;
    } catch (error) {
      logger.error('查询用户任务列表失败:', error);
      throw error;
    }
  }

  // 根据 uuid 查询单个任务
  static async findByUuid(uuid: string) {
    try {
      const cacheKey = `todo:uuid:${uuid}`;
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取任务信息');
        return cachedData;
      }

      const data = await super.findByUuid(Todo, uuid, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username'],
          },
          {
            model: Category,
            as: 'category',
            attributes: ['name', 'color'],
          },
        ],
      });
      if (data) {
        await RedisUtil.set(cacheKey, data, 3600);
      }
      logger.debug('从数据库获取任务信息并缓存');
      return data;
    } catch (error) {
      logger.error('查询任务信息失败:', error);
      throw error;
    }
  }

  // 创建任务
  static async create(todo: any) {
    try {
      const result = await super.create(Todo, todo);
      // 清除相关缓存
      await RedisUtil.delByPattern('todos:all:*');
      if (todo.userUuid) {
        await RedisUtil.delByPattern(`todos:user:${todo.userUuid}:*`);
      }
      logger.info('创建任务成功:', result.title);
      return result;
    } catch (error) {
      logger.error('创建任务失败:', error);
      throw error;
    }
  }

  // 根据 uuid 修改任务
  static async updateByUuid(uuid: string, data: any) {
    try {
      const todo = await this.findByUuid(uuid);
      const result = await super.updateByUuid(Todo, uuid, data);
      // 清除相关缓存
      await RedisUtil.delByPattern('todos:all:*');
      await RedisUtil.del(`todo:uuid:${uuid}`);
      if (todo && todo.userUuid) {
        await RedisUtil.delByPattern(`todos:user:${todo.userUuid}:*`);
      }
      logger.info('更新任务成功:', uuid);
      return result;
    } catch (error) {
      logger.error('更新任务失败:', error);
      throw error;
    }
  }

  // 根据 uuid 软删除任务
  static async deleteByUuid(uuid: string) {
    try {
      const todo = await this.findByUuid(uuid);
      const result = await super.deleteByUuid(Todo, uuid);
      // 清除相关缓存
      await RedisUtil.delByPattern('todos:all:*');
      await RedisUtil.del(`todo:uuid:${uuid}`);
      if (todo && todo.userUuid) {
        await RedisUtil.delByPattern(`todos:user:${todo.userUuid}:*`);
      }
      logger.info('删除任务成功:', uuid);
      return result;
    } catch (error) {
      logger.error('删除任务失败:', error);
      throw error;
    }
  }

  // 批量删除任务
  static async batchDeleteByUuids(uuids: string[]) {
    try {
      // 获取所有任务信息，用于清除缓存
      const todos = await Promise.all(uuids.map(uuid => this.findByUuid(uuid)));
      const result = await super.batchDeleteByUuids(Todo, uuids);

      // 清除相关缓存
      await RedisUtil.delByPattern('todos:all:*');
      for (const uuid of uuids) {
        await RedisUtil.del(`todo:uuid:${uuid}`);
      }

      // 清除用户相关的任务缓存
      const userUuids = new Set(todos.filter(t => t).map(t => t.userUuid));
      for (const userUuid of userUuids) {
        await RedisUtil.delByPattern(`todos:user:${userUuid}:*`);
      }

      logger.info('批量删除任务成功:', uuids.length);
      return result;
    } catch (error) {
      logger.error('批量删除任务失败:', error);
      throw error;
    }
  }

  // 更新任务状态
  static async updateStatus(uuid: string, status: number) {
    try {
      const result = await super.updateByUuid(Todo, uuid, { status });
      // 清除相关缓存
      await RedisUtil.delByPattern('todos:all:*');
      await RedisUtil.del(`todo:uuid:${uuid}`);
      const todo = await this.findByUuid(uuid);
      if (todo && todo.userUuid) {
        await RedisUtil.delByPattern(`todos:user:${todo.userUuid}:*`);
      }
      logger.info('更新任务状态成功:', uuid);
      return result;
    } catch (error) {
      logger.error('更新任务状态失败:', error);
      throw error;
    }
  }
}
