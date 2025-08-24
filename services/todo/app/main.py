"""Todo 서비스를 위한 메인 FastAPI 애플리케이션"""

from fastapi import FastAPI, Depends, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
import logging
import time
import json
import re
import html
import os

from . import crud, models, schemas
from .database import engine, get_db

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

def validate_priority(priority: Optional[int]) -> Optional[int]:
    """우선순위 값 검증"""
    if priority is None:
        return None
    
    if not isinstance(priority, int) or priority < 1 or priority > 5:
        raise HTTPException(status_code=422, detail="Priority must be between 1 and 5")
    
    return priority

def validate_category(category: Optional[str]) -> Optional[str]:
    """카테고리 값 검증"""
    if not category:
        return category
    
    allowed_categories = ["업무", "개인", "학습", "건강", "재정", "기타", "Work", "Personal", "Learning", "Health", "Finance", "Other"]
    
    if category not in allowed_categories:
        raise HTTPException(status_code=422, detail=f"Invalid category. Allowed values: {allowed_categories}")
    
    return category

def validate_status(status: str) -> str:
    """상태 값 검증"""
    allowed_statuses = ["TODO", "DOING", "DONE"]
    
    if status not in allowed_statuses:
        raise HTTPException(status_code=422, detail=f"Invalid status. Allowed values: {allowed_statuses}")
    
    return status

def validate_estimated_time(estimated_time: Optional[int]) -> Optional[int]:
    """예상 소요 시간 검증"""
    if estimated_time is None:
        return None
    
    if not isinstance(estimated_time, int) or estimated_time < 0:
        raise HTTPException(status_code=422, detail="Estimated time must be a non-negative integer")
    
    # 최대 24시간 제한 (1440분)
    if estimated_time > 1440:
        raise HTTPException(status_code=422, detail="Estimated time cannot exceed 1440 minutes (24 hours)")
    
    return estimated_time

# 데이터베이스 테이블 생성
models.Base.metadata.create_all(bind=engine)

# FastAPI 앱 생성
app = FastAPI(
    title="Todo Service",
    description="TODO 항목 관리를 위한 마이크로서비스",
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

# 간단한 레이트 리미터 (프로덕션에서는 Redis 기반 사용 권장)
from collections import defaultdict
import time as time_module

# IP별 요청 카운터 (메모리 기반 - 단순한 구현)
request_counts = defaultdict(list)
RATE_LIMIT_REQUESTS = 100  # 분당 요청 수
RATE_LIMIT_WINDOW = 60  # 시간 윈도우 (초)

def check_rate_limit(client_ip: str) -> bool:
    """간단한 레이트 리미팅 확인"""
    current_time = time_module.time()
    # 오래된 요청 기록 정리
    request_counts[client_ip] = [req_time for req_time in request_counts[client_ip] 
                                if current_time - req_time < RATE_LIMIT_WINDOW]
    
    # 현재 요청 카운트 확인
    if len(request_counts[client_ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    # 현재 요청 시간 기록
    request_counts[client_ip].append(current_time)
    return True

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


@app.get("/health", response_model=schemas.HealthResponse)
async def health_check():
    """헬스 체크 엔드포인트"""
    return schemas.HealthResponse(
        status="healthy",
        service="todo-service",
        timestamp=datetime.now()
    )


@app.get("/todos", response_model=schemas.TodoListResponse)
async def get_todos(
    request: Request,
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    status: Optional[str] = Query(None, description="상태로 필터링"),
    category: Optional[str] = Query(None, description="카테고리로 필터링"),
    priority: Optional[int] = Query(None, ge=1, le=5, description="우선순위로 필터링"),
    sort_by: str = Query("created_at", description="정렬 필드"),
    order: str = Query("desc", regex="^(asc|desc)$", description="정렬 순서"),
    db: Session = Depends(get_db)
):
    """필터링과 페이지네이션을 사용한 할 일 목록 조회"""
    correlation_id = get_correlation_id(request)
    
    try:
        skip = (page - 1) * page_size
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "get_todos",
                "filters": {"status": status, "category": category, "priority": priority},
                "page": page, "page_size": page_size
            })
        )
        
        todos = crud.get_todos(
            db, skip=skip, limit=page_size,
            status=status, category=category, priority=priority,
            sort_by=sort_by, order=order
        )
        
        total = crud.get_todos_count(db, status=status, category=category, priority=priority)
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "get_todos_success",
                "total": total,
                "returned": len(todos)
            })
        )
        
        return schemas.TodoListResponse(
            total=total,
            items=todos,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        logger.error(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "get_todos_error",
                "error": str(e),
                "error_type": type(e).__name__
            })
        )
        raise HTTPException(status_code=500, detail="할 일 목록 조회 중 오류가 발생했습니다")


