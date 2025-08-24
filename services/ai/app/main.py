"""AI 서비스를 위한 메인 FastAPI 애플리케이션"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime
from uuid import uuid4
from collections import defaultdict
import logging
import os
import json
import time
import re
import html

from .langraph_workflow import (
    todo_processing_workflow,
    priority_workflow,
    category_workflow,
    time_workflow
)
from .agents import batch_analyzer

# 상세 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_correlation_id(request: Request) -> str:
    """요청에서 상관성 ID 추출"""
    return getattr(request.state, 'correlation_id', 'unknown')

# 입력 검증 및 보안 함수들
def sanitize_string(text: Optional[str], max_length: int = 1000) -> Optional[str]:
    """문자열 입력 검증 및 정제"""
    if not text:
        return text
    
    # 길이 제한
    text = text[:max_length]
    
    # HTML 이스케이프
    text = html.escape(text)
    
    # 잠재적으로 위험한 패턴 제거
    dangerous_patterns = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe[^>]*>.*?</iframe>',
    ]
    
    for pattern in dangerous_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
    
    return text.strip()

def validate_todo_data(todo_data: Dict[str, Any]) -> Dict[str, Any]:
    """TodoData 검증 및 정제"""
    if "title" in todo_data and todo_data["title"]:
        todo_data["title"] = sanitize_string(todo_data["title"], max_length=255)
        if not todo_data["title"]:
            raise HTTPException(status_code=422, detail="Title cannot be empty")
    
    if "description" in todo_data and todo_data["description"]:
        todo_data["description"] = sanitize_string(todo_data["description"], max_length=2000)
    
    if "category" in todo_data and todo_data["category"]:
        allowed_categories = ["업무", "개인", "학습", "건강", "재정", "기타", "Work", "Personal", "Learning", "Health", "Finance", "Other"]
        if todo_data["category"] not in allowed_categories:
            raise HTTPException(status_code=422, detail=f"Invalid category. Allowed values: {allowed_categories}")
    
    if "priority" in todo_data and todo_data["priority"] is not None:
        if not isinstance(todo_data["priority"], int) or todo_data["priority"] < 1 or todo_data["priority"] > 5:
            raise HTTPException(status_code=422, detail="Priority must be between 1 and 5")
    
    if "estimated_time" in todo_data and todo_data["estimated_time"] is not None:
        if not isinstance(todo_data["estimated_time"], int) or todo_data["estimated_time"] < 0:
            raise HTTPException(status_code=422, detail="Estimated time must be a non-negative integer")
        if todo_data["estimated_time"] > 1440:
            raise HTTPException(status_code=422, detail="Estimated time cannot exceed 1440 minutes (24 hours)")
    
    return todo_data

# 간단한 레이트 리미터 (프로덕션에서는 Redis 기반 사용 권장)
request_counts = defaultdict(list)
RATE_LIMIT_REQUESTS = 60  # 분당 요청 수 (AI 서비스는 더 보수적)
RATE_LIMIT_WINDOW = 60  # 시간 윈도우 (초)

def check_rate_limit(client_ip: str) -> bool:
    """간단한 레이트 리미팅 확인"""
    current_time = time.time()
    # 오래된 요청 기록 정리
    request_counts[client_ip] = [req_time for req_time in request_counts[client_ip] 
                                if current_time - req_time < RATE_LIMIT_WINDOW]
    
    # 현재 요청 카운트 확인
    if len(request_counts[client_ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    # 현재 요청 시간 기록
    request_counts[client_ip].append(current_time)
    return True

# FastAPI 앱 생성
app = FastAPI(
    title="AI Service",
    description="LangGraph를 사용한 지능형 TODO 추천을 위한 AI 마이크로서비스",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 보안 강화된 CORS 설정
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://frontend:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Correlation-ID"],
    expose_headers=["X-Correlation-ID"]
)

# 보안 및 상관성 ID 미들웨어
@app.middleware("http")
async def security_and_correlation_middleware(request: Request, call_next):
    correlation_id = str(uuid4())
    request.state.correlation_id = correlation_id
    start_time = time.time()
    
    # 레이트 리미팅 (헬스 체크는 제외)
    if not request.url.path.endswith("/health"):
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(status_code=429, detail="Too many requests")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    
    # 보안 헤더 추가
    response.headers["X-Correlation-ID"] = correlation_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    # 요청 로깅
    logger.info(
        json.dumps({
            "correlation_id": correlation_id,
            "method": request.method,
            "path": str(request.url.path),
            "client_ip": request.client.host if request.client else "unknown",
            "status_code": response.status_code,
            "process_time": round(process_time, 4)
        })
    )
    
    return response


# 요청/응답 모델
class ParseRequest(BaseModel):
    """자연어 파싱을 위한 요청 모델"""
    text: str = Field(..., min_length=1, max_length=500, description="Natural language input")


class TodoData(BaseModel):
    """AI 처리를 위한 Todo 데이터"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    estimated_time: Optional[int] = None


