import Todo from './todo.model';
import User from './user.model';

// 一个用户多个任务
User.hasMany(Todo, { foreignKey: 'userId' });
Todo.belongsTo(User, { foreignKey: 'userId' });

export { User, Todo };
