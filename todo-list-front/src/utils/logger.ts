// src/utils/logger.ts
const LOG_PREFIX = '[TODO-APP]';
const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * 信息日志 - 用于正常流程输出
   */
  info(...args: any[]) {
    if (isDevelopment) {
      console.info(`${LOG_PREFIX} [INFO]`, ...args);
    }
  },

  /**
   * 警告日志 - 用于需要注意的情况
   */
  warn(...args: any[]) {
    if (isDevelopment) {
      console.warn(`${LOG_PREFIX} [WARN]`, ...args);
    }
  },

  /**
   * 错误日志 - 用于错误情况
   */
  error(...args: any[]) {
    console.error(`${LOG_PREFIX} [ERROR]`, ...args);
  },

  /**
   * 调试日志 - 用于详细调试信息
   */
  debug(...args: any[]) {
    if (isDevelopment) {
      console.debug(`${LOG_PREFIX} [DEBUG]`, ...args);
    }
  },

  /**
   * 成功日志 - 用于成功操作
   */
  success(...args: any[]) {
    if (isDevelopment) {
      console.log('%c' + LOG_PREFIX + ' [SUCCESS]', 'color: #67c23a', ...args);
    }
  },
};

export default logger;
