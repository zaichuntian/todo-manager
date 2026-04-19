import { Request, Response } from 'express';
import { TodoService } from '../services/todo.service';
import { success, fail } from '../utils/response';

export class TodoController {
  // 列表
  static async getList(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const pageNum = Number(req.query.pageNum) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const completed = req.query.completed as string | undefined;
      const boolCompleted = completed === 'true' || completed === '1';

      const data = await TodoService.findAll(userId, pageNum, pageSize, boolCompleted);

      res.json(success({
        list: data.rows,
        total: data.count,
        pageNum,
        pageSize,
      }));
    } catch (err) {
      res.json(fail('获取列表失败'));
    }
  }

  // 单个详情
  static async getOne(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const todo = await TodoService.findByUuid(userId, req.params.uuid as string);
      if (!todo) return res.json(fail('任务不存在', 404));
      res.json(success(todo));
    } catch (err) {
      res.json(fail('查询失败'));
    }
  }

  // 创建
  static async create(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      if (!req.body.title) return res.json(fail('标题不能为空'));

      const todo = await TodoService.create({
        ...req.body,
        userId, // 自动绑定当前用户
      });
      res.json(success(todo, '创建成功'));
    } catch (err) {
      res.json(fail('创建失败'));
    }
  }

  // 更新
  static async update(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const [rows] = await TodoService.updateByUuid(userId, req.params.uuid as string, req.body);
      if (rows === 0) return res.json(fail('未找到数据或无修改'));
      res.json(success(null, '更新成功'));
    } catch (err) {
      res.json(fail('更新失败'));
    }
  }

  // 删除（软删除）
  static async delete(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const [rows] = await TodoService.deleteByUuid(userId, req.params.uuid as string);
      if (rows === 0) return res.json(fail('删除失败，数据不存在'));
      res.json(success(null, '删除成功'));
    } catch (err) {
      res.json(fail('删除失败'));
    }
  }
}