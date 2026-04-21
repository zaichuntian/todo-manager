import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { success, fail } from '../utils/response';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { decrypt } from '../utils/crypto'; // 加这行

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // 解密
      const realPassword = decrypt(password);

      if (!username || !realPassword) {
        return res.json(fail('参数错误'));
      }

      // 判断重复
      const exists = await UserService.findByUsername(username);
      if (exists) {
        return res.json(fail('用户名已存在'));
      }

      // bcrypt 加密存储
      const hashedPwd = await bcrypt.hash(realPassword, 10);
      await UserService.create({ username, password: hashedPwd });

      return res.json(success(null, '注册成功'));
    } catch (err) {
      return res.json(fail('注册失败'));
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const realPassword = decrypt(password);
      console.log('收到的加密密码：', req.body.password);

      // 关键判断：如果解密失败，直接返回参数错误
      if (!username || !realPassword) {
        return res.json({ code: 400, msg: '用户名或密码错误' });
      }

      const user = await UserService.findByUsername(username);
      if (!user) {
        return res.json({ code: 400, msg: '用户名或密码错误' });
      }

      const isMatch = await bcrypt.compare(realPassword, user.password);
      if (!isMatch) {
        return res.json({ code: 400, msg: '用户名或密码错误' });
      }

      const token = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET!, { expiresIn: '7d' });

      // 构建 userInfo 对象，包含所有需要的信息
      const userInfo = {
        userUuid: user.uuid,
        username: user.username,
        role: user.role || 0, // 确保 role 字段存在，默认为普通用户
        password: user.password, // 返回加密后的密码
        token, // 添加 token 到 userInfo 中
      };

      return res.json({
        code: 200,
        msg: '登录成功',
        data: userInfo,
      });
    } catch (error) {
      console.error('登录接口异常', error);
      return res.json({ code: 500, msg: '服务器错误' });
    }
  }

  // ======================
  // 下面是你要的新接口
  // ======================

  // 获取用户列表（分页）
  static async getList(req: Request, res: Response) {
    try {
      const pageNum = Number(req.query.pageNum) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const data = await UserService.findAll(pageNum, pageSize);

      res.json(
        success({
          list: data.rows,
          total: data.count,
          pageNum,
          pageSize,
        })
      );
    } catch (err) {
      res.json(fail('获取用户列表失败'));
    }
  }

  // 根据 uuid 获取单个用户
  static async getOne(req: Request, res: Response) {
    try {
      const user = await UserService.findByUuid(req.params.uuid as string);
      if (!user) return res.json(fail('用户不存在', 404));
      res.json(success(user));
    } catch (err) {
      res.json(fail('查询用户失败'));
    }
  }

  // 根据 uuid 修改用户（可改用户名）
  static async update(req: Request, res: Response) {
    try {
      const [rows] = await UserService.updateByUuid(req.params.uuid as string, req.body);
      if (rows === 0) return res.json(fail('用户不存在或未修改'));
      res.json(success(null, '修改成功'));
    } catch (err) {
      res.json(fail('修改失败'));
    }
  }

  // 根据 uuid 软删除用户
  static async delete(req: Request, res: Response) {
    try {
      const [rows] = await UserService.deleteByUuid(req.params.uuid as string);
      if (rows === 0) return res.json(fail('删除失败，用户不存在'));
      res.json(success(null, '删除成功'));
    } catch (err) {
      res.json(fail('删除失败'));
    }
  }

  // 启用 / 禁用用户（状态切换）
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
      return res.json(fail('状态更新失败'));
    }
  }
}
