import api from './api';
import {
  AIParseRequest,
  AIParseResponse,
  AIRecommendation,
  CategoryClassification,
  TimeEstimation,
  Todo
} from '../types';

export const aiService = {
  // Parse natural language input into structured todo
  async parseNaturalLanguage(text: string): Promise<AIParseResponse> {
    const request: AIParseRequest = { text };
    const response = await api.post('/api/ai/parse', request);
    return response.data;
  },

  // Get priority recommendation for a todo
  async recommendPriority(todo: Partial<Todo>): Promise<{ success: boolean; recommendation: AIRecommendation }> {
    const request = {
      todo: {
        title: todo.title || '',
        description: todo.description,
        category: todo.category,
        priority: todo.priority,
        estimated_time: todo.estimated_time
      }
    };
    const response = await api.post('/api/ai/recommend-priority', request);
    return response.data;
  },

  // Get category classification for a todo
  async categorizeTodo(todo: Partial<Todo>): Promise<{ success: boolean; classification: CategoryClassification }> {
    const request = {
      todo: {
        title: todo.title || '',
        description: todo.description,
        category: todo.category,
        priority: todo.priority,
        estimated_time: todo.estimated_time
      }
    };
    const response = await api.post('/api/ai/categorize', request);
    return response.data;
  },

  // Get time estimation for a todo
  async estimateTime(todo: Partial<Todo>): Promise<{ success: boolean; estimation: TimeEstimation }> {
    const request = {
      todo: {
        title: todo.title || '',
        description: todo.description,
        category: todo.category,
        priority: todo.priority,
        estimated_time: todo.estimated_time
      }
    };
    const response = await api.post('/api/ai/estimate-time', request);
    return response.data;
  },

  // Analyze a batch of todos
  async analyzeBatch(todos: Todo[]): Promise<{ success: boolean; analysis: string; todo_count: number }> {
    const request = { todos };
    const response = await api.post('/api/ai/analyze-batch', request);
    return response.data;
  },

  // Get AI service capabilities
  async getCapabilities(): Promise<{
    capabilities: Record<string, string>;
    categories: string[];
    priority_levels: Record<string, string>;
    workflow: string;
  }> {
    const response = await api.get('/api/ai/capabilities');
    return response.data;
  },

  // Health check for AI service
  async healthCheck(): Promise<{
    status: string;
    service: string;
    timestamp: string;
    openai_configured: boolean;
  }> {
    const response = await api.get('/api/ai/health');
    return response.data;
  }
};