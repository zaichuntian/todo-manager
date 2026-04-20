// 任务相关类型定义
import type { PaginationParams, PaginationResponse, FormRules, UserBasic } from './common';

export interface Todo {
  uuid: string;
  title: string;
  content: string;
  status: number;
  userUuid: string;
  user?: UserBasic;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFormData {
  uuid: string;
  title: string;
  content: string;
}

export type TodoListParams = PaginationParams;

export type TodoListResponse = PaginationResponse<Todo>;

export type TodoRules = FormRules;
