import fs from 'fs';
import crypto from 'crypto';

// 读取密钥文件
const publicKey = fs.readFileSync('./public.pem', 'utf8');
const privateKey = fs.readFileSync('./private.pem', 'utf8');

// 加密（注册时用）
export function rsaEncrypt(data: string): string {
  const buffer = Buffer.from(data);
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
}

// 解密（登录时用）
export function rsaDecrypt(encryptedData: string): string {
  const buffer = Buffer.from(encryptedData, 'base64');
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString('utf8');
}
