import { Express } from 'express';
import userRoutes from './user.route';
import todoRoutes from './todo.route';
import categoryRoutes from './category.route';

export default function registerRoutes(app: Express) {
  app.use('/api', userRoutes);
  app.use('/api', todoRoutes);
  app.use('/api', categoryRoutes);
}