class PriorityRequest(BaseModel):
    """우선순위 추천을 위한 요청 모델"""
    todo: TodoData


class CategoryRequest(BaseModel):
    """카테고리 분류를 위한 요청 모델"""
    todo: TodoData


class TimeRequest(BaseModel):
    """시간 예측을 위한 요청 모델"""
    todo: TodoData


class BatchAnalysisRequest(BaseModel):
    """배치 분석을 위한 요청 모델"""
    todos: List[Dict[str, Any]]


class HealthResponse(BaseModel):
    """헬스 체크 응답"""
    status: str = "healthy"
    service: str = "ai-service"
    timestamp: datetime
    openai_configured: bool


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """헬스 체크 엔드포인트"""
    openai_key = os.getenv("OPENAI_API_KEY", "")
    return HealthResponse(
        status="healthy",
        service="ai-service",
        timestamp=datetime.now(),
        openai_configured=bool(openai_key and not openai_key.startswith("sk-dummy"))
    )


@app.post("/ai/parse")
async def parse_natural_language(ai_request: Request, request: ParseRequest):
    """자연어 입력을 구조화된 할 일로 파싱"""
    correlation_id = get_correlation_id(ai_request)
    
    try:
        # 입력 검증 및 정제
        sanitized_text = sanitize_string(request.text, max_length=500)
        if not sanitized_text:
            raise HTTPException(status_code=422, detail="Input text cannot be empty")
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "parse_natural_language",
                "input_length": len(sanitized_text),
                "input_preview": sanitized_text[:50] + "..." if len(sanitized_text) > 50 else sanitized_text
            })
        )
        
        # 워크플로우 실행
        initial_state = {
            "input_text": sanitized_text,
            "parsed_todo": {},
            "priority_recommendation": {},
            "category_classification": {},
            "time_estimation": {},
            "final_todo": {},
            "errors": []
        }
        
        result = await todo_processing_workflow.ainvoke(initial_state)
        
        if result.get("errors"):
            logger.warning(
                json.dumps({
                    "correlation_id": correlation_id,
                    "action": "parse_workflow_errors",
                    "errors": result["errors"]
                })
            )
        
        # 결과 검증
        if result.get("final_todo"):
            result["final_todo"] = validate_todo_data(result["final_todo"])
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "parse_natural_language_success",
                "has_result": bool(result.get("final_todo")),
                "error_count": len(result.get("errors", []))
            })
        )
        
        return {
            "success": True,
            "todo": result.get("final_todo", {}),
            "errors": result.get("errors", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "parse_natural_language_error",
                "error": str(e),
                "error_type": type(e).__name__
            })
        )
        raise HTTPException(status_code=500, detail="자연어 파싱 중 오류가 발생했습니다")


@app.post("/ai/recommend-priority")
async def recommend_priority(ai_request: Request, request: PriorityRequest):
    """할 일 항목에 대한 우선순위 추천"""
    correlation_id = get_correlation_id(ai_request)
    
    try:
        # 입력 검증 및 정제
        todo_data = validate_todo_data(request.todo.dict())
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "recommend_priority",
                "todo_title": todo_data.get("title", "")[:50],
                "current_priority": todo_data.get("priority")
            })
        )
        
        initial_state = {
            "todo_data": todo_data,
            "recommendation": {}
        }
        
        result = await priority_workflow.ainvoke(initial_state)
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "recommend_priority_success",
                "has_recommendation": bool(result.get("recommendation"))
            })
        )
        
        return {
            "success": True,
            "recommendation": result.get("recommendation", {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "recommend_priority_error",
                "error": str(e),
                "error_type": type(e).__name__
            })
        )
        raise HTTPException(status_code=500, detail="우선순위 추천 중 오류가 발생했습니다")


