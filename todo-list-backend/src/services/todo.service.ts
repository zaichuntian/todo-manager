import Todo from '../models/todo.model';
import User from '../models/user.model';

export class TodoService {
  // 查询所有任务（所有人可见）
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

  // 根据UUID查询单条（用于编辑/删除校验）
  static async findByUuid(uuid: string) {
    return await Todo.findOne({
      where: { uuid, isDeleted: 1 },
    });
  }

  // 创建
  static async create(todo: any) {
    return await Todo.create(todo);
  }

  // 更新
  static async updateByUuid(uuid: string, data: any) {
    return await Todo.update(data, {
      where: { uuid, isDeleted: 1 },
    });
  }

  // 删除
  static async deleteByUuid(uuid: string) {
    return await Todo.update({ isDeleted: 0 }, { where: { uuid, isDeleted: 1 } });
  }
}
