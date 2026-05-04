import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/response';

/**
 * 验证注册请求
 */
export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.json(fail('缺少必要参数', 400));
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json(fail('邮箱格式不正确', 400));
  }

  // 密码长度验证
  if (password.length < 6) {
    return res.json(fail('密码长度至少6位', 400));
  }

  next();
}

/**
 * 验证登录请求
 */
export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json(fail('缺少必要参数', 400));
  }

  next();
}
