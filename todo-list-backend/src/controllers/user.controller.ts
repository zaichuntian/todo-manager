import { Request, Response } from 'express';
import { UserService } from '@services/user.service';
import { success, fail } from '@utils/response';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { decrypt } from '@utils/crypto';
import { BaseController } from './base.controller';
import { CONSTANTS } from '@/constants';
import { logger } from '@utils/logger';
import User from '@models/user.model';
import { Op } from 'sequelize';

export class UserController extends BaseController {
  static async register(req: Request, res: Response) {
    try {
      const { username, password, nickname, phone, email, role, status } = req.body;
      const realPassword = decrypt(password);

      // 验证参数
      if (!username || !realPassword) {
        return res.json(fail('用户名和密码不能为空'));
      }

      if (username.length < 3 || username.length > 20) {
        return res.json(fail('用户名长度必须在3-20个字符之间'));
      }

      if (!realPassword || realPassword.length < 6) {
        return res.json(fail('密码长度必须至少6个字符'));
      }

      // 检查用户名是否已存在
      const exists = await UserService.findByUsername(username);
      if (exists) {
        return res.json(fail('用户名已存在'));
      }

      // 加密密码
      const hashedPwd = await bcrypt.hash(realPassword, 10);

      // 创建用户
      const user = await UserService.create({
        username,
        password: hashedPwd,
        status: status || 1, // 确保status参数被正确传递
        role: role || 0, // 确保role参数被正确传递
        nickname, // 传递nickname字段
        phone, // 传递phone字段
        email, // 传递email字段
      });

      // 移除敏感信息
      const userData = user.dataValues || user;
      const { password: _, ...userInfo } = userData;

      logger.info('用户注册成功:', username);
      return res.json(success(userInfo, '注册成功'));
    } catch (err) {
      logger.error('注册失败:', err);
      BaseController.handleError(res, err, '注册失败');
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const realPassword = decrypt(password);

      // 验证参数
      if (!username || !realPassword) {
        return res.json(fail('用户名或密码错误'));
      }

      // 查找用户
      const user = await UserService.findByUsername(username);
      if (!user) {
        return res.json(fail('用户名或密码错误'));
      }

      // 检查用户状态
      if (user.status === 0) {
        return res.json(fail('用户已禁用'));
      }

      // 验证密码
      const isMatch = await bcrypt.compare(realPassword, user.password);
      if (!isMatch) {
        return res.json(fail('用户名或密码错误'));
      }

      // 检查JWT_SECRET是否存在
      if (!process.env.JWT_SECRET) {
        return res.json(fail('服务器配置错误', 500));
      }

      // 生成JWT token
      const token = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      // 构建用户信息
      const userInfo = {
        userUuid: user.uuid,
        username: user.username,
        status: user.status,
        role: user.role,
        token,
      };

      logger.info('用户登录成功:', username);
      return res.json(success(userInfo, '登录成功'));
    } catch (error) {
      logger.error('登录失败:', error);
      BaseController.handleError(res, error, '服务器错误');
    }
  }

