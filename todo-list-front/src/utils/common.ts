// 通用工具函数

import { ElMessage } from 'element-plus';

/**
 * 显示成功消息
 * @param message 消息内容
 */
export const showSuccessMessage = (message: string) => {
  ElMessage.success(message);
};

/**
 * 显示错误消息
 * @param message 消息内容
 */
export const showErrorMessage = (message: string) => {
  ElMessage.error(message);
};

/**
 * 显示信息消息
 * @param message 消息内容
 */
export const showInfoMessage = (message: string) => {
  ElMessage.info(message);
};

/**
 * 显示警告消息
 * @param message 消息内容
 */
export const showWarningMessage = (message: string) => {
  ElMessage.warning(message);
};

/**
 * 生成唯一ID
 * @returns 唯一ID
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 检查是否为空值
 * @param value 要检查的值
 * @returns 是否为空
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};
