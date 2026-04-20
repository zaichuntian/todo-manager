import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Todo from './todo.model';

class Category extends Model {
  public id!: number;
  public uuid!: string;
  public name!: string;
  public userUuid!: string;
  public isDeleted!: number;
}

Category.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    userUuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'Categories',
  }
);

// 关联关系
Category.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid', as: 'user' });
User.hasMany(Category, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'categories' });

Category.hasMany(Todo, { foreignKey: 'categoryUuid', sourceKey: 'uuid', as: 'todos' });
Todo.belongsTo(Category, { foreignKey: 'categoryUuid', targetKey: 'uuid', as: 'category' });

export default Category;