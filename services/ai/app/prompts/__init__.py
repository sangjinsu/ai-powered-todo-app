"""AI 에이전트 프롬프트 모듈

Todo 관리를 위한 다양한 AI 프롬프트들을 제공합니다.

사용법:
    from services.ai.app.prompts import PARSE_TODO_PROMPT
    또는
    from services.ai.app.prompts.todo_parsing import PARSE_TODO_PROMPT
"""

# Todo 파싱 프롬프트
from .todo_parsing import PARSE_TODO_PROMPT

# 분석 프롬프트들
from .priority_analysis import RECOMMEND_PRIORITY_PROMPT
from .categorization import CATEGORIZE_TODO_PROMPT
from .time_estimation import ESTIMATE_TIME_PROMPT

# 일괄 처리 프롬프트
from .batch_analysis import BATCH_ANALYSIS_PROMPT

# 모든 프롬프트 목록
__all__ = [
    "PARSE_TODO_PROMPT",
    "RECOMMEND_PRIORITY_PROMPT", 
    "CATEGORIZE_TODO_PROMPT",
    "ESTIMATE_TIME_PROMPT",
    "BATCH_ANALYSIS_PROMPT"
]

# 프롬프트 카테고리별 그룹핑
PARSING_PROMPTS = {
    "PARSE_TODO_PROMPT": PARSE_TODO_PROMPT
}

ANALYSIS_PROMPTS = {
    "RECOMMEND_PRIORITY_PROMPT": RECOMMEND_PRIORITY_PROMPT,
    "CATEGORIZE_TODO_PROMPT": CATEGORIZE_TODO_PROMPT,
    "ESTIMATE_TIME_PROMPT": ESTIMATE_TIME_PROMPT
}

BATCH_PROMPTS = {
    "BATCH_ANALYSIS_PROMPT": BATCH_ANALYSIS_PROMPT
}

# 모든 프롬프트 딕셔너리
ALL_PROMPTS = {
    **PARSING_PROMPTS,
    **ANALYSIS_PROMPTS, 
    **BATCH_PROMPTS
}