// 任务相关类型定义
import type { PaginationParams, PaginationResponse, FormRules, UserBasic } from './common';
import type { Category } from './category';

export interface Todo {
  uuid: string;
  title: string;
  content: string;
  status: number;
  userUuid: string;
  categoryUuid: string;
  user?: UserBasic;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFormData {
  uuid: string;
  title: string;
  content: string;
  categoryUuid: string;
}

export type TodoListParams = PaginationParams;

export type TodoListResponse = PaginationResponse<Todo>;

export type TodoRules = FormRules;
