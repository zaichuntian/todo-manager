import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Category extends Model {
  public id!: number;
  public uuid!: string;
  public userUuid!: string;
  public name!: string;
  public description?: string;
  public color?: string;
  public icon?: string;
  public parentUuid?: string;
  public isDeleted!: number;
}

Category.init(
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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '#409EFF', // 默认蓝色
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Folder', // 默认文件夹图标
    },
    parentUuid: {
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
    tableName: 'Categories',
  }
);

export default Category;
