import request from '../utils/request';

// 获取分类列表
export function getCategoriesApi(params: { pageNum: number; pageSize: number }) {
  return request.get('/categories', { params });
}

// 添加分类
export function addCategoryApi(data: { name: string }) {
  return request.post('/categories', data);
}

// 修改分类
export function updateCategoryApi(uuid: string, data: { name: string }) {
  return request.put(`/categories/${uuid}`, data);
}

// 删除分类
export function deleteCategoryApi(uuid: string) {
  return request.delete(`/categories/${uuid}`);
}

// 获取分类及其任务
export function getCategoryWithTodosApi(uuid: string) {
  return request.get(`/categories/${uuid}/todos`);
}
