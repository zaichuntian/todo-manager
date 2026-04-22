import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Todo extends Model {
  public id!: number;
  public uuid!: string;
  public userUuid!: string;
  public title!: string;
  public content!: string;
  public status!: number;
  public categoryUuid!: string;
  public isDeleted!: number;
}

Todo.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      // 移除 unique: true
    },
    userUuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    categoryUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'Todos',
    indexes: [
      {
        fields: ['uuid'],
      },
      {
        fields: ['userUuid'],
      },
      {
        fields: ['categoryUuid'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Todo;
