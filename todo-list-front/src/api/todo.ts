import request from '../utils/request';
import type { Todo, TodoFormData } from '../types/todo';
import type { ApiResponse } from '../types/common';

// 获取todos
export function getTodosApi(params: {
  pageNum: number;
  pageSize: number;
  title?: string;
  content?: string;
}): Promise<ApiResponse<{ list: Todo[]; total: number }>> {
  return request.get('/todos', { params });
}

// 添加todo
export function addTodoApi(data: TodoFormData): Promise<ApiResponse<Todo>> {
  return request.post('/todos', data);
}

// 修改todo
export function updateTodoApi(uuid: string, data: Partial<TodoFormData>): Promise<ApiResponse<Todo>> {
  return request.put(`/todos/${uuid}`, data);
}

// 删除todo
export function deleteTodoApi(uuid: string): Promise<ApiResponse<void>> {
  return request.delete(`/todos/${uuid}`);
}

// 新增：更新todo状态
export function updateTodoStatusApi(uuid: string, status: number): Promise<ApiResponse<void>> {
  return request.put(`/todos/${uuid}/status`, { status });
}

// 批量删除任务
export function batchDeleteTodoApi(uuids: string[]): Promise<ApiResponse<void>> {
  return request.delete('/todos/batch', { data: { uuids } });
}
