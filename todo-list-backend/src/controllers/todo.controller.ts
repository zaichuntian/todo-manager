// src/controllers/todo.controller.ts
import { Request, Response } from 'express';
import { TodoService } from '../services/todo.service';
import { success, fail } from '../utils/response';
import { BaseController } from './base.controller';
import { CONSTANTS } from '../config/constants';

export class TodoController extends BaseController {
  static async getMyList(req: Request, res: Response) {
    try {
      const pageNum = Number(req.query.pageNum) || CONSTANTS.DEFAULT_PAGE_NUM;
      const pageSize = Number(req.query.pageSize) || CONSTANTS.DEFAULT_PAGE_SIZE;

      const data = await TodoService.findAllTodos(pageNum, pageSize);

      // 修复：使用 BaseController.handlePaginationResponse
      BaseController.handlePaginationResponse(res, data, pageNum, pageSize);
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '获取列表失败');
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { title, content } = req.body;
      const userUuid = req.user!.uuid;

      if (!title || !content) {
        return res.json(fail('标题和内容不能为空'));
      }

      await TodoService.create({
        userUuid,
        title,
        content,
      });

      return res.json(success(null, '创建成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '创建失败');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const todoUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;

      const todo = await TodoService.findByUuid(todoUuid);
      if (!todo) return res.json(fail('任务不存在'));

      if (todo.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人任务'));
      }

      const [rows] = await TodoService.updateByUuid(todoUuid, req.body);
      if (rows === 0) return res.json(fail('修改失败'));

      res.json(success(null, '修改成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '修改失败');
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const todoUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;

      const todo = await TodoService.findByUuid(todoUuid);
      if (!todo) return res.json(fail('任务不存在'));

      if (todo.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人任务'));
      }

      const [rows] = await TodoService.deleteByUuid(todoUuid);
      if (rows === 0) return res.json(fail('删除失败'));

      res.json(success(null, '删除成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '删除失败');
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const todoUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;
      const { status } = req.body;

      // 1. 先查任务是否存在
      const todo = await TodoService.findByUuid(todoUuid);
      if (!todo) return res.json(fail('任务不存在'));

      // 2. 校验是否是自己的任务
      if (todo.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人任务'));
      }

      // 3. 校验状态值合法性（0/1）
      if (status !== 0 && status !== 1) {
        return res.json(fail('状态值不合法'));
      }

      // 4. 更新状态
      const [rows] = await TodoService.updateByUuid(todoUuid, { status });
      if (rows === 0) return res.json(fail('状态更新失败'));

      res.json(success(null, '状态更新成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '状态更新失败');
    }
  }
}
