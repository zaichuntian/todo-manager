// 任务相关类型定义

export interface User {
  uuid: string;
  username: string;
}

export interface Todo {
  uuid: string;
  title: string;
  content: string;
  status: number;
  userUuid: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFormData {
  uuid: string;
  title: string;
  content: string;
}

export interface TodoListParams {
  pageNum: number;
  pageSize: number;
}

export interface TodoListResponse {
  list: Todo[];
  total: number;
}

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
}

export interface TodoRules {
  title: Array<{
    required?: boolean;
    message: string;
    trigger: string;
    min?: number;
    max?: number;
  }>;
  content: Array<{
    required?: boolean;
    message: string;
    trigger: string;
    min?: number;
    max?: number;
  }>;
}
