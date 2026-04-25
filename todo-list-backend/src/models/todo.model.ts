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
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    userUuid: {
      type: DataTypes.CHAR(36),
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
    categoryUuid: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'todos',
    timestamps: false,
  }
);

export default Todo;
