import { Request, Response } from 'express';
import { fail, success } from '@utils/response';
import { logger } from '@utils/logger';
import { RedisUtil } from '@utils/redis';
import { v4 as uuidv4 } from 'uuid';
import User from '@models/user.model';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export class WechatController {
  // 微信开放平台配置（需要在微信开放平台注册后获取）
  private static readonly WECHAT_CONFIG = {
    appId: process.env.WECHAT_APP_ID || 'YOUR_WECHAT_APP_ID',
    appSecret: process.env.WECHAT_APP_SECRET || 'YOUR_WECHAT_APP_SECRET',
    redirectUri: process.env.WECHAT_REDIRECT_URI || 'http://localhost:3001/api/wechat/login/callback',
  };

  /**
   * 获取微信登录二维码（测试模式）
   * GET /api/wechat/login/qrcode
   */
  static async getLoginQrCode(req: Request, res: Response) {
    try {
      // 生成唯一的 state 标识
      const state = uuidv4();

      // 测试模式：生成一个本地回调URL，用户扫码后直接登录
      // 将下面的IP替换为你的电脑局域网IP地址
      const localIp = '192.168.0.44'; // 请修改为你的实际IP
      const qrCodeUrl = `http://${localIp}:3001/api/wechat/login/callback?code=test_code&state=${state}`;

      // 存储 state 状态到 Redis（有效期5分钟）
      await RedisUtil.set(`wechat_login:${state}`, 'pending', 300);

      logger.info('生成微信登录二维码（测试模式）:', state);
      return res.json(success({ qrCodeUrl, state }, '获取二维码成功'));
    } catch (error) {
      logger.error('获取微信登录二维码失败:', error);
      return res.json(fail('获取二维码失败'));
    }
  }

  /**
   * 检查微信登录状态
   * GET /api/wechat/login/status?state=xxx
   */
  static async checkLoginStatus(req: Request, res: Response) {
    try {
      const { state } = req.query;

      if (!state || typeof state !== 'string') {
        return res.json(fail('参数错误'));
      }

      // 从 Redis 获取登录状态
      const status = await RedisUtil.get(`wechat_login:${state}`);

      if (!status) {
        return res.json(fail('二维码已过期', 408));
      }

      if (status === 'pending') {
        // 等待用户扫码
        return res.json(success({ status: 'pending' }, '等待扫码'));
      }

      // 登录成功，返回用户信息
      return res.json(success(status, '登录成功'));
    } catch (error) {
      logger.error('检查微信登录状态失败:', error);
      return res.json(fail('检查状态失败'));
    }
  }

  /**
   * 微信授权回调（模拟模式）
   * GET /api/wechat/login/callback?code=xxx&state=xxx
   */
  static async loginCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query;

      logger.info('微信登录回调请求:', { code, state });

      if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
        logger.error('参数错误:', { code, state });
        return res.send('参数错误');
      }

      // 验证 state 是否有效（测试模式下跳过验证，方便测试）
      let existingState = null;
      try {
        existingState = await RedisUtil.get(`wechat_login:${state}`);
        logger.info('Redis中state状态:', existingState);
      } catch (redisError) {
        logger.error('Redis读取失败:', redisError);
      }

      // 测试模式：即使state不存在也继续登录
      if (!existingState) {
        logger.warn('state不存在，测试模式下继续登录');
        // 在测试模式下，存储一个临时状态
        await RedisUtil.set(`wechat_login:${state}`, 'pending', 300);
      }

      // 模拟微信登录成功（测试模式）
      const mockUser = await WechatController.mockWechatLogin();

      if (!mockUser) {
        logger.error('获取用户失败');
        return res.send('获取用户信息失败');
      }

      logger.info('找到用户:', mockUser.username);

      // 获取用户数据（包括自动生成的字段）
      const userData = mockUser.dataValues || mockUser;

      // 生成 JWT token
      const token = jwt.sign({ uuid: userData.uuid }, process.env.JWT_SECRET as string, {
        expiresIn: '7d' as const,
      });

      // 构建用户信息
      const userInfo = {
        userUuid: userData.uuid,
        username: userData.username,
        status: userData.status,
        role: userData.role,
        token,
        email: userData.email,
        phone: userData.phone,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };

      // 更新 Redis 中的登录状态
      await RedisUtil.set(
        `wechat_login:${state}`,
        {
          status: 'success',
          userInfo,
        },
        60
      );

      logger.info('微信登录成功:', mockUser.username);
      return res.send('<h1>登录成功！</h1><p>请返回登录页面</p>');
    } catch (error) {
      logger.error('微信登录回调失败:', error);
      return res.send('登录失败，请重试');
    }
  }

  /**
   * 模拟微信登录（测试模式）
   */
  private static async mockWechatLogin(): Promise<User | null> {
    try {
      // 查找第一个用户作为模拟登录用户
      const user = await User.findOne({
        where: { isDeleted: 0 },
        order: [['createdAt', 'ASC']],
      });

      if (user) {
        return user;
      }

      // 如果没有用户，创建一个测试用户
      return await User.create({
        username: 'wechat_user',
        password: 'mock_password_hash',
        status: 1,
        role: 0,
      });
    } catch (error) {
      logger.error('模拟微信登录失败:', error);
      return null;
    }
  }

  /**
   * 调用微信API获取用户信息
   */
  private static async getWechatUserInfo(code: string): Promise<WechatUserInfo | null> {
    try {
      // 1. 获取access_token
      const tokenResponse = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
        params: {
          appid: WechatController.WECHAT_CONFIG.appId,
          secret: WechatController.WECHAT_CONFIG.appSecret,
          code,
          grant_type: 'authorization_code',
        },
      });

      const { access_token, openid } = tokenResponse.data;

      if (!access_token || !openid) {
        logger.error('获取微信access_token失败:', tokenResponse.data);
        return null;
      }

      // 2. 获取用户信息
      const userResponse = await axios.get('https://api.weixin.qq.com/sns/userinfo', {
        params: {
          access_token,
          openid,
          lang: 'zh_CN',
        },
      });

      return userResponse.data;
    } catch (error) {
      logger.error('获取微信用户信息失败:', error);
      return null;
    }
  }

  /**
   * 根据微信用户创建或查找本地用户
   */
  private static async findOrCreateUser(wechatUser: WechatUserInfo): Promise<User> {
    // 尝试查找已绑定的用户
    const user = await User.findOne({
      where: { isDeleted: 0, username: wechatUser.openid },
    });

    if (user) {
      return user;
    }

    // 创建新用户
    return await User.create({
      username: wechatUser.openid,
      password: 'wechat_login', // 微信登录用户密码占位
      status: 1,
      role: 0,
      nickname: wechatUser.nickname || '微信用户',
    });
  }
}

// 微信用户信息接口
type WechatUserInfo = {
  openid: string;
  nickname?: string;
  sex?: number;
  province?: string;
  city?: string;
  country?: string;
  headimgurl?: string;
  privilege?: string[];
  unionid?: string;
};
