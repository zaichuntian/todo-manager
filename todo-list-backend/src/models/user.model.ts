import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: number;
  public uuid!: string;
  public username!: string;
  public password!: string;
  public nickname!: string;
  public phone!: string;
  public email!: string;
  public role!: number;
  public status!: number;
  public isDeleted!: number;
}

User.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      // 移除 unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
      // 移除 unique: true，避免索引过多
    },
    role: {
      type: DataTypes.TINYINT,
      defaultValue: 0, // 0 普通用户，1 管理员，2 超级管理员
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
    indexes: [
      {
        fields: ['uuid'],
      },
      {
        fields: ['username'],
      },
      {
        fields: ['role'],
      },
    ],
  }
);

export default User;
