import { NextRequest, NextResponse } from 'next/server';
import { getTodos, createTodo, getTodoStats } from '@/lib/db/queries';
import { createTodoSchema, todoFilterSchema } from '@/lib/types/todo';
import { z } from 'zod';

// GET /api/todos - Get all todos with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filter parameters
    const filters = {
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
    };

    // Validate filters
    const validatedFilters = todoFilterSchema.parse(filters);
    
    const todos = await getTodos(validatedFilters);
    const stats = await getTodoStats();
    
    return NextResponse.json({
      success: true,
      data: todos,
      stats,
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch todos',
      },
      { status: error instanceof Error && error.message === 'User not authenticated' ? 401 : 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createTodoSchema.parse(body);
    
    const todo = await createTodo(validatedData);
    
    return NextResponse.json({
      success: true,
      data: todo,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create todo',
      },
      { status: error instanceof Error && error.message === 'User not authenticated' ? 401 : 500 }
    );
  }
}
