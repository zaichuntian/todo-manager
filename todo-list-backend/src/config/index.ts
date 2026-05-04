import { CONSTANTS } from '../constants';
import { sequelize, testConnection, syncModels } from './database';
import redisClient from './redis';

export const config = {
  constants: CONSTANTS,
  sequelize,
  testConnection,
  syncModels,
  redisClient,
};

export { CONSTANTS } from '../constants';
export { sequelize, testConnection, syncModels } from './database';
export { default as redisClient } from './redis';