@app.post("/todos", response_model=schemas.TodoResponse, status_code=201)
async def create_todo(
    request: Request,
    todo: schemas.TodoCreate,
    db: Session = Depends(get_db)
):
    """새 할 일 생성"""
    correlation_id = get_correlation_id(request)
    
    try:
        # 입력 검증 및 정제
        todo.title = sanitize_string(todo.title, max_length=255)
        todo.description = sanitize_string(todo.description, max_length=2000)
        todo.priority = validate_priority(todo.priority)
        todo.category = validate_category(todo.category)
        
        if not todo.title:
            raise HTTPException(status_code=422, detail="Title is required and cannot be empty")
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "create_todo",
                "title": todo.title,
                "priority": todo.priority,
                "category": todo.category
            })
        )
        
        db_todo = crud.create_todo(db, todo)
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "create_todo_success",
                "todo_id": str(db_todo.id)
            })
        )
        
        return db_todo
    except Exception as e:
        logger.error(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "create_todo_error",
                "error": str(e),
                "error_type": type(e).__name__
            })
        )
        raise HTTPException(status_code=500, detail="할 일 생성 중 오류가 발생했습니다")


@app.get("/todos/{todo_id}", response_model=schemas.TodoResponse)
async def get_todo(
    request: Request,
    todo_id: UUID,
    db: Session = Depends(get_db)
):
    """ID로 특정 할 일 조회"""
    correlation_id = get_correlation_id(request)
    
    try:
        # 먼저 캐시에서 가져오기 시도
        cached_todo = crud.get_cached_todo(todo_id)
        if cached_todo:
            logger.info(
                json.dumps({
                    "correlation_id": correlation_id,
                    "action": "get_todo_cache_hit",
                    "todo_id": str(todo_id)
                })
            )
            return cached_todo
        
        # 데이터베이스에서 가져오기
        db_todo = crud.get_todo(db, todo_id)
        if not db_todo:
            logger.warning(
                json.dumps({
                    "correlation_id": correlation_id,
                    "action": "get_todo_not_found",
                    "todo_id": str(todo_id)
                })
            )
            raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다")
        
        # 할 일 캐시
        crud.cache_todo(db_todo)
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "get_todo_success",
                "todo_id": str(todo_id)
            })
        )
        
        return db_todo
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "get_todo_error",
                "todo_id": str(todo_id),
                "error": str(e),
                "error_type": type(e).__name__
            })
        )
        raise HTTPException(status_code=500, detail="할 일 조회 중 오류가 발생했습니다")


@app.put("/todos/{todo_id}", response_model=schemas.TodoResponse)
async def update_todo(
    request: Request,
    todo_id: UUID,
    todo: schemas.TodoUpdate,
    db: Session = Depends(get_db)
):
    """할 일 업데이트"""
    correlation_id = get_correlation_id(request)
    
    try:
        # 입력 검증 및 정제
        if todo.title is not None:
            todo.title = sanitize_string(todo.title, max_length=255)
            if not todo.title:
                raise HTTPException(status_code=422, detail="Title cannot be empty")
        
        if todo.description is not None:
            todo.description = sanitize_string(todo.description, max_length=2000)
        
        if todo.priority is not None:
            todo.priority = validate_priority(todo.priority)
        
        if todo.category is not None:
            todo.category = validate_category(todo.category)
        
        if todo.estimated_time is not None:
            todo.estimated_time = validate_estimated_time(todo.estimated_time)
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "update_todo",
                "todo_id": str(todo_id),
                "updates": todo.dict(exclude_unset=True)
            })
        )
        
        db_todo = crud.update_todo(db, todo_id, todo)
        if not db_todo:
            logger.warning(
                json.dumps({
                    "correlation_id": correlation_id,
                    "action": "update_todo_not_found",
                    "todo_id": str(todo_id)
                })
            )
            raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다")
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "update_todo_success",
                "todo_id": str(todo_id)
            })
        )
        
        return db_todo
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "update_todo_error",
                "todo_id": str(todo_id),
                "error": str(e),
                "error_type": type(e).__name__
            })
        )
        raise HTTPException(status_code=500, detail="할 일 업데이트 중 오류가 발생했습니다")


