import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

class Todo extends Model {
  public id!: number;
  public uuid!: string;
  public userUuid!: string;
  public title!: string;
  public content!: string;
  public status!: number;
  public isDeleted!: number;
}

Todo.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
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
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'Todos',
  }
);

// 关联：根据 userUuid 关联 User 的 uuid 字段
Todo.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid', as: 'user' });
User.hasMany(Todo, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'todos' });

export default Todo;
