import React, { useState, useEffect, useCallback, memo, lazy, Suspense } from 'react';
import TodoList from './components/TodoList/TodoList';
import TodoForm from './components/TodoForm/TodoForm';
import { useTodos } from './hooks/useTodos';
import { useDebounce } from './hooks/useDebounce';
import { TodoStatus } from './types';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Bot, FileText, RotateCcw, AlertCircle, Loader2, Filter } from 'lucide-react';

// Lazy load AI Assistant to reduce initial bundle size
const AIAssistant = lazy(() => import('./components/AIAssistant/AIAssistant'));

// Loading fallback for AI Assistant
const AIAssistantFallback = () => (
  <Card className="animate-pulse">
    <CardContent className="flex items-center justify-center p-8">
      <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
      <span className="text-muted-foreground">AI 어시스턴트 로딩 중...</span>
    </CardContent>
  </Card>
);

// Memoized stats cards to prevent unnecessary re-renders
const StatsCard = memo(({ 
  title, 
  value, 
  className 
}: { 
  title: string; 
  value: number | string; 
  className?: string;
}) => (
  <Card className={`animate-fade-in ${className || ''}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
));

function App() {
  const [filter, setFilter] = useState({
    status: '' as TodoStatus | '',
    category: '',
    priority: undefined as number | undefined,
  });
  const [showAI, setShowAI] = useState(false);

  // Debounce filter changes to prevent excessive API calls
  const debouncedFilter = useDebounce(filter, 300);

  const {
    todos,
    loading,
    error,
    total,
    stats,
    fetchTodos,
    createTodo,
    updateTodo,
    updateTodoStatus,
    deleteTodo
  } = useTodos({ autoFetch: true });

  // Apply filters when debounced filter changes
  useEffect(() => {
    fetchTodos({
      status: debouncedFilter.status || undefined,
      category: debouncedFilter.category || undefined,
      priority: debouncedFilter.priority,
      sort_by: 'created_at',
      order: 'desc'
    });
  }, [debouncedFilter, fetchTodos]);

  // Memoized callback functions to prevent child component re-renders
  const handleFilterChange = useCallback((newFilter: Partial<typeof filter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const handleCreateTodo = useCallback(async (todoData: any) => {
    try {
      await createTodo(todoData);
    } catch (error) {
      console.error('할 일 생성 실패:', error);
    }
  }, [createTodo]);

  const handleStatusChange = useCallback(async (id: string, status: TodoStatus) => {
    try {
      await updateTodoStatus(id, status);
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
    }
  }, [updateTodoStatus]);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
      try {
        await deleteTodo(id);
      } catch (error) {
        console.error('할 일 삭제 실패:', error);
      }
    }
  }, [deleteTodo]);

  const handleUpdate = useCallback(async (id: string, updates: any) => {
    try {
      await updateTodo(id, updates);
    } catch (error) {
      console.error('할 일 업데이트 실패:', error);
    }
  }, [updateTodo]);

  // Memoized filter reset function
  const handleResetFilters = useCallback(() => {
    setFilter({ status: '', category: '', priority: undefined });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-surface via-background to-brand-surface/50">
      {/* Header with brand colors */}
      <header className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex justify-between items-center shadow-lg border-b border-brand-accent/20">
        <h1 className="text-3xl font-bold text-brand-primary-foreground flex items-center gap-3">
          🤖 AI 기반 할 일 관리 앱
        </h1>
        <div className="flex items-center gap-4">
          <Button
            variant={showAI ? "default" : "secondary"}
            size="lg"
            onClick={() => setShowAI(!showAI)}
            className={`font-semibold transition-all duration-300 ${
              showAI 
                ? 'btn-brand-accent hover:shadow-lg' 
                : 'btn-brand-secondary hover:shadow-lg hover:scale-105'
            }`}
          >
            {showAI ? (
              <>
                <FileText className="w-5 h-5 mr-2" />
                간단 모드
              </>
            ) : (
              <>
                <Bot className="w-5 h-5 mr-2" />
                AI 어시스턴트
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Stats Dashboard */}
      {stats && (
        <div className="p-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatsCard 
              title="전체 작업" 
              value={stats.total} 
            />
            
            <StatsCard 
              title="할 일" 
              value={stats.by_status.TODO}
              className="border-l-4 border-l-brand-primary shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/20 transition-all" 
            />
            
            <StatsCard 
              title="진행중" 
              value={stats.by_status.DOING}
              className="border-l-4 border-l-brand-secondary shadow-lg shadow-brand-secondary/10 hover:shadow-brand-secondary/20 transition-all" 
            />
            
            <StatsCard 
              title="완료" 
              value={stats.by_status.DONE}
              className="border-l-4 border-l-brand-accent shadow-lg shadow-brand-accent/10 hover:shadow-brand-accent/20 transition-all" 
            />
            
            <StatsCard 
              title="완료율" 
              value={`${stats.completion_rate}%`}
              className="border-l-4 border-l-semantic-success shadow-lg shadow-semantic-success/10 hover:shadow-semantic-success/20 transition-all" 
            />
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 p-6 pt-2">
        {/* Sidebar - Filters with brand styling */}
        <div className="lg:w-80 space-y-4">
          <Card className="animate-slide-up bg-brand-surface/30 border-brand-accent/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-primary">
                <Filter className="w-5 h-5 text-brand-secondary" />
                필터
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-primary">상태:</label>
                <Select
                  value={filter.status || 'all'}
                  onValueChange={(value) => handleFilterChange({ status: value === 'all' ? '' : value as TodoStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="TODO">할 일</SelectItem>
                    <SelectItem value="DOING">진행중</SelectItem>
                    <SelectItem value="DONE">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-primary">카테고리:</label>
                <Select
                  value={filter.category || 'all'}
                  onValueChange={(value) => handleFilterChange({ category: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="모든 카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 카테고리</SelectItem>
                    <SelectItem value="Work">업무</SelectItem>
                    <SelectItem value="Personal">개인</SelectItem>
                    <SelectItem value="Learning">학습</SelectItem>
                    <SelectItem value="Health">건강</SelectItem>
                    <SelectItem value="Finance">재정</SelectItem>
                    <SelectItem value="Other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-primary">우선순위:</label>
                <Select
                  value={filter.priority?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange({ 
                    priority: value === 'all' ? undefined : parseInt(value) 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="모든 우선순위" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 우선순위</SelectItem>
                    <SelectItem value="5">🔴 긴급 (5)</SelectItem>
                    <SelectItem value="4">🟠 높음 (4)</SelectItem>
                    <SelectItem value="3">🟡 보통 (3)</SelectItem>
                    <SelectItem value="2">🔵 낮음 (2)</SelectItem>
                    <SelectItem value="1">🟢 매우 낮음 (1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                필터 초기화
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Todo Form Section */}
          <div className="animate-slide-up">
            {showAI ? (
              <Suspense fallback={<AIAssistantFallback />}>
                <AIAssistant onTodoCreate={handleCreateTodo} />
              </Suspense>
            ) : (
              <TodoForm onSubmit={handleCreateTodo} />
            )}
          </div>

          {/* Error Display with brand styling */}
          {error && (
            <Card className="animate-bounce-in border-semantic-error/20 bg-semantic-error/5 backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="w-5 h-5 text-semantic-error" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-semantic-error">
                    오류: {error}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="border-semantic-error/30 text-semantic-error hover:bg-semantic-error/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="animate-fade-in bg-brand-surface/30 border-brand-accent/20 backdrop-blur-sm">
              <CardContent className="flex items-center justify-center gap-3 p-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                <span className="text-brand-surface-foreground">할 일 목록 로딩 중...</span>
              </CardContent>
            </Card>
          )}

          {/* Todo List */}
          <div className="animate-slide-up">
            <TodoList
              todos={todos}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              loading={loading}
            />
          </div>

          {/* Empty State */}
          {!loading && todos.length === 0 && (
            <Card className="animate-bounce-in bg-brand-surface/30 border-brand-accent/20 backdrop-blur-sm">
              <CardContent className="text-center p-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-brand-primary mb-2">
                  할 일이 없습니다
                </h3>
                <p className="text-brand-surface-foreground">
                  {filter.status || filter.category || filter.priority
                    ? '필터를 조정하거나 새로운 할 일을 만들어보세요.'
                    : '첫 번째 할 일을 만들어 시작해보세요!'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results Info */}
          {!loading && todos.length > 0 && (
            <Card className="animate-fade-in bg-brand-surface/20 border-brand-accent/15">
              <CardContent className="p-4">
                <p className="text-sm text-brand-surface-foreground text-center">
                  총 {total}개 중 {todos.length}개 표시
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;