@app.patch("/todos/{todo_id}/status", response_model=schemas.TodoResponse)
async def update_todo_status(
    request: Request,
    todo_id: UUID,
    status_update: schemas.TodoStatusUpdate,
    db: Session = Depends(get_db)
):
    """할 일 상태 업데이트"""
    correlation_id = get_correlation_id(request)
    
    try:
        # 상태 값 검증
        validated_status = validate_status(status_update.status)
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "update_todo_status",
                "todo_id": str(todo_id),
                "new_status": validated_status
            })
        )
        
        db_todo = crud.update_todo_status(db, todo_id, validated_status)
        if not db_todo:
            logger.warning(
                json.dumps({
                    "correlation_id": correlation_id,
                    "action": "update_todo_status_not_found",
                    "todo_id": str(todo_id)
                })
            )
            raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다")
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "update_todo_status_success",
                "todo_id": str(todo_id),
                "status": status_update.status
            })
        )
        
        return db_todo
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "update_todo_status_error",
                "todo_id": str(todo_id),
                "error": str(e),
                "error_type": type(e).__name__
            })
        )
        raise HTTPException(status_code=500, detail="할 일 상태 업데이트 중 오류가 발생했습니다")


@app.delete("/todos/{todo_id}", status_code=204)
async def delete_todo(
    request: Request,
    todo_id: UUID,
    db: Session = Depends(get_db)
):
    """할 일 삭제"""
    correlation_id = get_correlation_id(request)
    
    try:
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "delete_todo",
                "todo_id": str(todo_id)
            })
        )
        
        success = crud.delete_todo(db, todo_id)
        if not success:
            logger.warning(
                json.dumps({
                    "correlation_id": correlation_id,
                    "action": "delete_todo_not_found",
                    "todo_id": str(todo_id)
                })
            )
            raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다")
        
        logger.info(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "delete_todo_success",
                "todo_id": str(todo_id)
            })
        )
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            json.dumps({
                "correlation_id": correlation_id,
                "action": "delete_todo_error",
                "todo_id": str(todo_id),
                "error": str(e),
                "error_type": type(e).__name__
            })
        )
        raise HTTPException(status_code=500, detail="할 일 삭제 중 오류가 발생했습니다")


@app.get("/todos/stats/summary")
async def get_todo_stats(db: Session = Depends(get_db)):
    """할 일 통계 요약 조회"""
    total = db.query(models.Todo).count()
    todo_count = db.query(models.Todo).filter(models.Todo.status == "TODO").count()
    doing_count = db.query(models.Todo).filter(models.Todo.status == "DOING").count()
    done_count = db.query(models.Todo).filter(models.Todo.status == "DONE").count()
    
    return {
        "total": total,
        "by_status": {
            "TODO": todo_count,
            "DOING": doing_count,
            "DONE": done_count
        },
        "completion_rate": round(done_count / total * 100, 2) if total > 0 else 0
    }


@app.on_event("startup")
async def startup_event():
    """시작 이벤트 핸들러"""
    logger.info("Todo Service started successfully")
    logger.info(f"Database tables created/verified")


@app.on_event("shutdown")
async def shutdown_event():
    """종료 이벤트 핸들러"""
    logger.info("Todo Service shutting down")