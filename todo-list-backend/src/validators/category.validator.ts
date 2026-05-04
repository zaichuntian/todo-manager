import { body } from 'express-validator';

/**
 * 分类验证规则
 */
export const categoryValidationRules = {
  /**
   * 创建分类验证规则
   */
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

  /**
   * 更新分类验证规则
   */
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
