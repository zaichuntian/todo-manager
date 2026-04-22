import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { todoValidationRules, validate } from '../middleware/validation.middleware';

const router = Router();

router.get('/todos', authMiddleware, TodoController.getMyList);
router.post('/todos', authMiddleware, todoValidationRules.create, validate, TodoController.create);
router.put('/todos/:uuid', authMiddleware, todoValidationRules.update, validate, TodoController.update);
router.delete('/todos/:uuid', authMiddleware, TodoController.delete);
router.put('/todos/:uuid/status', authMiddleware, TodoController.updateStatus);

export default router;
