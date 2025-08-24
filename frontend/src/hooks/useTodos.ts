import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Todo, TodoListResponse, CreateTodoRequest, UpdateTodoRequest, TodoStats, TodoStatus } from '../types';
import { todoService } from '../services/todoService';

interface UseTodosOptions {
  autoFetch?: boolean;
  page?: number;
  page_size?: number;
  status?: string;
  category?: string;
  priority?: number;
}

export const useTodos = (options: UseTodosOptions = {}) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(options.page || 1);
  const [stats, setStats] = useState<TodoStats | null>(null);

  // Use refs for stable references to avoid useCallback dependencies
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Memoize stable default options
  const stableDefaults = useMemo(() => ({
    page_size: 20,
    sort_by: 'created_at',
    order: 'desc' as const
  }), []);

  // Fetch todos
  const fetchTodos = useCallback(async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    category?: string;
    priority?: number;
    sort_by?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: TodoListResponse = await todoService.getTodos({
        page: params?.page || page,
        page_size: params?.page_size || optionsRef.current.page_size || stableDefaults.page_size,
        status: params?.status || optionsRef.current.status,
        category: params?.category || optionsRef.current.category,
        priority: params?.priority || optionsRef.current.priority,
        sort_by: params?.sort_by || stableDefaults.sort_by,
        order: params?.order || stableDefaults.order
      });

      setTodos(response.items);
      setTotal(response.total);
      setPage(response.page);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch todos');
      console.error('할 일 목록 가져오기 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [page, stableDefaults]);

  // Fetch todo stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await todoService.getTodoStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('통계 데이터 가져오기 오류:', err);
    }
  }, []);

  // Create todo with optimistic updates
  const createTodo = useCallback(async (todoData: CreateTodoRequest): Promise<Todo> => {
    try {
      setError(null);
      const newTodo = await todoService.createTodo(todoData);
      
      // Optimistically update local state instead of refetching
      setTodos(prevTodos => [newTodo, ...prevTodos]);
      setTotal(prevTotal => prevTotal + 1);
      
      // Update stats asynchronously
      fetchStats();
      
      return newTodo;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  // Update todo (stats only change if status changes)
  const updateTodo = useCallback(async (id: string, todoData: UpdateTodoRequest): Promise<Todo> => {
    try {
      setError(null);
      const originalTodo = todos.find(todo => todo.id === id);
      const updatedTodo = await todoService.updateTodo(id, todoData);
      
      // Update local state
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === id ? updatedTodo : todo)
      );
      
      // Only update stats if status changed
      if (originalTodo && originalTodo.status !== updatedTodo.status) {
        fetchStats();
      }
      
      return updatedTodo;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [todos, fetchStats]);

  // Update todo status with optimistic updates
  const updateTodoStatus = useCallback(async (id: string, status: TodoStatus): Promise<Todo> => {
    try {
      setError(null);
      
      // Optimistic update for immediate UI feedback
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id ? { ...todo, status } : todo
        )
      );
      
      const updatedTodo = await todoService.updateTodoStatus(id, status);
      
      // Update with server response
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === id ? updatedTodo : todo)
      );
      
      // Update stats since status changed
      fetchStats();
      return updatedTodo;
    } catch (err: any) {
      // Revert optimistic update on error
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update todo status';
      setError(errorMessage);
      // Refresh to get correct state
      fetchTodos();
      throw new Error(errorMessage);
    }
  }, [fetchStats, fetchTodos]);

  // Delete todo with optimistic updates
  const deleteTodo = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Optimistic update for immediate UI feedback
      const todoToDelete = todos.find(todo => todo.id === id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      setTotal(prevTotal => prevTotal - 1);
      
      await todoService.deleteTodo(id);
      
      // Update stats only if a todo was actually found and deleted
      if (todoToDelete) {
        fetchStats();
      }
    } catch (err: any) {
      // Revert optimistic update on error
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete todo';
      setError(errorMessage);
      // Refresh to get correct state
      fetchTodos();
      throw new Error(errorMessage);
    }
  }, [todos, fetchStats, fetchTodos]);

  // Initial fetch - use ref to avoid dependency issues
  const initialFetchRef = useRef(false);
  useEffect(() => {
    if (optionsRef.current.autoFetch !== false && !initialFetchRef.current) {
      initialFetchRef.current = true;
      fetchTodos();
      fetchStats();
    }
  }, [fetchTodos, fetchStats]);

  return {
    todos,
    loading,
    error,
    total,
    page,
    stats,
    fetchTodos,
    fetchStats,
    createTodo,
    updateTodo,
    updateTodoStatus,
    deleteTodo,
    setPage
  };
};