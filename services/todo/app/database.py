"""데이터베이스 설정 및 세션 관리"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import redis

# 환경 변수에서 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/tododb")

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,  # 기본 연결 풀 크기
    max_overflow=30,  # 최대 추가 연결
    pool_timeout=30,  # 연결 대기 시간 (초)
    pool_recycle=3600,  # 연결 재사용 주기 (1시간)
    pool_pre_ping=True,  # 연결 유효성 검사
    echo=False,  # SQL 쿼리 디버깅을 위해 True로 설정 가능
)

# SessionLocal 클래스 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 선언적 모델을 위한 Base 클래스 생성
Base = declarative_base()

# Redis 설정
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)


def get_db():
    """데이터베이스 세션을 가져오는 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_redis():
    """Redis 클라이언트를 가져오는 의존성"""
    return redis_client