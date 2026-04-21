import Category from '../models/category.model';
import { BaseService } from './base.service';

export class CategoryService extends BaseService<any> {
  // 根据用户uuid获取分类列表（带分页）
  static async findUserCategories(userUuid: string, pageNum: number, pageSize: number) {
    return await Category.findAndCountAll({
      where: { userUuid, isDeleted: 1 },
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });
  }

  // 根据 uuid 查询单个分类
  static async findByUuid(uuid: string) {
    return await super.findByUuid(Category, uuid);
  }

  // 创建分类
  static async create(category: any) {
    return await super.create(Category, category);
  }

  // 根据 uuid 修改分类
  static async updateByUuid(uuid: string, data: any) {
    return await super.updateByUuid(Category, uuid, data);
  }

  // 根据 uuid 软删除分类
  static async deleteByUuid(uuid: string) {
    return await super.deleteByUuid(Category, uuid);
  }

  // 获取分类及其任务
  static async findCategoryWithTodos(categoryUuid: string) {
    return await Category.findOne({
      where: { uuid: categoryUuid, isDeleted: 1 },
      include: [
        {
          association: 'todos',
          where: { isDeleted: 1 },
          required: false,
        },
      ],
    });
  }
}
