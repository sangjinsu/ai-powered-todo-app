"""다양한 작업 처리를 위한 AI 에이전트"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, Optional
from functools import wraps
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import time
import random
from .prompts import (
    PARSE_TODO_PROMPT,
    RECOMMEND_PRIORITY_PROMPT,
    CATEGORIZE_TODO_PROMPT,
    ESTIMATE_TIME_PROMPT,
    BATCH_ANALYSIS_PROMPT
)

logger = logging.getLogger(__name__)

# 개선된 OpenAI LLM 초기화 (리소스 관리 및 오류 처리)
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.3,
    openai_api_key=os.getenv("OPENAI_API_KEY", "sk-dummy-key"),
    request_timeout=30,  # 30초 타임아웃
    max_retries=3,  # 최대 3번 재시도
    streaming=False  # 비동기 스트리밍 비활성화
)

# 지수 백오프 데코레이터
def with_exponential_backoff(max_retries: int = 3, base_delay: float = 1.0):
    """지수 백오프를 사용한 재시도 데코레이터"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        logger.error(f"Final attempt failed for {func.__name__}: {e}")
                        raise
                    
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}: {e}. Retrying in {delay:.2f}s")
                    await asyncio.sleep(delay)
            
        return wrapper
    return decorator

# 비동기 동시성 제어
_concurrent_requests = 0
MAX_CONCURRENT_REQUESTS = 10

async def acquire_request_slot():
    """요청 슬롯 획득 (동시성 제한)"""
    global _concurrent_requests
    while _concurrent_requests >= MAX_CONCURRENT_REQUESTS:
        await asyncio.sleep(0.1)
    _concurrent_requests += 1

async def release_request_slot():
    """요청 슬롯 해제"""
    global _concurrent_requests
    _concurrent_requests = max(0, _concurrent_requests - 1)


class TodoParserAgent:
    """자연어를 구조화된 할 일로 파싱하는 에이전트"""
    
    def __init__(self):
        self.llm = llm
    
    @with_exponential_backoff(max_retries=3, base_delay=1.0)
    async def parse(self, input_text: str) -> Dict[str, Any]:
        """자연어 입력을 구조화된 할 일로 파싱"""
        await acquire_request_slot()
        start_time = time.time()
        
        try:
            prompt = PARSE_TODO_PROMPT.format(input=input_text)
            messages = [
                SystemMessage(content="당신은 할 일 항목을 구조화하는 도움이 되는 어시스턴트입니다. 한국어로 응답하고 정확한 JSON 형식을 유지하세요."),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            result = json.loads(response.content)
            
            # 검증 및 기본값 설정
            result.setdefault("priority", 3)
            result.setdefault("category", "기타")
            result.setdefault("estimated_time", 30)
            
            processing_time = time.time() - start_time
            logger.info(f"Parsed todo successfully in {processing_time:.2f}s: {result['title']}")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}. Response: {response.content if 'response' in locals() else 'No response'}")
            # JSON 파싱 오류 시 기본 구조 반환
            return {
                "title": input_text[:255],
                "description": None,
                "priority": 3,
                "category": "기타",
                "estimated_time": 30
            }
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Error parsing todo after {processing_time:.2f}s: {e}")
            # 오류 발생 시 기본 구조 반환
            return {
                "title": input_text[:255],
                "description": None,
                "priority": 3,
                "category": "기타",
                "estimated_time": 30
            }
        finally:
            await release_request_slot()


