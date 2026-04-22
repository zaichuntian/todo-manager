import Todo from '../models/todo.model';
import User from '../models/user.model';
import { Op } from 'sequelize';
import { BaseService } from './base.service';
import { RedisUtil } from '../utils/redis';

export class TodoService extends BaseService<any> {
  // 获取所有任务（带分页）
  static async findAllTodos(pageNum: number, pageSize: number, lastId: number = 0) {
    // 生成缓存键
    const cacheKey = `todos:all:${pageNum}:${pageSize}:${lastId}`;

    // 尝试从缓存获取
    const cachedData = await RedisUtil.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // 缓存未命中，从数据库查询
    const data = await Todo.findAndCountAll({
      where: {
        isDeleted: 1,
        id: { [Op.gt]: lastId }, // 使用ID作为游标
      },
      limit: pageSize,
      order: [['id', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
        },
      ],
    });

    // 将结果存入缓存（过期时间 5 分钟）
    await RedisUtil.set(cacheKey, data, 300);
    return data;
  }

  // 根据 uuid 查询单个任务
  static async findByUuid(uuid: string) {
    return await super.findByUuid(Todo, uuid);
  }

  // 创建任务
  static async create(todo: any) {
    const result = await super.create(Todo, todo);
    // 清除相关缓存
    await RedisUtil.delByPattern('todos:all:*');
    return result;
  }

  // 根据 uuid 修改任务
  static async updateByUuid(uuid: string, data: any) {
    const result = await super.updateByUuid(Todo, uuid, data);
    // 清除相关缓存
    await RedisUtil.delByPattern('todos:all:*');
    return result;
  }

  // 根据 uuid 软删除任务
  static async deleteByUuid(uuid: string) {
    const result = await super.deleteByUuid(Todo, uuid);
    // 清除相关缓存
    await RedisUtil.delByPattern('todos:all:*');
    return result;
  }
}
