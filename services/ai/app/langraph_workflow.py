"""AI 기반 할 일 처리를 위한 LangGraph 워크플로우"""

import logging
from typing import Dict, Any, List, TypedDict, Annotated
from langgraph.graph import StateGraph, END
from operator import add
import json

from .agents import (
    todo_parser,
    priority_recommender,
    category_classifier,
    time_estimator,
    batch_analyzer
)

logger = logging.getLogger(__name__)


class TodoState(TypedDict):
    """할 일 처리 워크플로우를 위한 상태"""
    input_text: str
    parsed_todo: Dict[str, Any]
    priority_recommendation: Dict[str, Any]
    category_classification: Dict[str, Any]
    time_estimation: Dict[str, Any]
    final_todo: Dict[str, Any]
    errors: Annotated[List[str], add]


def create_todo_workflow() -> StateGraph:
    """할 일 처리를 위한 LangGraph 워크플로우 생성"""
    
    workflow = StateGraph(TodoState)
    
    # 노드: 자연어 입력 파싱
    async def parse_input(state: TodoState) -> Dict[str, Any]:
        """자연어 입력을 구조화된 할 일로 파싱"""
        try:
            parsed = await todo_parser.parse(state["input_text"])
            logger.info(f"Parsed todo: {parsed}")
            return {"parsed_todo": parsed}
        except Exception as e:
            logger.error(f"Parse error: {e}")
            return {"errors": [f"Parse error: {str(e)}"]}
    
    # 노드: 우선순위 추천
    async def recommend_priority(state: TodoState) -> Dict[str, Any]:
        """파싱된 할 일을 기반으로 우선순위 추천"""
        try:
            if state.get("parsed_todo"):
                recommendation = await priority_recommender.recommend(state["parsed_todo"])
                logger.info(f"Priority recommendation: {recommendation}")
                return {"priority_recommendation": recommendation}
            return {}
        except Exception as e:
            logger.error(f"Priority error: {e}")
            return {"errors": [f"Priority error: {str(e)}"]}
    
    # 노드: 카테고리 분류
    async def classify_category(state: TodoState) -> Dict[str, Any]:
        """할 일을 카테고리로 분류"""
        try:
            if state.get("parsed_todo"):
                classification = await category_classifier.categorize(state["parsed_todo"])
                logger.info(f"Category classification: {classification}")
                return {"category_classification": classification}
            return {}
        except Exception as e:
            logger.error(f"Category error: {e}")
            return {"errors": [f"Category error: {str(e)}"]}
    
    # 노드: 시간 예측
    async def estimate_time(state: TodoState) -> Dict[str, Any]:
        """할 일에 필요한 시간 예측"""
        try:
            if state.get("parsed_todo"):
                estimation = await time_estimator.estimate(state["parsed_todo"])
                logger.info(f"Time estimation: {estimation}")
                return {"time_estimation": estimation}
            return {}
        except Exception as e:
            logger.error(f"Time error: {e}")
            return {"errors": [f"Time error: {str(e)}"]}
    
    # 노드: 결과 집계
    async def aggregate_results(state: TodoState) -> Dict[str, Any]:
        """모든 AI 추천을 최종 할 일로 집계"""
        try:
            final_todo = state.get("parsed_todo", {}).copy()
            
            # 신뢰도가 높으면 우선순위 추천 적용
            if state.get("priority_recommendation", {}).get("confidence", 0) > 0.7:
                final_todo["priority"] = state["priority_recommendation"]["recommended_priority"]
                final_todo["priority_reasoning"] = state["priority_recommendation"]["reasoning"]
            
            # 신뢰도가 높으면 카테고리 분류 적용
            if state.get("category_classification", {}).get("confidence", 0) > 0.7:
                final_todo["category"] = state["category_classification"]["category"]
            
            # 신뢰도가 높으면 시간 예측 적용
            if state.get("time_estimation", {}).get("confidence", 0) > 0.7:
                final_todo["estimated_time"] = state["time_estimation"]["estimated_minutes"]
                final_todo["time_suggestion"] = state["time_estimation"].get("suggestion")
            
            # AI 메타데이터 추가
            final_todo["ai_metadata"] = {
                "priority_confidence": state.get("priority_recommendation", {}).get("confidence", 0),
                "category_confidence": state.get("category_classification", {}).get("confidence", 0),
                "time_confidence": state.get("time_estimation", {}).get("confidence", 0),
                "processed": True
            }
            
            logger.info(f"Final todo: {final_todo}")
            return {"final_todo": final_todo}
            
        except Exception as e:
            logger.error(f"Aggregation error: {e}")
            return {"errors": [f"Aggregation error: {str(e)}"]}
    
    # 워크플로우에 노드 추가
    workflow.add_node("parse_input", parse_input)
    workflow.add_node("recommend_priority", recommend_priority)
    workflow.add_node("classify_category", classify_category)
    workflow.add_node("estimate_time", estimate_time)
    workflow.add_node("aggregate_results", aggregate_results)
    
    # 워크플로우 엣지 정의
    workflow.set_entry_point("parse_input")
    workflow.add_edge("parse_input", "recommend_priority")
    workflow.add_edge("parse_input", "classify_category")
    workflow.add_edge("parse_input", "estimate_time")
    workflow.add_edge("recommend_priority", "aggregate_results")
    workflow.add_edge("classify_category", "aggregate_results")
    workflow.add_edge("estimate_time", "aggregate_results")
    workflow.add_edge("aggregate_results", END)
    
    return workflow.compile()


# 단일 목적 워크플로우 생성
def create_priority_workflow() -> StateGraph:
    """우선순위 추천전용 워크플로우 생성"""
    
    class PriorityState(TypedDict):
        todo_data: Dict[str, Any]
        recommendation: Dict[str, Any]
    
    workflow = StateGraph(PriorityState)
    
    async def get_priority(state: PriorityState) -> Dict[str, Any]:
        recommendation = await priority_recommender.recommend(state["todo_data"])
        return {"recommendation": recommendation}
    
    workflow.add_node("get_priority", get_priority)
    workflow.set_entry_point("get_priority")
    workflow.add_edge("get_priority", END)
    
    return workflow.compile()


def create_category_workflow() -> StateGraph:
    """카테고리 분류 전용 워크플로우 생성"""
    
    class CategoryState(TypedDict):
        todo_data: Dict[str, Any]
        classification: Dict[str, Any]
    
    workflow = StateGraph(CategoryState)
    
    async def get_category(state: CategoryState) -> Dict[str, Any]:
        classification = await category_classifier.categorize(state["todo_data"])
        return {"classification": classification}
    
    workflow.add_node("get_category", get_category)
    workflow.set_entry_point("get_category")
    workflow.add_edge("get_category", END)
    
    return workflow.compile()


def create_time_workflow() -> StateGraph:
    """시간 예측 전용 워크플로우 생성"""
    
    class TimeState(TypedDict):
        todo_data: Dict[str, Any]
        estimation: Dict[str, Any]
    
    workflow = StateGraph(TimeState)
    
    async def get_time(state: TimeState) -> Dict[str, Any]:
        estimation = await time_estimator.estimate(state["todo_data"])
        return {"estimation": estimation}
    
    workflow.add_node("get_time", get_time)
    workflow.set_entry_point("get_time")
    workflow.add_edge("get_time", END)
    
    return workflow.compile()


# 워크플로우 초기화
todo_processing_workflow = create_todo_workflow()
priority_workflow = create_priority_workflow()
category_workflow = create_category_workflow()
time_workflow = create_time_workflow()