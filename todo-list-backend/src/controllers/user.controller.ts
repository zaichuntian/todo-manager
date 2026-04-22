import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { success, fail } from '../utils/response';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { decrypt } from '../utils/crypto';
import { BaseController } from './base.controller';
import { CONSTANTS } from '../config/constants';

export class UserController extends BaseController {
  static async register(req: Request, res: Response) {
    try {
      const { username, password, nickname, phone, email } = req.body;
      const realPassword = decrypt(password);

      if (!username || !realPassword) {
        return res.json(fail('参数错误'));
      }

      const exists = await UserService.findByUsername(username);
      if (exists) {
        return res.json(fail('用户名已存在'));
      }

      const hashedPwd = await bcrypt.hash(realPassword, 10);
      await UserService.create({
        username,
        password: hashedPwd,
        nickname,
        phone,
        email,
      });

      return res.json(success(null, '注册成功'));
    } catch (err) {
      BaseController.handleError(res, err, '注册失败');
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const realPassword = decrypt(password);
      console.log('收到的加密密码：', req.body.password);

      if (!username || !realPassword) {
        return res.json(fail('用户名或密码错误'));
      }

      const user = await UserService.findByUsername(username);
      if (!user) {
        return res.json(fail('用户名或密码错误'));
      }

      const isMatch = await bcrypt.compare(realPassword, user.password);
      if (!isMatch) {
        return res.json(fail('用户名或密码错误'));
      }

      // 修复 JWT 签名类型问题
      const token = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET as string, {
        expiresIn: '7d' as const,
      });

      const userInfo = {
        userUuid: user.uuid,
        username: user.username,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        role: user.role || 0,
        token,
      };

      return res.json(success(userInfo, '登录成功'));
    } catch (error) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, error, '服务器错误');
    }
  }

  static async getList(req: Request, res: Response) {
    try {
      const pageNum = Number(req.query.pageNum) || CONSTANTS.DEFAULT_PAGE_NUM;
      const pageSize = Number(req.query.pageSize) || CONSTANTS.DEFAULT_PAGE_SIZE;
      const data = await UserService.findAll(pageNum, pageSize);

      // 修复：使用 BaseController.handlePaginationResponse
      BaseController.handlePaginationResponse(res, data, pageNum, pageSize);
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '获取用户列表失败');
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const user = await UserService.findByUuid(req.params.uuid as string);
      if (!user) return res.json(fail('用户不存在', 404));
      res.json(success(user));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '查询用户失败');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const [rows] = await UserService.updateByUuid(req.params.uuid as string, req.body);
      if (rows === 0) return res.json(fail('用户不存在或未修改'));
      res.json(success(null, '修改成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '修改失败');
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const [rows] = await UserService.deleteByUuid(req.params.uuid as string);
      if (rows === 0) return res.json(fail('删除失败，用户不存在'));
      res.json(success(null, '删除成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '删除失败');
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      if (status === undefined) {
        return res.json(fail('状态不能为空'));
      }

      const [rows] = await UserService.updateByUuid(req.params.uuid as string, { status });
      if (rows === 0) {
        return res.json(fail('用户不存在或更新失败'));
      }

      return res.json(success(null, '状态更新成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '状态更新失败');
    }
  }
}
