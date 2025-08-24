import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { Todo, AIParseResponse, AIRecommendation, CategoryClassification, TimeEstimation } from '../types';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<AIParseResponse | null>(null);

  // Parse natural language input
  const parseNaturalLanguage = useCallback(async (text: string): Promise<AIParseResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await aiService.parseNaturalLanguage(text);
      setParseResult(result);
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to parse text';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get priority recommendation
  const recommendPriority = useCallback(async (todo: Partial<Todo>): Promise<AIRecommendation> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.recommendPriority(todo);
      
      if (!response.success) {
        throw new Error('Priority recommendation failed');
      }
      
      return response.recommendation;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to get priority recommendation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get category classification
  const categorizeTodo = useCallback(async (todo: Partial<Todo>): Promise<CategoryClassification> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.categorizeTodo(todo);
      
      if (!response.success) {
        throw new Error('Category classification failed');
      }
      
      return response.classification;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to categorize todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get time estimation
  const estimateTime = useCallback(async (todo: Partial<Todo>): Promise<TimeEstimation> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.estimateTime(todo);
      
      if (!response.success) {
        throw new Error('Time estimation failed');
      }
      
      return response.estimation;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to estimate time';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze batch of todos
  const analyzeBatch = useCallback(async (todos: Todo[]): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.analyzeBatch(todos);
      
      if (!response.success) {
        throw new Error('Batch analysis failed');
      }
      
      return response.analysis;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to analyze todos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all AI recommendations for a todo
  const getAIRecommendations = useCallback(async (todo: Partial<Todo>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Run all AI analyses in parallel
      const [priorityResult, categoryResult, timeResult] = await Promise.allSettled([
        aiService.recommendPriority(todo),
        aiService.categorizeTodo(todo),
        aiService.estimateTime(todo)
      ]);
      
      return {
        priority: priorityResult.status === 'fulfilled' ? priorityResult.value.recommendation : null,
        category: categoryResult.status === 'fulfilled' ? categoryResult.value.classification : null,
        time: timeResult.status === 'fulfilled' ? timeResult.value.estimation : null,
        errors: [
          ...(priorityResult.status === 'rejected' ? [`Priority: ${priorityResult.reason}`] : []),
          ...(categoryResult.status === 'rejected' ? [`Category: ${categoryResult.reason}`] : []),
          ...(timeResult.status === 'rejected' ? [`Time: ${timeResult.reason}`] : [])
        ]
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to get AI recommendations';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear parse result
  const clearParseResult = useCallback(() => {
    setParseResult(null);
  }, []);

  return {
    loading,
    error,
    parseResult,
    parseNaturalLanguage,
    recommendPriority,
    categorizeTodo,
    estimateTime,
    analyzeBatch,
    getAIRecommendations,
    clearError,
    clearParseResult
  };
};