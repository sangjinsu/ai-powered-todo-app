#!/bin/bash

# AI 기반 할 일 관리 앱 - 설정 검증 스크립트

echo "🔍 AI 기반 할 일 관리 앱 설정을 검증중..."
echo "========================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 파일 존재 여부를 확인하는 함수
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 존재"
        return 0
    else
        echo -e "${RED}❌${NC} $1 누락"
        return 1
    fi
}

# 디렉토리 존재 여부를 확인하는 함수
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/ 디렉토리 존재"
        return 0
    else
        echo -e "${RED}❌${NC} $1/ 디렉토리 누락"
        return 1
    fi
}

echo -e "\n${YELLOW}1. 프로젝트 구조${NC}"
echo "===================="

# 메인 설정 파일 확인
check_file "docker-compose.yml"
check_file ".env.example"
check_file ".gitignore"
check_file "README.md"
check_file "init.sql"
check_file "nginx/nginx.conf"

# 서비스 디렉토리 확인
check_dir "services/todo"
check_dir "services/ai"
check_dir "frontend"

echo -e "\n${YELLOW}2. 백엔드 서비스${NC}"
echo "=================="

# Todo 서비스
check_file "services/todo/Dockerfile"
check_file "services/todo/pyproject.toml"
check_file "services/todo/app/main.py"
check_file "services/todo/app/models.py"
check_file "services/todo/app/schemas.py"
check_file "services/todo/app/crud.py"
check_file "services/todo/app/database.py"

# AI 서비스
check_file "services/ai/Dockerfile"
check_file "services/ai/pyproject.toml"
check_file "services/ai/app/main.py"
check_file "services/ai/app/agents.py"
check_file "services/ai/app/prompts.py"
check_file "services/ai/app/langraph_workflow.py"

echo -e "\n${YELLOW}3. 프론트엔드 애플리케이션${NC}"
echo "======================"

check_file "frontend/Dockerfile"
check_file "frontend/package.json"
check_file "frontend/tsconfig.json"
check_file "frontend/src/App.tsx"
check_file "frontend/src/index.tsx"
check_file "frontend/src/types/index.ts"

# 프론트엔드 컴포넌트
check_file "frontend/src/components/TodoList/TodoList.tsx"
check_file "frontend/src/components/TodoItem/TodoItem.tsx"
check_file "frontend/src/components/TodoForm/TodoForm.tsx"
check_file "frontend/src/components/AIAssistant/AIAssistant.tsx"

# 프론트엔드 서비스 및 훅
check_file "frontend/src/services/todoService.ts"
check_file "frontend/src/services/aiService.ts"
check_file "frontend/src/hooks/useTodos.ts"
check_file "frontend/src/hooks/useAI.ts"

echo -e "\n${YELLOW}4. 설정 검증${NC}"
echo "=========================="

# Docker Compose 문법 확인
if docker-compose config --quiet 2>/dev/null; then
    echo -e "${GREEN}✅${NC} docker-compose.yml 문법 유효"
else
    echo -e "${RED}❌${NC} docker-compose.yml 문법 리래"
fi

# Python 문법 확인
python_errors=0
for py_file in $(find services -name "*.py"); do
    if ! python3 -m py_compile "$py_file" 2>/dev/null; then
        echo -e "${RED}❌${NC} $py_file에서 Python 문법 오류"
        python_errors=$((python_errors + 1))
    fi
done

if [ $python_errors -eq 0 ]; then
    echo -e "${GREEN}✅${NC} 모든 Python 파일이 유효한 문법"
else
    echo -e "${RED}❌${NC} $python_errors개의 Python 문법 오류 발견"
fi

# 필수 의존성 확인
echo -e "\n${YELLOW}5. 사전 요구사항${NC}"
echo "==============="

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker가 설치됨"
else
    echo -e "${RED}❌${NC} Docker가 설치되지 않음"
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker Compose가 설치됨"
else
    echo -e "${RED}❌${NC} Docker Compose가 설치되지 않음"
fi

if [ -f ".env" ]; then
    echo -e "${GREEN}✅${NC} .env 파일 존재"
    if grep -q "OPENAI_API_KEY=sk-" ".env"; then
        echo -e "${GREEN}✅${NC} OpenAI API 키가 설정된 것 같음"
    else
        echo -e "${YELLOW}⚠️${NC}  .env에 OpenAI API 키가 설정되지 않음"
    fi
else
    echo -e "${YELLOW}⚠️${NC}  .env 파일이 생성되지 않음 (.env.example에서 복사)"
fi

echo -e "\n${YELLOW}6. 다음 단계${NC}"
echo "============"

if [ ! -f ".env" ]; then
    echo "1. Copy .env.example to .env: cp .env.example .env"
    echo "2. Edit .env and add your OpenAI API key"
fi

echo "3. Start the application: docker-compose up -d"
echo "4. Open http://localhost in your browser"
echo "5. Check service health:"
echo "   - Todo Service: http://localhost/api/todos/health"
echo "   - AI Service: http://localhost/api/ai/health"

echo -e "\n${GREEN}✅ 설정 검증 완료!${NC}"
echo "==============================="

echo -e "\n${YELLOW}📚 Documentation:${NC}"
echo "- README.md contains detailed setup instructions"
echo "- API documentation available at:"
echo "  - Todo Service: http://localhost:8001/docs"
echo "  - AI Service: http://localhost:8002/docs"