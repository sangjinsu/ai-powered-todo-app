import React, { memo, useMemo } from 'react';
import TodoItem from '../TodoItem/TodoItem';
import { Todo, TodoStatus } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TodoListProps {
  todos: Todo[];
  onStatusChange: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  loading?: boolean;
}

// Memoized skeleton component
const LoadingSkeleton = memo(() => {
  const skeletonItems = useMemo(() => Array(3).fill(null), []);
  
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-4">
        {skeletonItems.map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

// Memoized empty state component
const EmptyState = memo(() => (
  <Card className="animate-bounce-in">
    <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-12">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        No todos to display
      </h3>
      <p className="text-muted-foreground">
        Create your first todo to get started!
      </p>
    </CardContent>
  </Card>
));

// Section style mapping - stable reference
const SECTION_STYLES: Record<TodoStatus, string> = {
  TODO: 'border-l-4 border-l-todo-urgent',
  DOING: 'border-l-4 border-l-orange-500', 
  DONE: 'border-l-4 border-l-todo-done'
};

// Section titles - stable reference
const SECTION_TITLES: Record<TodoStatus, string> = {
  TODO: '📋 To Do',
  DOING: '⚡ In Progress',
  DONE: '✅ Completed'
};

// Status order - stable reference
const STATUS_ORDER: TodoStatus[] = ['TODO', 'DOING', 'DONE'];

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onStatusChange,
  onDelete,
  onUpdate,
  loading = false
}) => {
  // Memoize grouped todos to avoid recalculation on every render
  const groupedTodos = useMemo(() => ({
    TODO: todos.filter(todo => todo.status === 'TODO'),
    DOING: todos.filter(todo => todo.status === 'DOING'),
    DONE: todos.filter(todo => todo.status === 'DONE')
  }), [todos]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (todos.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-8">
      {STATUS_ORDER.map(status => {
        const statusTodos = groupedTodos[status];
        if (statusTodos.length === 0) return null;

        return (
          <Card 
            key={status} 
            className={`animate-slide-up glass-effect ${SECTION_STYLES[status]}`}
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3">
                <span>{SECTION_TITLES[status]}</span>
                <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  ({statusTodos.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default memo(TodoList);