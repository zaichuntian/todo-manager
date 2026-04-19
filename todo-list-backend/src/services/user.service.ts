import User from '../models/user.model';

export class UserService {
  // 查询用户列表（分页）
  static async findAll(pageNum: number, pageSize: number) {
    return await User.findAndCountAll({
      where: { isDeleted: 1 },
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      order: [['id', 'DESC']],
    });
  }

  // 根据 uuid 查询单个用户
  static async findByUuid(uuid: string) {
    return await User.findOne({
      where: { uuid, isDeleted: 1 },
    });
  }

  // 根据用户名查询（登录/注册用）
  static async findByUsername(username: string) {
    return await User.findOne({
      where: { username, isDeleted: 1 },
    });
  }

  // 创建用户
  static async create(user: any) {
    return await User.create(user);
  }

  // 根据 uuid 修改用户
  static async updateByUuid(uuid: string, data: any) {
    return await User.update(data, {
      where: { uuid, isDeleted: 1 },
    });
  }

  // 根据 uuid 软删除用户
  static async deleteByUuid(uuid: string) {
    return await User.update({ isDeleted: 0 }, { where: { uuid, isDeleted: 1 } });
  }
}
