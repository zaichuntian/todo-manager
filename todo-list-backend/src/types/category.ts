// 分类相关类型定义
import type { FormRules, UserBasic } from './common';
import type { Todo } from './todo';

export interface Category {
  uuid: string;
  name: string;
  userUuid: string;
  user?: UserBasic;
  todos?: Todo[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
}

export type CategoryRules = FormRules;

export type CategoryListResponse = {
  list: Category[];
};

export type CategoryWithTodosResponse = Category;
