import { Response } from 'express';
import { success, fail } from '../utils/response';

export class BaseController {
  // 静态方法，处理分页响应
  protected static handlePaginationResponse(res: Response, data: any, pageNum: number, pageSize: number) {
    res.json(
      success({
        list: data.rows,
        total: data.count,
        pageNum,
        pageSize,
      })
    );
  }

  // 静态方法，处理错误
  protected static handleError(res: Response, err: any, message: string) {
    console.error(`❌ ${message}：`, err);
    res.json(fail(message));
  }
}
