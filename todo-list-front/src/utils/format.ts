import dayjs from 'dayjs';

/**
 * 格式化时间
 * @param time 时间字符串
 * @param format 格式，默认为 'YYYY-MM-DD HH:mm'
 * @returns 格式化后的时间字符串
 */
export const formatTime = (time: string, format: string = 'YYYY-MM-DD HH:mm') => {
  return dayjs(time).format(format);
};

/**
 * 格式化日期时间
 * @param time 时间字符串
 * @returns 格式化后的日期时间字符串 'YYYY.MM.DD HH:mm:ss'
 */
export const formatDateTime = (time: string) => {
  return dayjs(time).format('YYYY.MM.DD HH:mm:ss');
};
