// TODO 애플리케이션을 위한 타입 정의

export type TodoStatus = 'TODO' | 'DOING' | 'DONE';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: number; // 1-5
  category?: string;
  estimated_time?: number; // in minutes
  ai_metadata?: {
    priority_confidence?: number;
    category_confidence?: number;
    time_confidence?: number;
    processed?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: number;
  category?: string;
  estimated_time?: number;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  priority?: number;
  category?: string;
  estimated_time?: number;
}

export interface TodoListResponse {
  total: number;
  items: Todo[];
  page: number;
  page_size: number;
}

export interface AIParseRequest {
  text: string;
}

export interface AIParseResponse {
  success: boolean;
  todo: {
    title: string;
    description?: string;
    priority: number;
    category: string;
    estimated_time: number;
    ai_metadata?: any;
  };
  errors: string[];
}

export interface AIRecommendation {
  recommended_priority: number;
  reasoning: string;
  confidence: number;
}

export interface CategoryClassification {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface TimeEstimation {
  estimated_minutes: number;
  confidence: number;
  suggestion: string;
}

export interface TodoStats {
  total: number;
  by_status: {
    TODO: number;
    DOING: number;
    DONE: number;
  };
  completion_rate: number;
}

export const TODO_CATEGORIES = [
  'Work',
  'Personal',
  'Learning',
  'Health',
  'Finance',
  'Other'
] as const;

export const PRIORITY_LEVELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Critical'
} as const;