import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { success, fail } from '../utils/response';
import { BaseController } from './base.controller';
import { CONSTANTS } from '../config/constants';

export class CategoryController extends BaseController {
  static async getUserCategories(req: Request, res: Response) {
    try {
      const userUuid = req.user!.uuid;
      const pageNum = Number(req.query.pageNum) || CONSTANTS.DEFAULT_PAGE_NUM;
      const pageSize = Number(req.query.pageSize) || CONSTANTS.DEFAULT_PAGE_SIZE;

      const data = await CategoryService.findUserCategories(userUuid, pageNum, pageSize);

      // 修复：使用 BaseController.handlePaginationResponse
      BaseController.handlePaginationResponse(res, data, pageNum, pageSize);
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '获取分类列表失败');
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const userUuid = req.user!.uuid;

      if (!name) {
        return res.json(fail('分类名称不能为空'));
      }

      await CategoryService.create({
        userUuid,
        name,
      });

      return res.json(success(null, '创建成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '创建失败');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const categoryUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;

      const category = await CategoryService.findByUuid(categoryUuid);
      if (!category) return res.json(fail('分类不存在'));

      if (category.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人分类'));
      }

      const [rows] = await CategoryService.updateByUuid(categoryUuid, req.body);
      if (rows === 0) return res.json(fail('修改失败'));

      res.json(success(null, '修改成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '修改失败');
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const categoryUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;

      const category = await CategoryService.findByUuid(categoryUuid);
      if (!category) return res.json(fail('分类不存在'));

      if (category.userUuid !== userUuid) {
        return res.json(fail('无权限操作他人分类'));
      }

      const [rows] = await CategoryService.deleteByUuid(categoryUuid);
      if (rows === 0) return res.json(fail('删除失败'));

      res.json(success(null, '删除成功'));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '删除失败');
    }
  }

  static async getCategoryWithTodos(req: Request, res: Response) {
    try {
      const categoryUuid = req.params.uuid as string;
      const userUuid = req.user!.uuid;

      const category = await CategoryService.findByUuid(categoryUuid);
      if (!category) return res.json(fail('分类不存在'));

      if (category.userUuid !== userUuid) {
        return res.json(fail('无权限查看他人分类'));
      }

      const categoryWithTodos = await CategoryService.findCategoryWithTodos(categoryUuid);

      res.json(success(categoryWithTodos));
    } catch (err) {
      // 修复：使用 BaseController.handleError
      BaseController.handleError(res, err, '获取分类任务失败');
    }
  }
}
