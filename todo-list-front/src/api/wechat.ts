import request from '@utils/request';

// 微信登录二维码响应类型
export interface WechatQrCodeResponse {
  qrCodeUrl: string;
  state: string;
}

// 微信登录状态响应类型
export interface WechatLoginStatusResponse {
  status: 'pending' | 'success' | 'failed';
  userInfo?: UserInfo;
}

// 用户信息类型
export interface UserInfo {
  userUuid: string;
  username: string;
  status: number;
  role: number;
  token: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 获取微信登录二维码
export const getLoginQrCode = async (): Promise<WechatQrCodeResponse> => {
  const response = await request.get('/wechat/login/qrcode');
  return response as unknown as WechatQrCodeResponse;
};

// 检查微信登录状态
export const checkLoginStatus = async (params: { state: string }): Promise<WechatLoginStatusResponse> => {
  const response = await request.get('/wechat/login/status', { params });
  return response as unknown as WechatLoginStatusResponse;
};

// 微信登录回调（由微信服务器调用，前端不需要调用此接口）
export const wechatLoginCallback = async (params: { code: string; state: string }) => {
  const response = await request.get('/wechat/login/callback', { params });
  return response;
};
