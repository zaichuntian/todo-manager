import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { fail } from '../utils/response';
import { decrypt } from '../utils/crypto';
import { body } from 'express-validator';

// 用户验证规则
export const userValidationRules = {
  register: [
    body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度应在3-20个字符之间'),
    body('password').custom(value => {
      try {
        const realPassword = decrypt(value);
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

// 导入外部验证规则
import { categoryValidationRules } from '../validators/category.validator';
import { todoValidationRules } from '../validators/todo.validator';

// 导出所有验证规则
export { categoryValidationRules, todoValidationRules };

// 验证中间件
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.json(fail(errorMessages.join(', '), 400));
  }
  next();
};
