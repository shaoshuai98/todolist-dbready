import { z } from 'zod';
import { TodoPriority, TodoStatus } from '../db/schema';

// Todo validation schemas
export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  priority: z.enum([TodoPriority.LOW, TodoPriority.MEDIUM, TodoPriority.HIGH]).default(TodoPriority.MEDIUM),
  status: z.enum([TodoStatus.TODO, TodoStatus.IN_PROGRESS, TodoStatus.COMPLETED]).default(TodoStatus.TODO),
  tags: z.array(z.string()).optional().default([]),
  deadline: z.string().datetime().optional(),
});

export const updateTodoSchema = createTodoSchema.partial().extend({
  id: z.number(),
});

export const todoFilterSchema = z.object({
  status: z.enum([TodoStatus.TODO, TodoStatus.IN_PROGRESS, TodoStatus.COMPLETED]).optional(),
  priority: z.enum([TodoPriority.LOW, TodoPriority.MEDIUM, TodoPriority.HIGH]).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'deadline', 'priority', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoFilterInput = z.infer<typeof todoFilterSchema>;

// Todo with parsed tags
export interface TodoWithTags {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  priority: TodoPriority;
  status: TodoStatus;
  tags: string[];
  deadline: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
