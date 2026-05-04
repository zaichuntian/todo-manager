import { body } from 'express-validator';

/**
 * 任务验证规则
 */
export const todoValidationRules = {
  /**
   * 创建任务验证规则
   */
  create: [
    body('title').isLength({ min: 2, max: 50 }).withMessage('标题长度应在2-50个字符之间'),

    body('content').isLength({ min: 2, max: 200 }).withMessage('内容长度应在2-200个字符之间'),

    body('categoryUuid')
      .notEmpty()
      .withMessage('分类不能为空')
      .custom(value => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      })
      .withMessage('分类UUID格式错误'),
  ],

  /**
   * 更新任务验证规则
   */
  update: [
    body('title').isLength({ min: 2, max: 50 }).withMessage('标题长度应在2-50个字符之间').optional(),

    body('content').isLength({ min: 2, max: 200 }).withMessage('内容长度应在2-200个字符之间').optional(),

    body('categoryUuid')
      .notEmpty()
      .withMessage('分类不能为空')
      .custom(value => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      })
      .withMessage('分类UUID格式错误')
      .optional(),

    body('status').isIn([0, 1]).withMessage('状态值不合法').optional(),
  ],

  /**
   * 更新状态验证规则
   */
  updateStatus: [body('status').isIn([0, 1]).withMessage('状态值不合法，只能是0或1')],
};
