import request from '../utils/request';

// 获取todos
export function getTodosApi(params: { pageNum: number; pageSize: number }) {
  return request.get('/todos', { params });
}

// 添加todo
export function addTodoApi(data: { title: string; content: string }) {
  return request.post('/todos', data);
}

// 修改todo
export function updateTodoApi(uuid: string, data: any) {
  return request.put(`/todos/${uuid}`, data);
}

// 删除todo
export function deleteTodoApi(uuid: string) {
  return request.delete(`/todos/${uuid}`);
}

// 新增：更新todo状态
export function updateTodoStatusApi(uuid: string, status: number) {
  return request.put(`/todos/${uuid}/status`, { status });
}
