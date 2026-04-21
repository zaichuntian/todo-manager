import Todo from '../models/todo.model';
import User from '../models/user.model';
import { BaseService } from './base.service';

export class TodoService extends BaseService<any> {
  // 获取所有任务（带分页）
  static async findAllTodos(pageNum: number, pageSize: number) {
    const offset = (pageNum - 1) * pageSize;
    const limit = pageSize;

    return await Todo.findAndCountAll({
      where: { isDeleted: 1 },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
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
