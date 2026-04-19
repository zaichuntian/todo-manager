import Todo from '../models/todo.model';

export class TodoService {
  // 只查当前用户 + 未删除
  static async findAll(userId: number, pageNum: number, pageSize: number, completed?: boolean) {
    const where: any = { isDeleted: 1, userId };

    if (completed !== undefined) {
      where.completed = completed;
    }

    return await Todo.findAndCountAll({
      where,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      order: [['id', 'DESC']],
    });
  }

  // 只查自己的
  static async findByUuid(userId: number, uuid: string) {
    return await Todo.findOne({
      where: { uuid, isDeleted: 1, userId },
    });
  }

  // 创建时自动带上 userId
  static async create(data: any) {
    return await Todo.create(data);
  }

  // 只能更新自己的
  static async updateByUuid(userId: number, uuid: string, data: any) {
    return await Todo.update(data, {
      where: { uuid, isDeleted: 1, userId },
    });
  }

  // 只能删除自己的
  static async deleteByUuid(userId: number, uuid: string) {
    return await Todo.update({ isDeleted: 0 }, { where: { uuid, userId, isDeleted: 1 } });
  }
}
