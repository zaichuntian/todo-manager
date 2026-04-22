import Todo from '../models/todo.model';
import User from '../models/user.model';
import { BaseService } from './base.service';
import { Op } from 'sequelize';

export class TodoService extends BaseService<any> {
  // 获取所有任务（带分页）
  static async findAllTodos(pageSize: number, lastId: number = 0) {
    return await Todo.findAndCountAll({
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
  }

  // 根据 uuid 查询单个任务
  static async findByUuid(uuid: string) {
    return await super.findByUuid(Todo, uuid);
  }

  // 创建任务
  static async create(todo: any) {
    return await super.create(Todo, todo);
  }

  // 根据 uuid 修改任务
  static async updateByUuid(uuid: string, data: any) {
    return await super.updateByUuid(Todo, uuid, data);
  }

  // 根据 uuid 软删除任务
  static async deleteByUuid(uuid: string) {
    return await super.deleteByUuid(Todo, uuid);
  }
}
