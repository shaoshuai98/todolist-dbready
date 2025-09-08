'use client';

import React from 'react';
import { Calendar, Clock, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TodoWithTags } from '@/lib/types/todo';
import { TodoPriority, TodoStatus } from '@/lib/db/schema';

interface TodoItemProps {
  todo: TodoWithTags;
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: any) => void;
}

const priorityColors = {
  [TodoPriority.LOW]: 'bg-green-100 text-green-800',
  [TodoPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TodoPriority.HIGH]: 'bg-red-100 text-red-800',
};

const statusColors = {
  [TodoStatus.TODO]: 'bg-gray-100 text-gray-800',
  [TodoStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TodoStatus.COMPLETED]: 'bg-green-100 text-green-800',
};

export default function TodoItem({ todo, onEdit, onDelete, onUpdate }: TodoItemProps) {
  const handleToggleComplete = () => {
    const newStatus = todo.status === TodoStatus.COMPLETED ? TodoStatus.TODO : TodoStatus.COMPLETED;
    onUpdate(todo.id, { status: newStatus });
  };

  const handleStatusChange = (status: TodoStatus) => {
    onUpdate(todo.id, { status });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = todo.deadline && new Date(todo.deadline) < new Date() && todo.status !== TodoStatus.COMPLETED;

  return (
    <Card className={`p-4 ${todo.status === TodoStatus.COMPLETED ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleComplete}
          className="p-0 h-6 w-6 mt-1"
        >
          {todo.status === TodoStatus.COMPLETED ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" />
          )}
        </Button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-500' : 'text-foreground'
              }`}>
                {todo.title}
              </h3>
              
              {todo.description && (
                <p className={`text-sm mt-1 ${
                  todo.status === TodoStatus.COMPLETED ? 'text-gray-400' : 'text-muted-foreground'
                }`}>
                  {todo.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(todo)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(todo.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {/* Priority */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              priorityColors[todo.priority as TodoPriority]
            }`}>
              {todo.priority.toUpperCase()}
            </span>

            {/* Status */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[todo.status as TodoStatus]
            }`}>
              {todo.status.replace('_', ' ').toUpperCase()}
            </span>

            {/* Tags */}
            {todo.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}

            {/* Deadline */}
            {todo.deadline && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                <Calendar className="h-3 w-3" />
                <span>{formatDate(todo.deadline)}</span>
                {isOverdue && <span className="font-medium">(Overdue)</span>}
              </div>
            )}

            {/* Created At */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Created {formatDate(todo.createdAt)}</span>
            </div>
          </div>

          {/* Status Quick Actions */}
          {todo.status !== TodoStatus.COMPLETED && (
            <div className="flex gap-2 mt-3">
              {todo.status !== TodoStatus.IN_PROGRESS && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(TodoStatus.IN_PROGRESS)}
                  className="text-xs"
                >
                  Start Working
                </Button>
              )}
              {todo.status === TodoStatus.IN_PROGRESS && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(TodoStatus.TODO)}
                  className="text-xs"
                >
                  Move to Todo
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
