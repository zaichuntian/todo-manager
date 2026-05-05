import { Router } from 'express';
import { UserController } from '@controllers/user.controller';
import { WechatController } from '@controllers/wechat.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { userValidationRules, validate } from '@middleware/validation.middleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();

// 确保临时上传目录存在
const tmpUploadDir = path.join(__dirname, '../../tmp/uploads');
if (!fs.existsSync(tmpUploadDir)) {
  fs.mkdirSync(tmpUploadDir, { recursive: true });
}

// 配置文件上传临时存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpUploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// 用户相关路由
router.post('/register', userValidationRules.register, validate, UserController.register);
router.post('/login', userValidationRules.login, validate, UserController.login);
router.get('/users', authMiddleware, UserController.getList);
router.get('/users/:uuid', authMiddleware, UserController.getOne);
router.put('/users/:uuid', authMiddleware, userValidationRules.update, validate, UserController.update);
router.delete('/users/batch', authMiddleware, UserController.batchDelete);
router.delete('/users/:uuid', authMiddleware, UserController.delete);
router.put('/users/:uuid/status', authMiddleware, UserController.updateStatus);
router.post('/users/avatar', authMiddleware, upload.single('avatar'), UserController.uploadAvatar);
router.get('/users/avatar/:uuid', UserController.getAvatar);

// 微信登录相关路由
router.get('/wechat/login/qrcode', WechatController.getLoginQrCode);
router.get('/wechat/login/status', WechatController.checkLoginStatus);
router.get('/wechat/login/callback', WechatController.loginCallback);
export default router;
