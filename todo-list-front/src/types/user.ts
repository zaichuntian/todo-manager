// 用户相关类型定义
import type { PaginationParams, PaginationResponse, FormRules } from './common';

export interface User {
  uuid: string;
  username: string;
  nickname?: string;
  phone?: string;
  email?: string;
  role: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  phone: string;
  nickname: string;
  uuid: string;
  username: string;
  password: string;
  confirmPassword?: string;
  email: string;
  role: number;
  status: number;
}

export interface UserInfo {
  userUuid: string;
  username: string;
  role?: number;
  status?: number;
  token: string;
}

export type UserListParams = PaginationParams;

export type UserListResponse = PaginationResponse<User>;

export type UserRules = FormRules;
export class ApiResponse {}
