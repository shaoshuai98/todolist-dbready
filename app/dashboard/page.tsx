'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TodoWithTags, TodoFilterInput } from '@/lib/types/todo';
import { TodoPriority, TodoStatus } from '@/lib/db/schema';
import TodoItem from '@/components/todos/TodoItem';
import TodoForm from '@/components/todos/TodoForm';
import TodoFilters from '@/components/todos/TodoFilters';
import TodoStats from '@/components/todos/TodoStats';

interface TodoApiResponse {
  success: boolean;
  data: TodoWithTags[];
  stats: Record<string, number>;
  error?: string;
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<TodoWithTags[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoWithTags | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TodoFilterInput>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch todos from API
  const fetchTodos = async (currentFilters?: TodoFilterInput) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      const filterParams = currentFilters || filters;
      if (filterParams.status) params.append('status', filterParams.status);
      if (filterParams.priority) params.append('priority', filterParams.priority);
      if (filterParams.search || searchQuery) params.append('search', filterParams.search || searchQuery);
      if (filterParams.sortBy) params.append('sortBy', filterParams.sortBy);
      if (filterParams.sortOrder) params.append('sortOrder', filterParams.sortOrder);
      if (filterParams.tags?.length) params.append('tags', filterParams.tags.join(','));

      const response = await fetch(`/api/todos?${params.toString()}`);
      const data: TodoApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch todos');
      }

      setTodos(data.data);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  // Create new todo
  const createTodo = async (todoData: any) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create todo');
      }

      await fetchTodos();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  // Update todo
  const updateTodo = async (id: number, todoData: any) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update todo');
      }

      await fetchTodos();
      setEditingTodo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  // Delete todo
  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete todo');
      }

      await fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  // Apply filters
  const applyFilters = (newFilters: TodoFilterInput) => {
    setFilters(newFilters);
    fetchTodos(newFilters);
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const searchFilters = { ...filters, search: query };
    fetchTodos(searchFilters);
  };

  // Initial fetch
  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Organize and manage your daily tasks
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* Stats */}
        <TodoStats stats={stats} />

        {/* Search and Filter Controls */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 border-t pt-4">
              <TodoFilters filters={filters} onApplyFilters={applyFilters} />
            </div>
          )}
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 border-red-200 bg-red-50">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Todo List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No tasks found</p>
              <Button onClick={() => setShowForm(true)}>Create your first task</Button>
            </Card>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onEdit={(todo) => setEditingTodo(todo)}
                onDelete={(id) => deleteTodo(id)}
                onUpdate={(id, data) => updateTodo(id, data)}
              />
            ))
          )}
        </div>
      </div>

      {/* Todo Form Modal */}
      {(showForm || editingTodo) && (
        <TodoForm
          todo={editingTodo}
          onSave={editingTodo ? (data) => updateTodo(editingTodo.id, data) : createTodo}
          onCancel={() => {
            setShowForm(false);
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
}
