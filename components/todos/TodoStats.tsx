'use client';

import React from 'react';
import { CheckCircle, Clock, Circle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TodoStatsProps {
  stats: Record<string, number>;
}

export default function TodoStats({ stats }: TodoStatsProps) {
  const todoCount = stats.todo || 0;
  const inProgressCount = stats.in_progress || 0;
  const completedCount = stats.completed || 0;
  const totalCount = todoCount + inProgressCount + completedCount;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const statItems = [
    {
      label: 'To Do',
      value: todoCount,
      icon: Circle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total',
      value: totalCount,
      icon: AlertCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${item.bgColor}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {item.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
      
      {/* Completion Rate */}
      {totalCount > 0 && (
        <Card className="p-4 md:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-foreground">
                {completionRate}%
              </p>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
