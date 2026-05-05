import { Request, Response } from 'express';
import { TodoService } from '@services/todo.service';
import { success, fail } from '@utils/response';
import { BaseController } from './base.controller';
import { CONSTANTS } from '@/constants';
import { CategoryService } from '@services/category.service';
import { logger } from '@utils/logger';

export class TodoController extends BaseController {
  static async getMyList(req: Request, res: Response) {
    try {
      const pageNum = Number(req.query.pageNum) || CONSTANTS.DEFAULT_PAGE_NUM;
      const pageSize = Number(req.query.pageSize) || CONSTANTS.DEFAULT_PAGE_SIZE;

      // 验证分页参数
      if (pageNum < 1 || pageSize < 1 || pageSize > 100) {
        return res.json(fail('分页参数无效'));
      }

      // 提取搜索参数，只包含非空值
      const searchParams: any = {};
      if (req.query.title) {
        searchParams.title = req.query.title as string;
      }
      if (req.query.content) {
        searchParams.content = req.query.content as string;
      }
      if (req.query.status) {
        searchParams.status = Number(req.query.status);
      }
      if (req.query.categoryUuid) {
        searchParams.categoryUuid = req.query.categoryUuid as string;
      }

      logger.debug('获取任务列表，搜索参数:', searchParams);

      const data = await TodoService.findAllTodos(pageNum, pageSize, searchParams);

      // 处理分页响应
      BaseController.handlePaginationResponse(res, data, pageNum, pageSize);
    } catch (err) {
      logger.error('获取任务列表失败:', err);
      BaseController.handleError(res, err, '获取列表失败');
    }
  }

  static async getUserTodos(req: Request, res: Response) {
    try {
      const userUuid = req.user!.uuid;
      const pageNum = Number(req.query.pageNum) || CONSTANTS.DEFAULT_PAGE_NUM;
      const pageSize = Number(req.query.pageSize) || CONSTANTS.DEFAULT_PAGE_SIZE;

      // 验证分页参数
      if (pageNum < 1 || pageSize < 1 || pageSize > 100) {
        return res.json(fail('分页参数无效'));
      }

      // 提取搜索参数，只包含非空值
      const searchParams: any = {};
      if (req.query.title) {
        searchParams.title = req.query.title as string;
      }
      if (req.query.content) {
        searchParams.content = req.query.content as string;
      }
      if (req.query.status) {
        searchParams.status = Number(req.query.status);
      }
      if (req.query.categoryUuid) {
        searchParams.categoryUuid = req.query.categoryUuid as string;
      }

      logger.debug('获取用户任务列表，搜索参数:', searchParams);

      const data = await TodoService.findUserTodos(userUuid, pageNum, pageSize, searchParams);

      // 处理分页响应
      BaseController.handlePaginationResponse(res, data, pageNum, pageSize);
    } catch (err) {
      logger.error('获取用户任务列表失败:', err);
      BaseController.handleError(res, err, '获取列表失败');
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { title, content, categoryUuid, status } = req.body;
      const userUuid = req.user!.uuid;

      // 验证参数
      if (!title || !content || !categoryUuid) {
        return res.json(fail('标题、内容和分类不能为空'));
      }

      if (title.length < 1 || title.length > 100) {
        return res.json(fail('标题长度必须在1-100个字符之间'));
      }

      if (content.length < 1 || content.length > 1000) {
        return res.json(fail('内容长度必须在1-1000个字符之间'));
      }

      // 验证分类是否存在
      const category = await CategoryService.findByUuid(categoryUuid);
      if (!category) {
        return res.json(fail('分类不存在'));
      }

      // 验证分类是否属于当前用户
      if (category.userUuid !== userUuid) {
        return res.json(fail('无权限使用该分类'));
      }

      // 创建任务
      const todo = await TodoService.create({
        userUuid,
        title,
        content,
        categoryUuid,
        status: status || 0,
      });

      logger.info('创建任务成功:', title);
      return res.json(success(todo, '创建成功'));
    } catch (err) {
      logger.error('创建任务失败:', err);
      BaseController.handleError(res, err, '创建失败');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const todoUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;
      const updateData = req.body;

      // 验证参数
      if (!todoUuid) {
        return res.json(fail('任务ID不能为空'));
      }

      if (updateData.title && (updateData.title.length < 1 || updateData.title.length > 100)) {
        return res.json(fail('标题长度必须在1-100个字符之间'));
      }

      if (updateData.content && (updateData.content.length < 1 || updateData.content.length > 1000)) {
        return res.json(fail('内容长度必须在1-1000个字符之间'));
      }

      // 验证分类权限（如果更新分类）
      if (updateData.categoryUuid) {
        const category = await CategoryService.findByUuid(updateData.categoryUuid);
        if (!category) {
          return res.json(fail('分类不存在'));
        }
        if (category.userUuid !== userUuid) {
          return res.json(fail('无权限使用该分类'));
        }
      }

      // 查找任务
      const todo = await TodoService.findByUuid(todoUuid);
      if (!todo) return res.json(fail('任务不存在'));

      // 检查权限
      if (todo.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人任务'));
      }

      // 更新任务
      const [rows] = await TodoService.updateByUuid(todoUuid, updateData);
      if (rows === 0) return res.json(fail('修改失败'));

      logger.info('更新任务成功:', todoUuid);
      res.json(success(null, '修改成功'));
    } catch (err) {
      logger.error('更新任务失败:', err);
      BaseController.handleError(res, err, '修改失败');
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const todoUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;

      // 验证参数
      if (!todoUuid) {
        return res.json(fail('任务ID不能为空'));
      }

      // 查找任务
      const todo = await TodoService.findByUuid(todoUuid);
      if (!todo) return res.json(fail('任务不存在'));

      // 检查权限
      if (todo.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人任务'));
      }

      // 删除任务
      const rows = await TodoService.deleteByUuid(todoUuid);
      if (rows === 0) return res.json(fail('删除失败'));

      logger.info('删除任务成功:', todoUuid);
      res.json(success(null, '删除成功'));
    } catch (err) {
      logger.error('删除任务失败:', err);
      BaseController.handleError(res, err, '删除失败');
    }
  }

