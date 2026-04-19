// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { fail } from '../utils/response';

// 关键：和 .env 里的 JWT_SECRET 保持一致
const SECRET = process.env.JWT_SECRET || 'my_super_secret_key_2026_abcdefg';
console.log('当前JWT_SECRET:', SECRET!);

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json(fail('请先登录', 401));
    }

    // 用同一个 SECRET 验证
    const decoded: any = jwt.verify(token, SECRET);
    const user = await User.findOne({
      where: { uuid: decoded.uuid, isDeleted: 1 },
    });

    if (!user) {
      return res.json(fail('用户不存在', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT 验证失败', err); // 加个日志，方便调试
    return res.json(fail('登录已过期或无效', 401));
  }
}