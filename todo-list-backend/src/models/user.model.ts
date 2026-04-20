// src/models/user.model.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

class User extends Model {
  public id!: number;
  public uuid!: string;
  public username!: string;
  public password!: string;
  public isDeleted!: number;
}

User.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      unique: true, // 添加唯一索引
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    // 关键：把 password 改成 TEXT 或 VARCHAR(500)
    password: {
      type: DataTypes.STRING(255), // bcrypt 只有 60 位左右，完全存得下
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1 启用，0 禁用
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'Users',
  }
);

export default User;