  static async batchDelete(req: Request, res: Response) {
    try {
      const { uuids } = req.body;
      const userUuid = req.user!.uuid;

      // 验证参数
      if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
        return res.json(fail('请选择要删除的任务'));
      }

      // 检查所有任务的权限
      for (const uuid of uuids) {
        const todo = await TodoService.findByUuid(uuid);
        if (!todo) {
          return res.json(fail(`任务 ${uuid} 不存在`));
        }
        if (todo.userUuid !== userUuid) {
          return res.json(fail('无权限操作他人任务'));
        }
      }

      // 批量删除任务
      const rows = await TodoService.batchDeleteByUuids(uuids);
      if (rows === 0) return res.json(fail('删除失败'));

      logger.info('批量删除任务成功:', uuids.length);
      res.json(success(null, `成功删除 ${rows} 个任务`));
    } catch (err) {
      logger.error('批量删除任务失败:', err);
      BaseController.handleError(res, err, '批量删除失败');
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const todoUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;
      const { status } = req.body;

      // 验证参数
      if (!todoUuid) {
        return res.json(fail('任务ID不能为空'));
      }

      if (status === undefined) {
        return res.json(fail('状态不能为空'));
      }

      // 校验状态值合法性（0/1）
      if (status !== 0 && status !== 1) {
        return res.json(fail('状态值不合法'));
      }

      // 1. 先查任务是否存在
      const todo = await TodoService.findByUuid(todoUuid);
      if (!todo) return res.json(fail('任务不存在'));

      // 2. 校验是否是自己的任务
      if (todo.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人任务'));
      }

      // 3. 更新状态
      const [rows] = await TodoService.updateStatus(todoUuid, status);
      if (rows === 0) return res.json(fail('状态更新失败'));

      logger.info('更新任务状态成功:', { todoUuid, status });
      res.json(success(null, '状态更新成功'));
    } catch (err) {
      logger.error('更新任务状态失败:', err);
      BaseController.handleError(res, err, '状态更新失败');
    }
  }
}