  static async getList(req: Request, res: Response) {
    try {
      const pageNum = Number(req.query.pageNum) || CONSTANTS.DEFAULT_PAGE_NUM;
      const pageSize = Number(req.query.pageSize) || CONSTANTS.DEFAULT_PAGE_SIZE;

      // 验证分页参数
      if (pageNum < 1 || pageSize < 1 || pageSize > 100) {
        return res.json(fail('分页参数无效'));
      }

      // 提取搜索参数，只包含非空值
      const searchParams: any = {};
      if (req.query.username) {
        searchParams.username = req.query.username as string;
      }
      if (req.query.phone) {
        searchParams.phone = req.query.phone as string;
      }
      if (req.query.email) {
        searchParams.email = req.query.email as string;
      }
      if (req.query.role) {
        searchParams.role = Number(req.query.role);
      }
      if (req.query.status) {
        searchParams.status = Number(req.query.status);
      }

      logger.debug('获取用户列表，搜索参数:', searchParams);

      // 查询用户列表
      try {
        const data = await UserService.findAll(pageNum, pageSize, searchParams);
        logger.debug('获取用户列表成功，数据:', data);
        // 处理分页响应
        BaseController.handlePaginationResponse(res, data, pageNum, pageSize);
      } catch (error) {
        console.error('获取用户列表失败:', error);
        res.json(fail('获取用户列表失败'));
      }
    } catch (err) {
      logger.error('获取用户列表失败:', err);
      BaseController.handleError(res, err, '获取用户列表失败');
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const { uuid } = req.params;

      // 验证参数
      if (!uuid || Array.isArray(uuid)) {
        return res.json(fail('用户ID不能为空'));
      }

      // 查询用户
      const user = await UserService.findByUuid(uuid);
      if (!user) return res.json(fail('用户不存在', 404));

      // 移除敏感信息
      const userData = user.dataValues || user;
      const { password: _, ...userInfo } = userData;

      logger.debug('查询用户成功:', uuid);
      res.json(success(userInfo));
    } catch (err) {
      logger.error('查询用户失败:', err);
      BaseController.handleError(res, err, '查询用户失败');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const updateData = req.body;

      // 验证参数
      if (!uuid || Array.isArray(uuid)) {
        return res.json(fail('用户ID不能为空'));
      }

      // 如果更新密码，需要重新加密
      if (updateData.password) {
        const realPassword = decrypt(updateData.password);
        if (!realPassword || realPassword.length < 6) {
          return res.json(fail('密码长度必须至少6个字符'));
        }
        updateData.password = await bcrypt.hash(realPassword, 10);
      }

      // 更新用户
      const [rows] = await UserService.updateByUuid(uuid, updateData);
      if (rows === 0) return res.json(fail('用户不存在或未修改'));

      logger.info('更新用户成功:', uuid);
      res.json(success(null, '修改成功'));
    } catch (err) {
      logger.error('更新用户失败:', err);
      BaseController.handleError(res, err, '修改失败');
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { uuid } = req.params;

      // 验证参数
      if (!uuid || Array.isArray(uuid)) {
        return res.json(fail('用户ID不能为空'));
      }

      // 删除用户
      const rows = await UserService.deleteByUuid(uuid);
      if (rows[0] === 0) return res.json(fail('删除失败，用户不存在'));

      logger.info('删除用户成功:', uuid);
      res.json(success(null, '删除成功'));
    } catch (err) {
      logger.error('删除用户失败:', err);
      BaseController.handleError(res, err, '删除失败');
    }
  }

  static async batchDelete(req: Request, res: Response) {
    try {
      console.log('=== 批量删除接口被调用 ===');
      console.log('请求方法:', req.method);
      console.log('请求路径:', req.path);
      console.log('请求体:', JSON.stringify(req.body));

      const { uuids } = req.body;

      // 验证参数
      if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
        return res.json(fail('请选择要删除的用户', 400));
      }

      // 查询数据库中所有匹配的用户（包括已删除的）
      const users: User[] = await User.findAll({
        where: {
          uuid: {
            [Op.in]: uuids,
          },
        },
        attributes: ['uuid', 'username', 'isDeleted', 'status'],
      });

      // 检查哪些UUID在数据库中不存在
      const existingUuids = new Set(users.map(u => u.uuid));
      const notFoundUuids: string[] = uuids.filter(uuid => !existingUuids.has(uuid));

      // 如果有UUID不存在
      if (notFoundUuids.length > 0) {
        return res.json(fail(`以下用户不存在: ${notFoundUuids.join(', ')}`, 404));
      }

      // 检查是否有用户已被软删除
      const alreadyDeleted: User[] = users.filter(u => u.isDeleted === 1);

      // 执行批量删除
      const [rows] = await UserService.batchDeleteByUuids(uuids);

      if (rows === 0) {
        // 所有用户都已被删除
        if (alreadyDeleted.length === users.length) {
          return res.json(fail('所选用户均已被删除', 400));
        }
        return res.json(fail('删除失败', 400));
      }

      logger.info('批量删除用户成功:', uuids.length);

      // 返回详细结果
      const message: string =
        alreadyDeleted.length > 0
          ? `成功删除 ${rows} 个用户，${alreadyDeleted.length} 个用户已被删除`
          : `成功删除 ${rows} 个用户`;

      res.json(success(null, message));
    } catch (err) {
      logger.error('批量删除用户失败:', err);
      res.json(fail('删除失败，稍后重试', 500));
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const { status } = req.body;

      // 验证参数
      if (!uuid || Array.isArray(uuid)) {
        return res.json(fail('用户ID不能为空'));
      }
      if (status === undefined) {
        return res.json(fail('状态不能为空'));
      }
      if (![0, 1].includes(status)) {
        return res.json(fail('状态值无效'));
      }

      // 更新状态
      const [rows] = await UserService.updateByUuid(uuid, { status });
      if (rows === 0) {
        return res.json(fail('用户不存在或更新失败'));
      }

      logger.info('更新用户状态成功:', { uuid, status });
      return res.json(success(null, '状态更新成功'));
    } catch (err) {
      logger.error('更新用户状态失败:', err);
      BaseController.handleError(res, err, '状态更新失败');
    }
  }
}
