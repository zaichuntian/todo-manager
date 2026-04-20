import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/categories', authMiddleware, CategoryController.getUserCategories);
router.post('/categories', authMiddleware, CategoryController.create);
router.put('/categories/:uuid', authMiddleware, CategoryController.update);
router.delete('/categories/:uuid', authMiddleware, CategoryController.delete);
router.get('/categories/:uuid/todos', authMiddleware, CategoryController.getCategoryWithTodos);

export default router;
