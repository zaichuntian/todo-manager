// 模型关联文件，避免循环依赖
import User from './user.model';
import Todo from './todo.model';
import Category from './category.model';

// User 关联
User.hasMany(Todo, {
  foreignKey: 'userUuid',
  as: 'todos',
  sourceKey: 'uuid',
});

User.hasMany(Category, {
  foreignKey: 'userUuid',
  as: 'categories',
  sourceKey: 'uuid',
});

// Todo 关联
Todo.belongsTo(User, {
  foreignKey: 'userUuid',
  as: 'user',
  targetKey: 'uuid',
});

Todo.belongsTo(Category, {
  foreignKey: 'categoryUuid',
  as: 'category',
  targetKey: 'uuid',
});

// Category 关联
Category.belongsTo(User, {
  foreignKey: 'userUuid',
  as: 'user',
  targetKey: 'uuid',
});

Category.hasMany(Todo, {
  foreignKey: 'categoryUuid',
  as: 'todos',
  sourceKey: 'uuid',
});

export { User, Todo, Category };
