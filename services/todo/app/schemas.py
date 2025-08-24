"""요청/응답 검증을 위한 Pydantic 스키마"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class TodoStatus(str, Enum):
    """할 일 상태를 위한 열거형"""
    TODO = "TODO"
    DOING = "DOING"
    DONE = "DONE"


class TodoBase(BaseModel):
    """Todo를 위한 기본 스키마"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: int = Field(default=3, ge=1, le=5)
    category: Optional[str] = Field(default=None, max_length=50)
    estimated_time: Optional[int] = Field(default=None, ge=0)  # 분 단위


class TodoCreate(TodoBase):
    """새 할 일 생성을 위한 스키마"""
    pass


class TodoUpdate(BaseModel):
    """할 일 업데이트를 위한 스키마"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    category: Optional[str] = Field(None, max_length=50)
    estimated_time: Optional[int] = Field(None, ge=0)


class TodoStatusUpdate(BaseModel):
    """할 일 상태 업데이트를 위한 스키마"""
    status: TodoStatus


class TodoResponse(TodoBase):
    """할 일 응답을 위한 스키마"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    status: TodoStatus
    ai_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


class TodoListResponse(BaseModel):
    """할 일 목록 응답을 위한 스키마"""
    total: int
    items: list[TodoResponse]
    page: int = 1
    page_size: int = 20


class HealthResponse(BaseModel):
    """헬스 체크 응답을 위한 스키마"""
    status: str = "healthy"
    service: str = "todo-service"
    timestamp: datetime