import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { fail } from '../utils/response';
import { decrypt } from '../utils/crypto';

// 用户验证规则
export const userValidationRules = {
  register: [
    body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度应在3-20个字符之间'),
    body('password').custom(value => {
      try {
        const realPassword = decrypt(value);
        // 使用类型断言，因为我们已经检查了 realPassword 不为 null
        const password = realPassword as string;
        if (password.length < 4 || password.length > 20) {
          throw new Error('密码长度应在4-20个字符之间');
        }
        return true;
      } catch (error) {
        throw new Error('密码格式错误');
      }
    }),
    body('email').isEmail().withMessage('请输入正确的邮箱地址').optional(),
  ],
  login: [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  update: [
    body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度应在3-20个字符之间').optional(),
    body('email').isEmail().withMessage('请输入正确的邮箱地址').optional(),
    body('role').isIn([0, 1, 2]).withMessage('角色值不合法').optional(),
    body('status').isIn([0, 1]).withMessage('状态值不合法').optional(),
  ],
};

// 分类验证规则
export const categoryValidationRules = {
  create: [
    body('name').isLength({ min: 1, max: 50 }).withMessage('分类名称长度应在1-50个字符之间'),
    body('description').isLength({ max: 200 }).withMessage('分类描述长度不能超过200个字符').optional(),
    body('color')
      .matches(/^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/)
      .withMessage('请输入有效的十六进制颜色值')
      .optional(),
    body('icon').isLength({ max: 50 }).withMessage('图标名称长度不能超过50个字符').optional(),
    body('parentUuid')
      .custom(value => {
        if (value === '') return true;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      })
      .withMessage('父分类UUID格式错误')
      .optional(),
  ],
  update: [
    body('name').isLength({ min: 1, max: 50 }).withMessage('分类名称长度应在1-50个字符之间').optional(),
    body('description').isLength({ max: 200 }).withMessage('分类描述长度不能超过200个字符').optional(),
    body('color')
      .matches(/^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/)
      .withMessage('请输入有效的十六进制颜色值')
      .optional(),
    body('icon').isLength({ max: 50 }).withMessage('图标名称长度不能超过50个字符').optional(),
    body('parentUuid')
      .custom(value => {
        if (value === '') return true;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      })
      .withMessage('父分类UUID格式错误')
      .optional(),
  ],
};

// 任务验证规则
export const todoValidationRules = {
  create: [
    body('title').isLength({ min: 2, max: 50 }).withMessage('标题长度应在2-50个字符之间'),
    body('content').isLength({ min: 2, max: 200 }).withMessage('内容长度应在2-200个字符之间'),
    body('categoryUuid').notEmpty().withMessage('分类不能为空'),
  ],
  update: [
    body('title').isLength({ min: 2, max: 50 }).withMessage('标题长度应在2-50个字符之间').optional(),
    body('content').isLength({ min: 2, max: 200 }).withMessage('内容长度应在2-200个字符之间').optional(),
    body('categoryUuid').notEmpty().withMessage('分类不能为空').optional(),
    body('status').isIn([0, 1]).withMessage('状态值不合法').optional(),
  ],
};

// 验证中间件
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.json(fail(errorMessages.join(', '), 400));
  }
  next();
};
