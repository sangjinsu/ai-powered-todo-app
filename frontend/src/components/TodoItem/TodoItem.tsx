import React, { useState } from 'react';
import { Todo, TodoStatus, PRIORITY_LEVELS } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Edit, Save, X, Trash2, Clock, FolderOpen, Bot, Zap } from 'lucide-react';
import { getPriorityColor, formatRelativeTime } from '../../lib/utils';

interface TodoItemProps {
  todo: Todo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onStatusChange,
  onDelete,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority
  });

  const handleStatusChange = (newStatus: TodoStatus) => {
    onStatusChange(todo.id, newStatus);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(todo.id, {
      title: editForm.title,
      description: editForm.description || null,
      priority: editForm.priority
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority
    });
    setIsEditing(false);
  };


  const getStatusIcon = (status: TodoStatus) => {
    switch (status) {
      case 'TODO': return '⭕';
      case 'DOING': return '🔄';
      case 'DONE': return '✅';
    }
  };

  const getStatusColor = (status: TodoStatus) => {
    switch (status) {
      case 'TODO': return 'status-todo';
      case 'DOING': return 'status-doing';
      case 'DONE': return 'status-done';
      default: return 'border-l-border';
    }
  };

  const getPriorityCardClass = (priority: number, status: TodoStatus) => {
    if (status === 'DONE') return 'todo-card-done';
    
    switch (priority) {
      case 5: return 'todo-card-urgent';
      case 4: return 'todo-card-high';
      case 3: return 'todo-card-medium';
      case 2: return 'todo-card-low';
      case 1: return 'todo-card-done'; // Lowest priority uses success green
      default: return 'todo-card-medium';
    }
  };

  return (
    <Card className={getPriorityCardClass(todo.priority, todo.status)}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={todo.status === 'TODO' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('TODO')}
              className={`min-w-[40px] h-10 text-lg ${todo.status === 'TODO' ? 'btn-brand-primary scale-110' : 'hover:bg-brand-surface'}`}
              title="할 일로 표시"
            >
              ⭕
            </Button>
            <Button
              variant={todo.status === 'DOING' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('DOING')}
              className={`min-w-[40px] h-10 text-lg ${todo.status === 'DOING' ? 'btn-brand-secondary scale-110' : 'hover:bg-brand-surface'}`}
              title="진행 중으로 표시"
            >
              🔄
            </Button>
            <Button
              variant={todo.status === 'DONE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('DONE')}
              className={`min-w-[40px] h-10 text-lg ${todo.status === 'DONE' ? 'btn-brand-accent scale-110' : 'hover:bg-brand-surface'}`}
              title="완료로 표시"
            >
              ✅
            </Button>
          </div>
          
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleEdit} title="수정" className="hover:bg-brand-surface hover:text-brand-primary">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDelete(todo.id)}
                  title="삭제"
                  className="hover:bg-semantic-error/10 hover:text-semantic-error"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleSave} title="저장" className="hover:bg-semantic-success/10 hover:text-semantic-success">
                  <Save className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel} title="취소" className="hover:bg-semantic-error/10 hover:text-semantic-error">
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <Input
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="할 일 제목"
              className="font-semibold text-lg"
            />
            <Textarea
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="설명 (선택사항)"
              rows={3}
              className="resize-none"
            />
            <Select value={editForm.priority?.toString() || '3'} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue placeholder="우선순위 선택" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LEVELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    우선순위 {value} - {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <h4 className={`text-xl font-semibold text-foreground flex items-center gap-2 ${todo.status === 'DONE' ? 'line-through opacity-70' : ''}`}>
              <span>{getStatusIcon(todo.status)}</span>
              <span>{todo.title}</span>
            </h4>
            
            {todo.description && (
              <p className="text-muted-foreground leading-relaxed">{todo.description}</p>
            )}
            
            <div className="space-y-3 mt-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: getPriorityColor(todo.priority) }}
                >
                  우선순위 {todo.priority} - {PRIORITY_LEVELS[todo.priority as keyof typeof PRIORITY_LEVELS]}
                </span>
                
                {todo.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-brand-secondary text-brand-secondary-foreground">
                    <FolderOpen className="w-3 h-3" />
                    {todo.category}
                  </span>
                )}
                
                {todo.estimated_time && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-semantic-info text-semantic-info-foreground">
                    <Clock className="w-3 h-3" />
                    {todo.estimated_time}분
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>생성됨: {formatRelativeTime(todo.created_at)}</span>
                {todo.updated_at !== todo.created_at && (
                  <span>업데이트됨: {formatRelativeTime(todo.updated_at)}</span>
                )}
              </div>
              
              {todo.ai_metadata?.processed && (
                <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-border">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ai-gradient text-white" title="AI로 향상됨">
                    <Bot className="w-3 h-3" />
                    AI 향상됨
                  </span>
                  {todo.ai_metadata.priority_confidence && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-brand-surface text-brand-surface-foreground">
                      <Zap className="w-3 h-3" />
                      우선순위 신뢰도: {Math.round(todo.ai_metadata.priority_confidence * 100)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TodoItem;