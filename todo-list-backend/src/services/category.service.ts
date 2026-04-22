import Category from '../models/category.model';
import { BaseService } from './base.service';
import { RedisUtil } from '../utils/redis';

export class CategoryService extends BaseService<any> {
  // 根据用户uuid获取分类列表（带分页）
  static async findUserCategories(userUuid: string, pageNum: number, pageSize: number) {
    const cacheKey = `categories:user:${userUuid}:${pageNum}:${pageSize}`;
    const cachedData = await RedisUtil.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await Category.findAndCountAll({
      where: { userUuid, isDeleted: 1 },
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });
    await RedisUtil.set(cacheKey, data, 300);
    return data;
  }

  // 根据 uuid 查询单个分类
  static async findByUuid(uuid: string) {
    const cacheKey = `category:uuid:${uuid}`;
    const cachedData = await RedisUtil.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await super.findByUuid(Category, uuid);
    if (data) {
      await RedisUtil.set(cacheKey, data, 3600);
    }
    return data;
  }

  // 创建分类
  static async create(category: any) {
    const result = await super.create(Category, category);
    // 清除相关缓存
    if (category.userUuid) {
      await RedisUtil.delByPattern(`categories:user:${category.userUuid}:*`);
    }
    return result;
  }

  // 根据 uuid 修改分类
  static async updateByUuid(uuid: string, data: any) {
    const category = await this.findByUuid(uuid);
    const result = await super.updateByUuid(Category, uuid, data);
    // 清除相关缓存
    await RedisUtil.del(`category:uuid:${uuid}`);
    await RedisUtil.del(`category:todos:${uuid}`);
    if (category && category.userUuid) {
      await RedisUtil.delByPattern(`categories:user:${category.userUuid}:*`);
    }
    return result;
  }

  // 根据 uuid 软删除分类
  static async deleteByUuid(uuid: string) {
    const category = await this.findByUuid(uuid);
    const result = await super.deleteByUuid(Category, uuid);
    // 清除相关缓存
    await RedisUtil.del(`category:uuid:${uuid}`);
    await RedisUtil.del(`category:todos:${uuid}`);
    if (category && category.userUuid) {
      await RedisUtil.delByPattern(`categories:user:${category.userUuid}:*`);
    }
    return result;
  }

  // 获取分类及其任务
  static async findCategoryWithTodos(categoryUuid: string) {
    const cacheKey = `category:todos:${categoryUuid}`;
    const cachedData = await RedisUtil.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await Category.findOne({
      where: { uuid: categoryUuid, isDeleted: 1 },
      include: [
        {
          association: 'todos',
          where: { isDeleted: 1 },
          required: false,
        },
      ],
    });
    if (data) {
      await RedisUtil.set(cacheKey, data, 300);
    }
    return data;
  }
}
