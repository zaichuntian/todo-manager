import Todo from './todo.model';
import User from './user.model';
import Category from './category.model';

// 用户与任务的关联
User.hasMany(Todo, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'todos' });
Todo.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid', as: 'user' });

// 用户与分类的关联
User.hasMany(Category, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid', as: 'user' });

// 分类与任务的关联
Category.hasMany(Todo, { foreignKey: 'categoryUuid', sourceKey: 'uuid', as: 'todos' });
Todo.belongsTo(Category, { foreignKey: 'categoryUuid', targetKey: 'uuid', as: 'category' });

export { User, Todo, Category };
