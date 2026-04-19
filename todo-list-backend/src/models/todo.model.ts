import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

class Todo extends Model {
  public id!: number;
  public uuid!: string;
  public title!: string;
  public content!: string;
  public completed!: boolean;
  public isDeleted!: number;
  public userId!: number; // 关联用户
}

Todo.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: true,
      // unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    // 关键：关联用户
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'Todos',
  }
);

Todo.beforeCreate((todo: Todo) => {
  if (!todo.uuid) {
    todo.uuid = uuidv4();
  }
});

export default Todo;