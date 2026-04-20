// 用户相关类型定义
import type { PaginationParams, PaginationResponse, FormRules } from './common';

export interface User {
  uuid: string;
  username: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  uuid: string;
  username: string;
  password: string;
}

export type UserListParams = PaginationParams;

export type UserListResponse = PaginationResponse<User>;

export type UserRules = FormRules;
export class ApiResponse {}
