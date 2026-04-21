import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ 服务器错误：', err);
  return res.json(fail('服务器错误', 500));
};
