import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 公开接口（无需登录）
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// 需要登录的接口
router.get('/users', authMiddleware, UserController.getList);
router.get('/users/:uuid', authMiddleware, UserController.getOne);
router.put('/users/:uuid', authMiddleware, UserController.update);
router.delete('/users/:uuid', authMiddleware, UserController.delete);
router.put('/users/:uuid/status', authMiddleware, UserController.updateStatus);

export default router;
