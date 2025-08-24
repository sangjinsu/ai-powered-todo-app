"""Todo 서비스를 위한 CRUD 연산"""

from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional, List, Set
from uuid import UUID
import json
import hashlib
from . import models, schemas
from .database import get_redis

# 캐시 태그 관리를 위한 전역 변수
CACHE_TAGS = {
    "todos_list": "todos:tags:list",
    "todo_item": "todos:tags:item:{}"
}


def get_todo(db: Session, todo_id: UUID) -> Optional[models.Todo]:
    """ID로 단일 할 일 조회"""
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()


def get_todos(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[int] = None,
    sort_by: str = "created_at",
    order: str = "desc"
) -> List[models.Todo]:
    """필터링과 페이지네이션을 사용한 할 일 목록 조회"""
    query = db.query(models.Todo)
    
    # 필터 적용
    if status:
        query = query.filter(models.Todo.status == status)
    if category:
        query = query.filter(models.Todo.category == category)
    if priority:
        query = query.filter(models.Todo.priority == priority)
    
    # 정렬 적용
    if order == "desc":
        query = query.order_by(desc(getattr(models.Todo, sort_by, "created_at")))
    else:
        query = query.order_by(asc(getattr(models.Todo, sort_by, "created_at")))
    
    return query.offset(skip).limit(limit).all()


def get_todos_count(
    db: Session,
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[int] = None
) -> int:
    """필터링된 할 일의 총 개수 조회"""
    query = db.query(models.Todo)
    
    if status:
        query = query.filter(models.Todo.status == status)
    if category:
        query = query.filter(models.Todo.category == category)
    if priority:
        query = query.filter(models.Todo.priority == priority)
    
    return query.count()


def create_todo(db: Session, todo: schemas.TodoCreate) -> models.Todo:
    """새 할 일 생성"""
    db_todo = models.Todo(**todo.dict())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    
    # 효율적인 캐시 무효화 - 태그 기반
    redis_client = get_redis()
    _invalidate_todos_list_cache(redis_client)
    _cache_todo_with_tags(redis_client, db_todo)
    
    return db_todo


def update_todo(db: Session, todo_id: UUID, todo: schemas.TodoUpdate) -> Optional[models.Todo]:
    """기존 할 일 업데이트"""
    db_todo = get_todo(db, todo_id)
    if not db_todo:
        return None
    
    # 제공된 필드만 업데이트
    update_data = todo.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_todo, field, value)
    
    db.commit()
    db.refresh(db_todo)
    
    # 효율적인 캐시 무효화
    redis_client = get_redis()
    redis_client.delete(f"todo:{todo_id}")
    _invalidate_todos_list_cache(redis_client)
    _cache_todo_with_tags(redis_client, db_todo)
    
    return db_todo


def update_todo_status(db: Session, todo_id: UUID, status: str) -> Optional[models.Todo]:
    """할 일 상태 업데이트"""
    db_todo = get_todo(db, todo_id)
    if not db_todo:
        return None
    
    db_todo.status = status
    db.commit()
    db.refresh(db_todo)
    
    # 효율적인 캐시 무효화
    redis_client = get_redis()
    redis_client.delete(f"todo:{todo_id}")
    _invalidate_todos_list_cache(redis_client)
    _cache_todo_with_tags(redis_client, db_todo)
    
    return db_todo


def delete_todo(db: Session, todo_id: UUID) -> bool:
    """할 일 삭제"""
    db_todo = get_todo(db, todo_id)
    if not db_todo:
        return False
    
    db.delete(db_todo)
    db.commit()
    
    # 효율적인 캐시 무효화
    redis_client = get_redis()
    redis_client.delete(f"todo:{todo_id}")
    _invalidate_todos_list_cache(redis_client)
    
    return True


def cache_todo(todo: models.Todo, expire: int = 300):
    """Redis에 할 일 캐시"""
    redis_client = get_redis()
    key = f"todo:{todo.id}"
    redis_client.setex(key, expire, json.dumps(todo.to_dict(), default=str))


def get_cached_todo(todo_id: UUID) -> Optional[dict]:
    """Redis에서 캐시된 할 일 조회"""
    redis_client = get_redis()
    key = f"todo:{todo_id}"
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)
    return None


def _generate_list_cache_key(**filters) -> str:
    """필터 기반 리스트 캐시 키 생성"""
    # 필터 매개변수를 정렬하고 해시
    filter_str = "|".join(f"{k}:{v}" for k, v in sorted(filters.items()) if v is not None)
    cache_key = f"todos:list:{hashlib.md5(filter_str.encode()).hexdigest()}"
    return cache_key


def _invalidate_todos_list_cache(redis_client):
    """효율적인 리스트 캐시 무효화"""
    # 태그를 사용한 방식으로 변경
    try:
        # 현재 리스트 캐시 태그 가져오기
        list_keys = redis_client.smembers(CACHE_TAGS["todos_list"])
        if list_keys:
            # 일괄 삭제
            redis_client.delete(*list_keys)
            # 태그 초기화
            redis_client.delete(CACHE_TAGS["todos_list"])
    except Exception as e:
        # 캐시 오류는 로깅만 하고 계속 진행
        print(f"Cache invalidation error: {e}")


def _cache_todo_with_tags(redis_client, todo: models.Todo):
    """태그와 함께 할 일 캐시"""
    try:
        # 개별 할 일 캐시
        cache_todo(todo)
        # 태그 추가 (리스트 캐시 무효화를 위해)
        item_tag_key = CACHE_TAGS["todo_item"].format(todo.id)
        redis_client.sadd(CACHE_TAGS["todos_list"], f"todo:{todo.id}")
    except Exception as e:
        # 캐시 오류는 로깅만 하고 계속 진행
        print(f"Cache tagging error: {e}")