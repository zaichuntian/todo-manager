import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/todos', authMiddleware, TodoController.getMyList);
router.post('/todos', authMiddleware, TodoController.create);
router.put('/todos/:uuid', authMiddleware, TodoController.update);
router.delete('/todos/:uuid', authMiddleware, TodoController.delete);
router.put('/todos/:uuid/status', authMiddleware, TodoController.updateStatus);

export default router;
