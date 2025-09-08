'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TodoFilterInput } from '@/lib/types/todo';
import { TodoPriority, TodoStatus } from '@/lib/db/schema';

interface TodoFiltersProps {
  filters: TodoFilterInput;
  onApplyFilters: (filters: TodoFilterInput) => void;
}

export default function TodoFilters({ filters, onApplyFilters }: TodoFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TodoFilterInput>(filters);

  const handleFilterChange = (key: keyof TodoFilterInput, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onApplyFilters(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters: TodoFilterInput = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value={TodoStatus.TODO}>To Do</option>
            <option value={TodoStatus.IN_PROGRESS}>In Progress</option>
            <option value={TodoStatus.COMPLETED}>Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <Label className="text-sm font-medium">Priority</Label>
          <select
            value={localFilters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Priorities</option>
            <option value={TodoPriority.HIGH}>High</option>
            <option value={TodoPriority.MEDIUM}>Medium</option>
            <option value={TodoPriority.LOW}>Low</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <Label className="text-sm font-medium">Sort By</Label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sort Order */}
        <div>
          <Label className="text-sm font-medium">Sort Order</Label>
          <select
            value={localFilters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button onClick={applyFilters} size="sm">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline" size="sm">
          Clear All
        </Button>
      </div>
    </div>
  );
}
