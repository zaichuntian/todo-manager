import Category from '../models/category.model';
import Todo from '../models/todo.model';

export class CategoryService {
  // 查询用户的所有分类（带分页）
  static async findUserCategories(userUuid: string, pageNum: number, pageSize: number) {
    const offset = (pageNum - 1) * pageSize;
    const limit = pageSize;

    return await Category.findAndCountAll({
      where: { userUuid, isDeleted: 1 },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  // 根据UUID查询单个分类
  static async findByUuid(uuid: string) {
    return await Category.findOne({
      where: { uuid, isDeleted: 1 },
    });
  }

  // 创建分类
  static async create(category: any) {
    return await Category.create(category);
  }

  // 更新分类
  static async updateByUuid(uuid: string, data: any) {
    return await Category.update(data, {
      where: { uuid, isDeleted: 1 },
    });
  }

  // 删除分类
  static async deleteByUuid(uuid: string) {
    return await Category.update({ isDeleted: 0 }, { where: { uuid, isDeleted: 1 } });
  }

  // 查询分类及其任务
  static async findCategoryWithTodos(categoryUuid: string) {
    return await Category.findOne({
      where: { uuid: categoryUuid, isDeleted: 1 },
      include: [
        {
          model: Todo,
          as: 'todos',
          where: { isDeleted: 1 },
          order: [['createdAt', 'DESC']],
        },
      ],
    });
  }
}