class PriorityRecommenderAgent:
    """작업 우선순위 추천을 위한 에이전트"""
    
    def __init__(self):
        self.llm = llm
    
    @with_exponential_backoff(max_retries=3, base_delay=1.0)
    async def recommend(self, todo_data: Dict[str, Any]) -> Dict[str, Any]:
        """할 일 항목에 대한 우선순위 추천"""
        await acquire_request_slot()
        start_time = time.time()
        
        try:
            prompt = RECOMMEND_PRIORITY_PROMPT.format(
                title=todo_data.get("title", ""),
                description=todo_data.get("description", ""),
                category=todo_data.get("category", "Other"),
                current_priority=todo_data.get("priority", 3)
            )
            
            messages = [
                SystemMessage(content="당신은 작업 우선순위 지정 전문가입니다. 한국어로 응답하고 정확한 JSON 형식을 유지하세요."),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            result = json.loads(response.content)
            
            processing_time = time.time() - start_time
            logger.info(f"Priority recommendation completed in {processing_time:.2f}s: {result}")
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Error recommending priority after {processing_time:.2f}s: {e}")
            return {
                "recommended_priority": todo_data.get("priority", 3),
                "reasoning": "우선순위 분석 중 오류가 발생했습니다",
                "confidence": 0.3
            }
        finally:
            await release_request_slot()


class CategoryClassifierAgent:
    """할 일 분류를 위한 에이전트"""
    
    def __init__(self):
        self.llm = llm
    
    @with_exponential_backoff(max_retries=3, base_delay=1.0)
    async def categorize(self, todo_data: Dict[str, Any]) -> Dict[str, Any]:
        """할 일 항목 분류"""
        await acquire_request_slot()
        start_time = time.time()
        
        try:
            prompt = CATEGORIZE_TODO_PROMPT.format(
                title=todo_data.get("title", ""),
                description=todo_data.get("description", "")
            )
            
            messages = [
                SystemMessage(content="당신은 작업 분류 전문가입니다. 한국어로 응답하고 정확한 JSON 형식을 유지하세요."),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            result = json.loads(response.content)
            
            processing_time = time.time() - start_time
            logger.info(f"Category classification completed in {processing_time:.2f}s: {result}")
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Error categorizing todo after {processing_time:.2f}s: {e}")
            return {
                "category": "기타",
                "confidence": 0.3,
                "reasoning": "카테고리 분류 중 오류가 발생했습니다"
            }
        finally:
            await release_request_slot()


class TimeEstimatorAgent:
    """작업 소요 시간 예측을 위한 에이전트"""
    
    def __init__(self):
        self.llm = llm
    
    @with_exponential_backoff(max_retries=3, base_delay=1.0)
    async def estimate(self, todo_data: Dict[str, Any]) -> Dict[str, Any]:
        """할 일에 필요한 시간 예측"""
        await acquire_request_slot()
        start_time = time.time()
        
        try:
            prompt = ESTIMATE_TIME_PROMPT.format(
                title=todo_data.get("title", ""),
                description=todo_data.get("description", ""),
                category=todo_data.get("category", "Other")
            )
            
            messages = [
                SystemMessage(content="당신은 시간 추정 전문가입니다. 한국어로 응답하고 정확한 JSON 형식을 유지하세요."),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            result = json.loads(response.content)
            
            processing_time = time.time() - start_time
            logger.info(f"Time estimation completed in {processing_time:.2f}s: {result}")
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Error estimating time after {processing_time:.2f}s: {e}")
            return {
                "estimated_minutes": 30,
                "confidence": 0.3,
                "suggestion": "시간 추정 중 오류가 발생했습니다"
            }
        finally:
            await release_request_slot()


class BatchAnalysisAgent:
    """여러 할 일을 분석하고 인사이트를 제공하는 에이전트"""
    
    def __init__(self):
        self.llm = llm
    
    async def analyze(self, todos: list) -> str:
        """할 일 배치를 분석하고 인사이트 제공"""
        try:
            todos_summary = [
                {
                    "title": todo.get("title"),
                    "priority": todo.get("priority"),
                    "category": todo.get("category"),
                    "estimated_time": todo.get("estimated_time"),
                    "status": todo.get("status")
                }
                for todo in todos
            ]
            
            prompt = BATCH_ANALYSIS_PROMPT.format(
                todos_json=json.dumps(todos_summary, indent=2)
            )
            
            messages = [
                SystemMessage(content="당신은 생산성 전문가입니다. 한국어로 응답하고 구조화된 분석을 제공하세요."),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            logger.info("Batch analysis completed")
            return response.content
            
        except Exception as e:
            logger.error(f"Error in batch analysis: {e}")
            return "Unable to analyze todos at this time."


# 에이전트 초기화
todo_parser = TodoParserAgent()
priority_recommender = PriorityRecommenderAgent()
category_classifier = CategoryClassifierAgent()
time_estimator = TimeEstimatorAgent()
batch_analyzer = BatchAnalysisAgent()