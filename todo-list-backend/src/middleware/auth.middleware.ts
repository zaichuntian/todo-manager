import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { fail } from '../utils/response';
import { verifyToken } from '../auth/jwt';

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

    const decoded = verifyToken(token);
    const user = await User.findOne({
      where: { uuid: decoded.uuid },
    });

    if (!user) {
      return res.json(fail('用户不存在', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ JWT 验证失败', err);
    return res.json(fail('登录已过期或无效', 401));
  }
}
