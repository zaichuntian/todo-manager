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
      unique: true, // 添加唯一索引
    },
    userUuid: {
      type: DataTypes.UUID, // 确保与用户表的 uuid 类型一致
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
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
