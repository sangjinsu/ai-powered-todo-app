"""Todo 서비스용 SQLAlchemy 모델"""

from sqlalchemy import Column, String, Integer, Text, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum
import uuid
from .database import Base


class TodoStatus(str, enum.Enum):
    """할 일 상태를 위한 열거형"""
    TODO = "TODO"
    DOING = "DOING"
    DONE = "DONE"


class Todo(Base):
    """데이터베이스용 Todo 모델"""
    __tablename__ = "todos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(TodoStatus), default=TodoStatus.TODO, nullable=False)
    priority = Column(Integer, default=3, nullable=False)
    category = Column(String(50), nullable=True)
    estimated_time = Column(Integer, nullable=True)  # 분 단위
    ai_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        """모델을 딕셔너리로 변환"""
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "status": self.status.value if self.status else "TODO",
            "priority": self.priority,
            "category": self.category,
            "estimated_time": self.estimated_time,
            "ai_metadata": self.ai_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }