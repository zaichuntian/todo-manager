// 用户相关类型定义

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

export interface UserListParams {
  pageNum: number;
  pageSize: number;
}

export interface UserListResponse {
  list: User[];
  total: number;
}

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
}

export interface UserRules {
  username: Array<{
    required?: boolean;
    message: string;
    trigger: string;
    min?: number;
    max?: number;
  }>;
  password: Array<{
    required?: boolean;
    message: string;
    trigger: string;
    min?: number;
    max?: number;
  }>;
}
