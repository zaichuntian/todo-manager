// 公共类型定义

// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
}

// 分页参数
export interface PaginationParams {
  pageNum: number;
  pageSize: number;
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[];
  total: number;
}

// 表单验证规则
export interface FormRules {
  [key: string]: Array<{
    required?: boolean;
    message: string;
    trigger: string;
    min?: number;
    max?: number;
  }>;
}

// 用户基本信息（用于关联）
export interface UserBasic {
  uuid: string;
  username: string;
}
