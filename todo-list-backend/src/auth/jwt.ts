import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/user.model';

// 从环境变量获取密钥
const getSecret = (): jwt.Secret => {
  return process.env.JWT_SECRET || 'my_super_secret_key_2026_abcdefg';
};

/**
 * 生成 JWT Token
 */
export function generateToken(user: User): string {
  const payload = {
    uuid: user.uuid,
    id: user.id,
    email: user.email,
  };
  
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };
  
  return jwt.sign(payload, getSecret() as jwt.Secret, options);
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    throw new Error('Token 验证失败');
  }
}

/**
 * 解析 Token（不验证）
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}