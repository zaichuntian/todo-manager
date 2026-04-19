import { Request, Response } from 'express';
import { TodoService } from '../services/todo.service';
import { success, fail } from '../utils/response';

export class TodoController {
  // 获取所有任务（所有人可见）
  static async getMyList(req: Request, res: Response) {
    try {
      const pageNum = Number(req.query.pageNum) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const data = await TodoService.findAllTodos(pageNum, pageSize);

      res.json(
        success({
          list: data.rows,
          total: data.count,
          pageNum,
          pageSize,
        })
      );
    } catch (err) {
      console.error('❌ 获取列表失败：', err);
      res.json(fail('获取列表失败'));
    }
  }

  // 创建任务
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
      console.error('❌ 创建失败：', err);
      return res.json(fail('创建失败'));
    }
  }

  // 编辑任务（仅自己可编辑）
  static async update(req: Request, res: Response) {
    try {
      const todoUuid = req.params.uuid as string; // 👈 修复
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
      res.json(fail('修改失败'));
    }
  }

  // 删除任务（仅自己可删除）
  static async delete(req: Request, res: Response) {
    try {
      const todoUuid = req.params.uuid as string; // 👈 修复
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
      res.json(fail('删除失败'));
    }
  }

  // 切换完成状态
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
      console.error('❌ 更新状态失败：', err);
      res.json(fail('状态更新失败'));
    }
  }
}
