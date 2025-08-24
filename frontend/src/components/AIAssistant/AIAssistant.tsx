import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { CreateTodoRequest, PRIORITY_LEVELS } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Brain, RotateCcw, Check, X, Bot, Sparkles, Clock, FolderOpen, Target, AlertCircle, Loader2 } from 'lucide-react';
import { getPriorityColor } from '../../lib/utils';

interface AIAssistantProps {
  onTodoCreate: (todo: CreateTodoRequest) => Promise<void>;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onTodoCreate }) => {
  const [inputText, setInputText] = useState('');
  const [parsedTodo, setParsedTodo] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { 
    loading, 
    error, 
    parseNaturalLanguage, 
    clearError 
  } = useAI();

  const exampleTexts = [
    "Urgently finish the quarterly report by tomorrow",
    "Buy groceries this weekend",
    "Schedule dentist appointment for next week",
    "Review code for the new feature",
    "Plan vacation for summer"
  ];

  const handleParse = async () => {
    if (!inputText.trim()) return;

    try {
      clearError();
      const result = await parseNaturalLanguage(inputText.trim());
      
      if (result.success && result.todo) {
        setParsedTodo(result.todo);
      } else {
        console.error('파싱 실패:', result.errors);
      }
    } catch (err) {
      console.error('파싱 오류:', err);
    }
  };

  const handleCreateTodo = async () => {
    if (!parsedTodo) return;

    setIsCreating(true);
    try {
      await onTodoCreate({
        title: parsedTodo.title,
        description: parsedTodo.description,
        priority: parsedTodo.priority,
        category: parsedTodo.category,
        estimated_time: parsedTodo.estimated_time
      });
      
      // 상태 리셋
      setInputText('');
      setParsedTodo(null);
    } catch (err) {
      console.error('생성 오류:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExampleClick = (text: string) => {
    setInputText(text);
    setParsedTodo(null);
  };

  const handleReset = () => {
    setInputText('');
    setParsedTodo(null);
    clearError();
  };


  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
          <Bot className="w-6 h-6 text-blue-500" />
          AI 어시스턴트
        </CardTitle>
        <p className="text-slate-600 text-base leading-relaxed">
          자연어로 할 일을 설명해주세요. AI가 구조적인 할 일로 만들어 드릴게요!
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Example Texts */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-slate-800">예시를 사용해 보세요:</h4>
          <div className="space-y-2">
            {exampleTexts.map((text, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-3 text-left text-slate-600 italic border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:translate-x-1 transition-all duration-200"
                onClick={() => handleExampleClick(text)}
                disabled={loading}
              >
                "{text}"
              </Button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="예시: '금요일 오후까지 프로젝트 제안서를 긴급히 마무리해야 함'"
              rows={3}
              maxLength={500}
              disabled={loading}
              className="min-h-[100px] resize-none text-base border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            <div className="flex gap-4">
              <Button
                onClick={handleParse}
                disabled={!inputText.trim() || loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    분석하기
                  </>
                )}
              </Button>
              {inputText && (
                <Button 
                  onClick={handleReset} 
                  variant="outline" 
                  disabled={loading}
                  className="px-4 hover:bg-slate-50"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  초기화
                </Button>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            {inputText.length}/500 글자
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start justify-between gap-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <strong>오류:</strong> {error}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError} className="h-6 w-6 p-0 text-red-600 hover:bg-red-100 hover:text-red-700">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Parsed Result */}
        {parsedTodo && (
          <div className="mt-8 space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
              <Target className="w-5 h-5 text-blue-500" />
              AI 분석 결과
            </h3>
            
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 rounded-2xl shadow-xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <h4 className="text-2xl font-semibold flex-1">
                  {parsedTodo.title}
                </h4>
                {parsedTodo.ai_metadata?.processed && (
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                    <Sparkles className="w-3 h-3" />
                    AI 향상됨
                  </span>
                )}
              </div>
            
              {parsedTodo.description && (
                <p className="text-lg opacity-90 leading-relaxed mb-6">
                  {parsedTodo.description}
                </p>
              )}
              
              <div className="space-y-4 mb-8">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <span className="font-semibold min-w-[100px]">우선순위:</span>
                  <span 
                    className="inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm"
                    style={{ backgroundColor: getPriorityColor(parsedTodo.priority) }}
                  >
                    {parsedTodo.priority} - {PRIORITY_LEVELS[parsedTodo.priority as keyof typeof PRIORITY_LEVELS]}
                  </span>
                </div>
                
                {parsedTodo.category && (
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <span className="font-semibold min-w-[100px]">카테고리:</span>
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-sm">
                      <FolderOpen className="w-3 h-3" />
                      {parsedTodo.category}
                    </span>
                  </div>
                )}
                
                {parsedTodo.estimated_time && (
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <span className="font-semibold min-w-[100px]">예상 시간:</span>
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-sm">
                      <Clock className="w-3 h-3" />
                      {parsedTodo.estimated_time}분
                    </span>
                  </div>
                )}
              </div>
            
              {/* AI Confidence Scores */}
              {parsedTodo.ai_metadata && (
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl mb-8">
                  <h5 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI 분석 신뢰도
                  </h5>
                  <div className="space-y-3">
                    {parsedTodo.ai_metadata.priority_confidence !== undefined && (
                      <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
                        <span className="font-medium min-w-[80px]">우선순위:</span>
                        <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              parsedTodo.ai_metadata.priority_confidence >= 0.7 ? 'bg-green-400' :
                              parsedTodo.ai_metadata.priority_confidence >= 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.max(parsedTodo.ai_metadata.priority_confidence * 100, 5)}%` }}
                          />
                        </div>
                        <span className={`font-semibold min-w-[50px] text-right ${
                          parsedTodo.ai_metadata.priority_confidence >= 0.7 ? 'text-green-200' :
                          parsedTodo.ai_metadata.priority_confidence >= 0.5 ? 'text-yellow-200' : 'text-red-200'
                        }`}>
                          {Math.round(parsedTodo.ai_metadata.priority_confidence * 100)}%
                        </span>
                      </div>
                    )}
                    {parsedTodo.ai_metadata.category_confidence !== undefined && (
                      <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
                        <span className="font-medium min-w-[80px]">카테고리:</span>
                        <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              parsedTodo.ai_metadata.category_confidence >= 0.7 ? 'bg-green-400' :
                              parsedTodo.ai_metadata.category_confidence >= 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.max(parsedTodo.ai_metadata.category_confidence * 100, 5)}%` }}
                          />
                        </div>
                        <span className={`font-semibold min-w-[50px] text-right ${
                          parsedTodo.ai_metadata.category_confidence >= 0.7 ? 'text-green-200' :
                          parsedTodo.ai_metadata.category_confidence >= 0.5 ? 'text-yellow-200' : 'text-red-200'
                        }`}>
                          {Math.round(parsedTodo.ai_metadata.category_confidence * 100)}%
                        </span>
                      </div>
                    )}
                    {parsedTodo.ai_metadata.time_confidence !== undefined && (
                      <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
                        <span className="font-medium min-w-[80px]">시간 예측:</span>
                        <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              parsedTodo.ai_metadata.time_confidence >= 0.7 ? 'bg-green-400' :
                              parsedTodo.ai_metadata.time_confidence >= 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.max(parsedTodo.ai_metadata.time_confidence * 100, 5)}%` }}
                          />
                        </div>
                        <span className={`font-semibold min-w-[50px] text-right ${
                          parsedTodo.ai_metadata.time_confidence >= 0.7 ? 'text-green-200' :
                          parsedTodo.ai_metadata.time_confidence >= 0.5 ? 'text-yellow-200' : 'text-red-200'
                        }`}>
                          {Math.round(parsedTodo.ai_metadata.time_confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Low confidence warning */}
                  {parsedTodo.ai_metadata && (
                    parsedTodo.ai_metadata.priority_confidence < 0.5 || 
                    parsedTodo.ai_metadata.category_confidence < 0.5 || 
                    parsedTodo.ai_metadata.time_confidence < 0.5
                  ) && (
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-300 mt-0.5" />
                        <div className="text-sm text-yellow-100">
                          <strong>참고:</strong> 일부 분석 결과의 신뢰도가 낮습니다. 결과를 검토하고 필요시 수정해 주세요.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  onClick={handleCreateTodo}
                  disabled={isCreating}
                  className="flex-1 bg-white/90 hover:bg-white text-slate-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed justify-center"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      이 할 일 만들기
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleReset} 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                  size="lg"
                >
                  <X className="w-5 h-5 mr-2" />
                  취소
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;