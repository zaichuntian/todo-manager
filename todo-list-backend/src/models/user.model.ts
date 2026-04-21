// src/models/user.model.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

class User extends Model {
  public id!: number;
  public uuid!: string;
  public username!: string;
  public password!: string;
  public role!: number;
  public nickname!: string;
  public phone!: string;
  public email!: string;
  public isDeleted!: number;
}

User.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      // 新增：角色字段
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true, // 邮箱唯一
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
