import request from '../utils/request';
import type { ApiResponse } from '../types/user';

// 登录
export function loginApi(data: { username: string; password: string }) {
  return request.post<ApiResponse>('/login', data);
}

// 注册（新增用户复用这个）
export function registerApi(data: {
  username: string;
  password: string;
  nickname?: string;
  phone?: string;
  email?: string;
}) {
  return request.post<ApiResponse>('/register', data);
}

// 获取用户列表
export function getUserListApi(params: { pageNum: number; pageSize: number }) {
  return request.get<ApiResponse>('/users', { params });
}

// 修改用户
export function updateUserApi(uuid: string, data: any) {
  return request.put<ApiResponse>(`/users/${uuid}`, data);
}

// 删除用户
export function deleteUserApi(uuid: string) {
  return request.delete<ApiResponse>(`/users/${uuid}`);
}

// 切换用户状态
export function updateUserStatusApi(uuid: string, status: number) {
  return request.put<ApiResponse>(`/users/${uuid}/status`, { status });
}
