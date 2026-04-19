import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 所有 todo 接口必须登录
router.get('/todos', authMiddleware, TodoController.getList);
router.get('/todos/:uuid', authMiddleware, TodoController.getOne);
router.post('/todos', authMiddleware, TodoController.create);
router.put('/todos/:uuid', authMiddleware, TodoController.update);
router.delete('/todos/:uuid', authMiddleware, TodoController.delete);

export default router;