import { Model } from 'sequelize';

export class BaseService<T extends Model> {
  // 静态方法，查询列表（分页）
  protected static async findAll<T extends Model>(model: any, pageNum: number, pageSize: number) {
    return await model.findAndCountAll({
      where: { isDeleted: 1 },
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      order: [['id', 'DESC']],
    });
  }

  // 静态方法，根据 uuid 查询单个
  protected static async findByUuid<T extends Model>(model: any, uuid: string) {
    return await model.findOne({
      where: { uuid, isDeleted: 1 },
    });
  }

  // 静态方法，创建
  protected static async create<T extends Model>(model: any, data: any) {
    return await model.create(data);
  }

  // 静态方法，根据 uuid 修改
  protected static async updateByUuid<T extends Model>(model: any, uuid: string, data: any) {
    return await model.update(data, {
      where: { uuid, isDeleted: 1 },
    });
  }

  // 静态方法，根据 uuid 软删除
  protected static async deleteByUuid<T extends Model>(model: any, uuid: string) {
    return await model.update({ isDeleted: 0 }, { where: { uuid, isDeleted: 1 } });
  }
}
