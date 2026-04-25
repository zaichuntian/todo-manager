import request from '../utils/request';
import type { User, UserFormData, UserInfo } from '../types/user';
import type { ApiResponse } from '../types/common';

// 登录
export function loginApi(data: { username: string; password: string }): Promise<UserInfo> {
  return request.post('/login', data);
}

// 注册（新增用户复用这个）
export function registerApi(data: {
  username: string;
  password: string;
  nickname?: string;
  phone?: string;
  email?: string;
  role?: number;
  status?: number;
}): Promise<ApiResponse<void>> {
  return request.post('/register', data);
}

// 获取用户列表
export function getUserListApi(params: {
  pageNum: number;
  pageSize: number;
  username?: string;
  phone?: string;
}): Promise<ApiResponse<{ list: User[]; total: number }>> {
  return request.get('/users', { params });
}

// 修改用户
export function updateUserApi(uuid: string, data: Partial<UserFormData>): Promise<ApiResponse<User>> {
  return request.put(`/users/${uuid}`, data);
}

// 删除用户
export function deleteUserApi(uuid: string): Promise<ApiResponse<void>> {
  return request.delete(`/users/${uuid}`);
}

// 切换用户状态
export function updateUserStatusApi(uuid: string, status: number): Promise<ApiResponse<void>> {
  return request.put(`/users/${uuid}/status`, { status });
}

// 批量删除用户
export function batchDeleteUserApi(uuids: string[]): Promise<ApiResponse<void>> {
  return request.delete('/users/batch', { data: { uuids } });
}
