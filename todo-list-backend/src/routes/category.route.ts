import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { categoryValidationRules, validate } from '../middleware/validation.middleware';

const router = Router();

router.get('/categories', authMiddleware, CategoryController.getUserCategories);
router.post('/categories', authMiddleware, categoryValidationRules.create, validate, CategoryController.create);
router.put('/categories/:uuid', authMiddleware, categoryValidationRules.update, validate, CategoryController.update);
router.delete('/categories/:uuid', authMiddleware, CategoryController.delete);
router.get('/categories/:uuid/todos', authMiddleware, CategoryController.getCategoryWithTodos);

export default router;
