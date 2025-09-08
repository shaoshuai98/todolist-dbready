import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      metadata: activityLogs.metadata,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

// Todo queries
import { todos, ActivityType } from './schema';
import { TodoWithTags, TodoFilterInput } from '../types/todo';
import { asc, desc as descOrder, like } from 'drizzle-orm';

export async function getTodos(filters?: TodoFilterInput): Promise<TodoWithTags[]> {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Build base conditions
  const conditions = [eq(todos.userId, user.id), isNull(todos.deletedAt)];

  // Apply filters
  if (filters?.status) {
    conditions.push(eq(todos.status, filters.status));
  }

  if (filters?.priority) {
    conditions.push(eq(todos.priority, filters.priority));
  }

  if (filters?.search) {
    conditions.push(like(todos.title, `%${filters.search}%`));
  }

  // Determine sort order
  const orderColumn = filters?.sortBy || 'createdAt';
  const orderDirection = filters?.sortOrder === 'asc' ? asc : descOrder;
  
  let orderByClause;
  switch (orderColumn) {
    case 'title':
      orderByClause = orderDirection(todos.title);
      break;
    case 'priority':
      orderByClause = orderDirection(todos.priority);
      break;
    case 'deadline':
      orderByClause = orderDirection(todos.deadline);
      break;
    case 'updatedAt':
      orderByClause = orderDirection(todos.updatedAt);
      break;
    default:
      orderByClause = orderDirection(todos.createdAt);
  }

  // Build and execute query in one go
  const todoResults = await db
    .select()
    .from(todos)
    .where(and(...conditions))
    .orderBy(orderByClause);

  // Parse tags from JSON string to array and filter by search if needed
  let results = todoResults.map(todo => ({
    ...todo,
    tags: todo.tags ? JSON.parse(todo.tags) : [],
  })) as TodoWithTags[];

  // Apply client-side tag filtering since SQL JSON handling is complex
  if (filters?.tags && filters.tags.length > 0) {
    results = results.filter(todo => 
      filters.tags!.some(filterTag => 
        todo.tags.includes(filterTag)
      )
    );
  }

  return results;
}

export async function getTodo(id: number): Promise<TodoWithTags | null> {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const todoResults = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.id, id),
        eq(todos.userId, user.id),
        isNull(todos.deletedAt)
      )
    )
    .limit(1);

  if (todoResults.length === 0) {
    return null;
  }

  const todo = todoResults[0];
  return {
    ...todo,
    tags: todo.tags ? JSON.parse(todo.tags) : [],
  } as TodoWithTags;
}

export async function createTodo(data: {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  deadline?: string;
}): Promise<TodoWithTags> {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const newTodo = await db
    .insert(todos)
    .values({
      userId: user.id,
      title: data.title,
      description: data.description || null,
      priority: data.priority || 'medium',
      status: data.status || 'todo',
      tags: data.tags ? JSON.stringify(data.tags) : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      completed: data.status === 'completed',
    })
    .returning();

  // Log activity
  await db.insert(activityLogs).values({
    userId: user.id,
    action: ActivityType.TODO_CREATED,
    metadata: JSON.stringify({ todoId: newTodo[0].id, title: data.title }),
  });

  return {
    ...newTodo[0],
    tags: newTodo[0].tags ? JSON.parse(newTodo[0].tags) : [],
  } as TodoWithTags;
}

export async function updateTodo(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    priority: string;
    status: string;
    tags: string[];
    deadline: string;
  }>
): Promise<TodoWithTags | null> {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) {
    updateData.status = data.status;
    updateData.completed = data.status === 'completed';
  }
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
  if (data.deadline !== undefined) {
    updateData.deadline = data.deadline ? new Date(data.deadline) : null;
  }

  const updatedTodos = await db
    .update(todos)
    .set(updateData)
    .where(
      and(
        eq(todos.id, id),
        eq(todos.userId, user.id),
        isNull(todos.deletedAt)
      )
    )
    .returning();

  if (updatedTodos.length === 0) {
    return null;
  }

  // Log activity
  const activityType = data.status === 'completed' ? ActivityType.TODO_COMPLETED : ActivityType.TODO_UPDATED;
  await db.insert(activityLogs).values({
    userId: user.id,
    action: activityType,
    metadata: JSON.stringify({ todoId: id, changes: data }),
  });

  return {
    ...updatedTodos[0],
    tags: updatedTodos[0].tags ? JSON.parse(updatedTodos[0].tags) : [],
  } as TodoWithTags;
}

export async function deleteTodo(id: number): Promise<boolean> {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const deletedTodos = await db
    .update(todos)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(todos.id, id),
        eq(todos.userId, user.id),
        isNull(todos.deletedAt)
      )
    )
    .returning();

  if (deletedTodos.length === 0) {
    return false;
  }

  // Log activity
  await db.insert(activityLogs).values({
    userId: user.id,
    action: ActivityType.TODO_DELETED,
    metadata: JSON.stringify({ todoId: id, title: deletedTodos[0].title }),
  });

  return true;
}

export async function getTodoStats() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const results = await db
    .select({
      status: todos.status,
    })
    .from(todos)
    .where(and(eq(todos.userId, user.id), isNull(todos.deletedAt)));

  // Manually count the results to avoid SQL function complexity
  const stats = results.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return stats;
}
