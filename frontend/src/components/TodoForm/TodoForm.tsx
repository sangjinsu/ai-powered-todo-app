import React, { useState } from 'react';
import { CreateTodoRequest, TODO_CATEGORIES, PRIORITY_LEVELS } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Plus, AlertCircle, Calendar } from 'lucide-react';

interface TodoFormProps {
  onSubmit: (todo: CreateTodoRequest) => Promise<void>;
}

const TodoForm: React.FC<TodoFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState<CreateTodoRequest>({
    title: '',
    description: '',
    priority: 3,
    category: '',
    estimated_time: undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        category: form.category || undefined
      });
      
      // 폼 리셋
      setForm({
        title: '',
        description: '',
        priority: 3,
        category: '',
        estimated_time: undefined
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create todo');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTodoRequest, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
          <Calendar className="w-6 h-6" />
          새 할 일 만들기
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              제목 *
            </label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="무엇을 해야 하나요?"
              required
              maxLength={255}
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              설명
            </label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="추가 세부사항 (선택사항)"
              rows={3}
              maxLength={1000}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                우선순위
              </label>
              <Select value={form.priority?.toString() || '3'} onValueChange={(value) => handleInputChange('priority', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LEVELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {value} - {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                카테고리
              </label>
              <Select value={form.category || 'none'} onValueChange={(value) => handleInputChange('category', value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">카테고리 없음</SelectItem>
                  {TODO_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="estimated_time" className="text-sm font-medium text-slate-700">
                예상 시간 (분)
              </label>
              <Input
                type="number"
                id="estimated_time"
                value={form.estimated_time || ''}
                onChange={(e) => handleInputChange('estimated_time', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="30"
                min="1"
                max="9999"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !form.title.trim()} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                할 일 만들기
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TodoForm;