export const success = (data: any, msg = '请求成功') => {
  return { code: 200, msg, data };
};

export const fail = (msg = '请求失败', code = 500) => {
  return { code, msg };
};