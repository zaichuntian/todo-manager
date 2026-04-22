import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { fail } from '../utils/response';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';

    // 捕获堆栈信息
    Error.captureStackTrace(this, this.constructor);
  }
}

// 统一错误处理中间件
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ 服务器错误：', err);

  // 处理验证错误
  if (err.array && typeof err.array === 'function') {
    const errors = err.array();
    const errorMessages = errors.map((error: ValidationError) => error.msg).join(', ');
    return res.json(fail(errorMessages, 400));
  }

  // 处理自定义应用错误
  if (err instanceof AppError) {
    return res.json(fail(err.message, err.statusCode));
  }

  // 处理数据库错误
  if (err.name === 'SequelizeValidationError') {
    const errorMessages = err.errors.map((error: any) => error.message).join(', ');
    return res.json(fail(errorMessages, 400));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.json(fail('数据已存在', 400));
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.json(fail('无效的令牌', 401));
  }

  if (err.name === 'TokenExpiredError') {
    return res.json(fail('令牌已过期', 401));
  }

  // 处理其他错误
  return res.json(fail('服务器内部错误', 500));
};

// 404错误处理中间件
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError('请求的资源不存在', 404);
  next(error);
};
