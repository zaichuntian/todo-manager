import request from '../utils/request';
import type { Category, CategoryFormData } from '../types/category';
import type { ApiResponse } from '../types/common';

// 获取分类列表
export function getCategoriesApi(params: {
  pageNum: number;
  pageSize: number;
  name?: string;
}): Promise<ApiResponse<{ list: Category[]; total: number }>> {
  return request.get('/categories', { params });
}

// 添加分类
export function addCategoryApi(data: CategoryFormData): Promise<ApiResponse<Category>> {
  return request.post('/categories', data);
}

// 修改分类
export function updateCategoryApi(uuid: string, data: CategoryFormData): Promise<ApiResponse<Category>> {
  return request.put(`/categories/${uuid}`, data);
}

// 删除分类
export function deleteCategoryApi(uuid: string): Promise<ApiResponse<void>> {
  return request.delete(`/categories/${uuid}`);
}

// 获取分类及其任务
export function getCategoryWithTodosApi(uuid: string): Promise<ApiResponse<Category>> {
  return request.get(`/categories/${uuid}/todos`);
}

// 批量删除分类
export function batchDeleteCategoryApi(uuids: string[]): Promise<ApiResponse<void>> {
  return request.delete('/categories/batch', { data: { uuids } });
}
