import Category from '@models/category.model';
import { BaseService } from './base.service';
import { RedisUtil } from '@utils/redis';
import { logger } from '@utils/logger';
import { Op } from 'sequelize';

export class CategoryService extends BaseService<any> {
  // 根据用户uuid获取分类列表（带分页，支持搜索）
  static async findUserCategories(userUuid: string, pageNum: number, pageSize: number, searchParams?: any) {
    try {
      // 生成缓存键，包含搜索参数
      const searchKey = searchParams ? JSON.stringify(searchParams) : 'empty';
      const cacheKey = `categories:user:${userUuid}:${pageNum}:${pageSize}:${searchKey}`;
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取分类列表');
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

      const data = await Category.findAndCountAll({
        where,
        offset: (pageNum - 1) * pageSize,
        limit: pageSize,
        order: [['createdAt', 'DESC']],
      });
      await RedisUtil.set(cacheKey, data, 300);
      logger.debug('从数据库获取分类列表并缓存');
      return data;
    } catch (error) {
      logger.error('查询分类列表失败:', error);
      throw error;
    }
  }

  // 根据 uuid 查询单个分类
  static async findByUuid(uuid: string) {
    try {
      const cacheKey = `category:uuid:${uuid}`;
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取分类信息');
        return cachedData;
      }

      const data = await super.findByUuid(Category, uuid);
      if (data) {
        await RedisUtil.set(cacheKey, data, 3600);
      }
      logger.debug('从数据库获取分类信息并缓存');
      return data;
    } catch (error) {
      logger.error('查询分类信息失败:', error);
      throw error;
    }
  }

  // 创建分类
  static async create(category: any) {
    try {
      const result = await super.create(Category, category);
      // 清除相关缓存
      if (category.userUuid) {
        await RedisUtil.delByPattern(`categories:user:${category.userUuid}:*`);
      }
      logger.info('创建分类成功:', result.name);
      return result;
    } catch (error) {
      logger.error('创建分类失败:', error);
      throw error;
    }
  }

  // 根据 uuid 修改分类
  static async updateByUuid(uuid: string, data: any) {
    try {
      const category = await this.findByUuid(uuid);
      const result = await super.updateByUuid(Category, uuid, data);
      // 清除相关缓存
      await RedisUtil.del(`category:uuid:${uuid}`);
      await RedisUtil.del(`category:todos:${uuid}`);
      if (category && category.userUuid) {
        await RedisUtil.delByPattern(`categories:user:${category.userUuid}:*`);
      }
      logger.info('更新分类成功:', uuid);
      return result;
    } catch (error) {
      logger.error('更新分类失败:', error);
      throw error;
    }
  }

  // 根据 uuid 软删除分类
  static async deleteByUuid(uuid: string) {
    try {
      const category = await this.findByUuid(uuid);
      const result = await super.deleteByUuid(Category, uuid);
      // 清除相关缓存
      await RedisUtil.del(`category:uuid:${uuid}`);
      await RedisUtil.del(`category:todos:${uuid}`);
      if (category && category.userUuid) {
        await RedisUtil.delByPattern(`categories:user:${category.userUuid}:*`);
      }
      logger.info('删除分类成功:', uuid);
      return result;
    } catch (error) {
      logger.error('删除分类失败:', error);
      throw error;
    }
  }

  // 批量删除分类
  static async batchDeleteByUuids(uuids: string[]) {
    try {
      // 获取所有分类信息，用于清除缓存
      const categories = await Promise.all(uuids.map(uuid => this.findByUuid(uuid)));
      const result = await super.batchDeleteByUuids(Category, uuids);

      // 清除相关缓存
      for (const uuid of uuids) {
        await RedisUtil.del(`category:uuid:${uuid}`);
        await RedisUtil.del(`category:todos:${uuid}`);
      }

      // 清除用户相关的分类缓存
      const userUuids = new Set(categories.filter(c => c).map(c => c.userUuid));
      for (const userUuid of userUuids) {
        await RedisUtil.delByPattern(`categories:user:${userUuid}:*`);
      }

      logger.info('批量删除分类成功:', uuids.length);
      return result;
    } catch (error) {
      logger.error('批量删除分类失败:', error);
      throw error;
    }
  }

  // 获取分类及其任务
  static async findCategoryWithTodos(categoryUuid: string) {
    try {
      const cacheKey = `category:todos:${categoryUuid}`;
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取分类及其任务');
        return cachedData;
      }

      const data = await Category.findOne({
        where: { uuid: categoryUuid, isDeleted: 0 },
        include: [
          {
            association: 'todos',
            where: { isDeleted: 0 },
            required: false,
          },
        ],
      });
      if (data) {
        await RedisUtil.set(cacheKey, data, 300);
      }
      logger.debug('从数据库获取分类及其任务并缓存');
      return data;
    } catch (error) {
      logger.error('获取分类及其任务失败:', error);
      throw error;
    }
  }

  // 获取用户的所有分类（不分页）
  static async findAllUserCategories(userUuid: string) {
    try {
      const cacheKey = `categories:user:${userUuid}:all`;
      const cachedData = await RedisUtil.get(cacheKey);
      if (cachedData) {
        logger.debug('从缓存获取用户所有分类');
        return cachedData;
      }

      const data = await Category.findAll({
        where: { userUuid, isDeleted: 0 },
        order: [['createdAt', 'DESC']],
      });
      await RedisUtil.set(cacheKey, data, 300);
      logger.debug('从数据库获取用户所有分类并缓存');
      return data;
    } catch (error) {
      logger.error('获取用户所有分类失败:', error);
      throw error;
    }
  }
}
