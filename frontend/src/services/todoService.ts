import api from './api';
import { Todo, TodoListResponse, CreateTodoRequest, UpdateTodoRequest, TodoStats, TodoStatus } from '../types';
import { withPerformanceTracking } from '../lib/performance';

export const todoService = {
  // Get todos with filtering and pagination
  getTodos: withPerformanceTracking(async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    category?: string;
    priority?: number;
    sort_by?: string;
    order?: 'asc' | 'desc';
  }): Promise<TodoListResponse> => {
    const response = await api.get('/api/todos', { params });
    return response.data;
  }, 'getTodos'),

  // Get a single todo by ID
  getTodo: withPerformanceTracking(async (id: string): Promise<Todo> => {
    const response = await api.get(`/api/todos/${id}`);
    return response.data;
  }, 'getTodo'),

  // Create a new todo
  createTodo: withPerformanceTracking(async (todo: CreateTodoRequest): Promise<Todo> => {
    const response = await api.post('/api/todos', todo);
    return response.data;
  }, 'createTodo'),

  // Update a todo
  updateTodo: withPerformanceTracking(async (id: string, todo: UpdateTodoRequest): Promise<Todo> => {
    const response = await api.put(`/api/todos/${id}`, todo);
    return response.data;
  }, 'updateTodo'),

  // Update todo status
  updateTodoStatus: withPerformanceTracking(async (id: string, status: TodoStatus): Promise<Todo> => {
    const response = await api.patch(`/api/todos/${id}/status`, { status });
    return response.data;
  }, 'updateTodoStatus'),

  // Delete a todo
  deleteTodo: withPerformanceTracking(async (id: string): Promise<void> => {
    await api.delete(`/api/todos/${id}`);
  }, 'deleteTodo'),

  // Get todo statistics
  getTodoStats: withPerformanceTracking(async (): Promise<TodoStats> => {
    const response = await api.get('/api/todos/stats/summary');
    return response.data;
  }, 'getTodoStats'),

  // Health check for todo service
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    const response = await api.get('/api/todos/health');
    return response.data;
  }
};