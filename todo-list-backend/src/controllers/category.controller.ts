import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { success, fail } from '../utils/response';
import { BaseController } from './base.controller';
import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';

export class CategoryController extends BaseController {
  static async getUserCategories(req: Request, res: Response) {
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
      if (req.query.name) {
        searchParams.name = req.query.name as string;
      }

      logger.debug('获取用户分类列表，搜索参数:', searchParams);

      const data = await CategoryService.findUserCategories(userUuid, pageNum, pageSize, searchParams);

      // 处理分页响应
      BaseController.handlePaginationResponse(res, data, pageNum, pageSize);
    } catch (err) {
      logger.error('获取分类列表失败:', err);
      BaseController.handleError(res, err, '获取分类列表失败');
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, description, color, icon, parentUuid } = req.body;
      const userUuid = req.user!.uuid;

      // 验证参数
      if (!name) {
        return res.json(fail('分类名称不能为空'));
      }

      if (name.length < 1 || name.length > 50) {
        return res.json(fail('分类名称长度必须在1-50个字符之间'));
      }

      // 创建分类
      const category = await CategoryService.create({
        userUuid,
        name,
        description,
        color,
        icon,
        parentUuid,
      });

      logger.info('创建分类成功:', name);
      return res.json(success(category, '创建成功'));
    } catch (err) {
      logger.error('创建分类失败:', err);
      BaseController.handleError(res, err, '创建失败');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const categoryUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;
      const updateData = req.body;

      // 验证参数
      if (!categoryUuid) {
        return res.json(fail('分类ID不能为空'));
      }

      if (updateData.name && (updateData.name.length < 1 || updateData.name.length > 50)) {
        return res.json(fail('分类名称长度必须在1-50个字符之间'));
      }

      // 查找分类
      const category = await CategoryService.findByUuid(categoryUuid);
      if (!category) return res.json(fail('分类不存在'));

      // 检查权限
      if (category.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人分类'));
      }

      // 更新分类
      const [rows] = await CategoryService.updateByUuid(categoryUuid, updateData);
      if (rows === 0) return res.json(fail('修改失败'));

      logger.info('更新分类成功:', categoryUuid);
      res.json(success(null, '修改成功'));
    } catch (err) {
      logger.error('更新分类失败:', err);
      BaseController.handleError(res, err, '修改失败');
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const categoryUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;

      // 验证参数
      if (!categoryUuid) {
        return res.json(fail('分类ID不能为空'));
      }

      // 查找分类
      const category = await CategoryService.findByUuid(categoryUuid);
      if (!category) return res.json(fail('分类不存在'));

      // 检查权限
      if (category.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人分类'));
      }

      // 删除分类
      const rows = await CategoryService.deleteByUuid(categoryUuid);
      if (rows === 0) return res.json(fail('删除失败'));

      logger.info('删除分类成功:', categoryUuid);
      res.json(success(null, '删除成功'));
    } catch (err) {
      logger.error('删除分类失败:', err);
      BaseController.handleError(res, err, '删除失败');
    }
  }

  static async batchDelete(req: Request, res: Response) {
    try {
      const { uuids } = req.body;
      const userUuid = req.user!.uuid;

      // 验证参数
      if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
        return res.json(fail('请选择要删除的分类'));
      }

      // 检查所有分类的权限
      for (const uuid of uuids) {
        const category = await CategoryService.findByUuid(uuid);
        if (!category) {
          return res.json(fail(`分类 ${uuid} 不存在`));
        }
        if (category.userUuid !== userUuid) {
          return res.json(fail('无权限操作他人分类'));
        }
      }

      // 批量删除分类
      const rows = await CategoryService.batchDeleteByUuids(uuids);
      if (rows === 0) return res.json(fail('删除失败'));

      logger.info('批量删除分类成功:', uuids.length);
      res.json(success(null, `成功删除 ${rows} 个分类`));
    } catch (err) {
      logger.error('批量删除分类失败:', err);
      BaseController.handleError(res, err, '批量删除失败');
    }
  }

  static async getCategoryWithTodos(req: Request, res: Response) {
    try {
      const categoryUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;

      // 验证参数
      if (!categoryUuid) {
        return res.json(fail('分类ID不能为空'));
      }

      // 查找分类
      const category = await CategoryService.findByUuid(categoryUuid);
      if (!category) return res.json(fail('分类不存在'));

      // 检查权限
      if (category.userUuid !== userUuid) {
        return res.json(fail('无权限查看他人分类'));
      }

      // 获取分类及其任务
      const categoryWithTodos = await CategoryService.findCategoryWithTodos(categoryUuid);

      logger.debug('获取分类及其任务成功:', categoryUuid);
      res.json(success(categoryWithTodos));
    } catch (err) {
      logger.error('获取分类任务失败:', err);
      BaseController.handleError(res, err, '获取分类任务失败');
    }
  }

  static async getAllUserCategories(req: Request, res: Response) {
    try {
      const userUuid = req.user!.uuid;

      // 获取用户的所有分类
      const categories = await CategoryService.findAllUserCategories(userUuid);

      logger.debug('获取用户所有分类成功:', userUuid);
      res.json(success(categories));
    } catch (err) {
      logger.error('获取用户所有分类失败:', err);
      BaseController.handleError(res, err, '获取用户所有分类失败');
    }
  }
}
