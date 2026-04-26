import { Model, Op, FindOptions } from 'sequelize';
import { logger } from '../utils/logger';

export class BaseService<T extends Model> {
  // 静态方法，查询列表（分页）
  protected static async findAll<T extends Model>(
    model: any,
    pageNum: number,
    pageSize: number,
    searchParams?: any,
    options?: FindOptions
  ) {
    // 基础查询条件
    const baseWhere: any = { isDeleted: 0 };

    // 添加搜索条件
    if (searchParams) {
      logger.debug('搜索参数:', searchParams);
      Object.entries(searchParams).forEach(([key, value]) => {
        // 只处理非空的搜索参数
        if (value && typeof value === 'string' && value.trim() !== '') {
          baseWhere[key] = {
            [Op.like]: `%${value}%`,
          };
        } else if (value !== undefined && value !== null && value !== '') {
          baseWhere[key] = value;
        }
      });
      logger.debug('搜索条件:', baseWhere);
    }

    // 合并options中的where条件
    const where = {
      ...baseWhere,
      ...(options?.where || {}),
    };
    logger.debug('最终查询条件:', where);

    // 构建查询选项
    const queryOptions: FindOptions = {
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      order: [['id', 'DESC']],
      ...options,
      // 确保 where 条件不会被 options 覆盖
      where: {
        ...where,
        ...(options?.where || {}),
      },
    };

    // 直接使用模型进行查询
    const result = await model.findAndCountAll(queryOptions);

    logger.debug('查询结果:', { count: result.count, rows: result.rows.length });
    console.log('查询结果:', result);
    return result;
  }

  // 静态方法，根据 uuid 查询单个
  protected static async findByUuid<T extends Model>(model: any, uuid: string, options?: FindOptions) {
    return await model.findOne({
      where: { uuid, isDeleted: 0 },
      ...options,
    });
  }

  // 静态方法，创建
  protected static async create<T extends Model>(model: any, data: any) {
    return await model.create(data);
  }

  // 静态方法，根据 uuid 修改
  protected static async updateByUuid<T extends Model>(model: any, uuid: string, data: any) {
    // 移除可能的敏感字段
    delete data.uuid;
    delete data.createdAt;

    return await model.update(data, {
      where: { uuid, isDeleted: 0 },
    });
  }

  // 静态方法，根据 uuid 软删除
  protected static async deleteByUuid<T extends Model>(model: any, uuid: string) {
    return await model.update({ isDeleted: 1 }, { where: { uuid, isDeleted: 0 } });
  }

  // 静态方法，批量软删除
  protected static async batchDeleteByUuids<T extends Model>(model: any, uuids: string[]) {
    return await model.update({ isDeleted: 1 }, { where: { uuid: { [Op.in]: uuids }, isDeleted: 0 } });
  }

  // 静态方法，根据条件查询
  protected static async findByCondition<T extends Model>(model: any, condition: any, options?: FindOptions) {
    return await model.findOne({
      where: { ...condition },
      ...options,
    });
  }
}
