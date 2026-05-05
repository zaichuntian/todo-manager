import { Router } from 'express';
import { UserController } from '@controllers/user.controller';
import { WechatController } from '@controllers/wechat.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { userValidationRules, validate } from '@middleware/validation.middleware';

const router = Router();

// 用户相关路由
router.post('/register', userValidationRules.register, validate, UserController.register);
router.post('/login', userValidationRules.login, validate, UserController.login);
router.get('/users', authMiddleware, UserController.getList);
router.get('/users/:uuid', authMiddleware, UserController.getOne);
router.put('/users/:uuid', authMiddleware, userValidationRules.update, validate, UserController.update);
router.delete('/users/batch', authMiddleware, UserController.batchDelete);
router.delete('/users/:uuid', authMiddleware, UserController.delete);
router.put('/users/:uuid/status', authMiddleware, UserController.updateStatus);

// 微信登录相关路由
router.get('/wechat/login/qrcode', WechatController.getLoginQrCode);
router.get('/wechat/login/status', WechatController.checkLoginStatus);
router.get('/wechat/login/callback', WechatController.loginCallback);
export default router;