@app.post("/ai/categorize")
async def categorize_todo(request: CategoryRequest):
    """할 일 항목 분류"""
    try:
        logger.info(f"Categorizing: {request.todo.title}")
        
        initial_state = {
            "todo_data": request.todo.dict(),
            "classification": {}
        }
        
        result = await category_workflow.ainvoke(initial_state)
        
        return {
            "success": True,
            "classification": result.get("classification", {})
        }
        
    except Exception as e:
        logger.error(f"Error categorizing todo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/estimate-time")
async def estimate_time(request: TimeRequest):
    """할 일에 필요한 시간 예측"""
    try:
        logger.info(f"Estimating time for: {request.todo.title}")
        
        initial_state = {
            "todo_data": request.todo.dict(),
            "estimation": {}
        }
        
        result = await time_workflow.ainvoke(initial_state)
        
        return {
            "success": True,
            "estimation": result.get("estimation", {})
        }
        
    except Exception as e:
        logger.error(f"Error estimating time: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze-batch")
async def analyze_batch(ai_request: Request, request: BatchAnalysisRequest):
    """할 일 배치를 분석하고 인사이트 제공"""
    correlation_id = get_correlation_id(ai_request)
    
    try:
        # 배치 크기 제한
        if len(request.todos) > 100:
            raise HTTPException(status_code=422, detail="Batch size cannot exceed 100 todos")
        
        if len(request.todos) == 0:
            raise HTTPException(status_code=422, detail="Batch cannot be empty")
        
        # 각 todo 데이터 검증 및 정제
        validated_todos = []
        for i, todo in enumerate(request.todos):
            try:
                validated_todo = validate_todo_data(dict(todo))
                validated_todos.append(validated_todo)
            except HTTPException as e:
                logger.warning(
                    json.dumps({
                        "correlation_id": correlation_id,
                        "action": "batch_todo_validation_error",
                        "todo_index": i,
                        "error": str(e.detail)
                    })
                )
                # 유효하지 않은 todo는 건너뛰기
                continue
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "analyze_batch",
                "original_count": len(request.todos),
                "validated_count": len(validated_todos)
            })
        )
        
        analysis = await batch_analyzer.analyze(validated_todos)
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "analyze_batch_success",
                "processed_count": len(validated_todos),
                "has_analysis": bool(analysis)
            })
        )
        
        return {
            "success": True,
            "analysis": analysis,
            "todo_count": len(validated_todos),
            "original_count": len(request.todos)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "analyze_batch_error",
                "error": str(e),
                "error_type": type(e).__name__
            })
        )
        raise HTTPException(status_code=500, detail="배치 분석 중 오류가 발생했습니다")


@app.get("/ai/capabilities")
async def get_capabilities():
    """AI 서비스 기능에 대한 정보 조회"""
    return {
        "capabilities": {
            "parse": "Convert natural language to structured todos",
            "recommend_priority": "Suggest priority levels based on content",
            "categorize": "Classify todos into categories",
            "estimate_time": "Estimate time required for tasks",
            "analyze_batch": "Provide insights on multiple todos"
        },
        "categories": ["Work", "Personal", "Learning", "Health", "Finance", "Other"],
        "priority_levels": {
            "1": "Very Low",
            "2": "Low",
            "3": "Medium",
            "4": "High",
            "5": "Critical"
        },
        "workflow": "Powered by LangGraph with parallel processing"
    }


@app.on_event("startup")
async def startup_event():
    """시작 이벤트 핸들러"""
    logger.info("AI Service started successfully")
    openai_key = os.getenv("OPENAI_API_KEY", "")
    if not openai_key or openai_key.startswith("sk-dummy"):
        logger.warning("OpenAI API key not configured or using dummy key")
    else:
        logger.info("OpenAI API key configured")


@app.on_event("shutdown")
async def shutdown_event():
    """종료 이벤트 핸들러"""
    logger.info("AI Service shutting down")