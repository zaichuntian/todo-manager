import { Sequelize, DataTypes } from 'sequelize';

// 连接数据库（你已经成功的配置）
const sequelize = new Sequelize('todo_db', 'root', '0000', {
  host: '127.0.0.1',
  dialect: 'mysql',
  logging: false,
  port: 3300,
});

export default sequelize;
