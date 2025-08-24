# Product Requirements Document

## TODO 리스트 with AI 추천 (학습용)

### 1. 프로젝트 개요

#### 1.1 목적

MSA(Microservice Architecture) 기반의 AI 지원 TODO 리스트 애플리케이션을 구현하여 현대적인 웹 아키텍처와 AI 통합을 학습합니다. 
사용자 지정 브랜드 컬러 시스템과 접근성 우선 설계로 전문적이고 현대적인 사용자 경험을 제공합니다.

#### 1.2 학습 목표

- MSA 아키텍처 설계 및 구현
- Docker Compose를 통한 컨테이너 오케스트레이션
- NGINX를 활용한 API Gateway 구성
- LangGraph를 이용한 AI 워크플로우 구현
- React와 FastAPI 연동
- 접근성 우선 UI/UX 설계 및 WCAG 2.1 AA 준수
- 브랜드 컬러 시스템 구현 및 다크 모드 지원
- CSS Custom Properties와 Tailwind CSS 확장

### 2. 기술 스택

| 구분         | 기술           | 버전   | 용도                      |
| ------------ | -------------- | ------ | ------------------------- |
| **Backend**  | Python         | 3.13+  | 서버 언어                 |
|              | FastAPI        | Latest | REST API 프레임워크       |
|              | uv             | Latest | 패키지 관리               |
|              | LangGraph      | 0.6+   | AI 워크플로우             |
| **Frontend** | React          | 18+    | UI 프레임워크             |
|              | TypeScript     | 5+     | 타입 안정성               |
|              | Tailwind CSS   | 3.3+   | 유틸리티 우선 CSS 프레임워크 |
|              | Radix UI       | Latest | 접근성 우선 UI 컴포넌트   |
|              | Lucide React   | Latest | 아이콘 라이브러리         |
|              | Axios          | Latest | HTTP 클라이언트           |
| **Database** | PostgreSQL     | 16+    | 주 데이터베이스           |
|              | Redis          | 7+     | 캐싱 및 세션              |
| **Infra**    | Docker Compose | Latest | 컨테이너 오케스트레이션   |
|              | NGINX          | Latest | API Gateway/Reverse Proxy |

### 2.1 브랜드 디자인 시스템

#### 2.1.1 컬러 팔레트

**핵심 브랜드 컬러 (블루-틸 하모니)**:
- **Primary Blue (#5585b5)**: `hsl(208, 34%, 53%)` - 주요 액션, CTA 버튼
- **Teal (#53a8b6)**: `hsl(188, 40%, 52%)` - 보조 액션, 진행 상태
- **Light Teal (#79c2d0)**: `hsl(190, 48%, 65%)` - 강조, 완료 상태
- **Very Light Teal (#bbe4e9)**: `hsl(187, 50%, 82%)` - 배경, 서피스

**시맨틱 컬러**:
- **우선순위 매핑**: 1(성공 그린) → 2(브랜드 억센트) → 3(브랜드 프라이머리) → 4(오렌지) → 5(레드)
- **상태 매핑**: TODO(프라이머리) → DOING(세컨더리) → DONE(억센트)
- **접근성**: WCAG 2.1 AA 표준 준수 (4.5:1 최소 대비율)

#### 2.1.2 다크 모드 지원

자동 다크 모드 적응으로 향상된 대비율과 시각적 편안함 제공:
- Primary Blue → `hsl(208, 42%, 63%)` (라이트 모드 대비 명도 증가)
- 모든 브랜드 컬러의 다크 모드 변형 자동 생성
- CSS Custom Properties를 통한 실시간 테마 전환

#### 2.1.3 접근성 기능

- **WCAG 2.1 AA 준수**: 모든 텍스트-배경 조합 4.5:1 이상 대비율
- **키보드 내비게이션**: 완전한 키보드 접근성
- **스크린 리더 최적화**: 의미론적 HTML과 ARIA 속성
- **색상 독립적 정보 전달**: 컬러와 함께 텍스트/아이콘 레이블 제공

### 3. MSA 아키텍처

```
┌──────────────────────────────────────────────┐
│            React Frontend (Port 3000)         │
└──────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│         NGINX API Gateway (Port 80)          │
│                                              │
│  Routes:                                     │
│  - /api/todos → Todo Service                │
│  - /api/ai → AI Service                     │
└──────────────────────────────────────────────┘
                        │
                ┌───────┴───────┐
                ▼               ▼
        ┌──────────────┐ ┌──────────────┐
        │Todo Service  │ │AI Service    │
        │(Port 8001)   │ │(Port 8002)   │
        │              │ │              │
        │- CRUD 작업   │ │- AI 추천     │
        │- 상태 관리   │ │- 작업 분석   │
        │- 필터/검색   │ │- NLP 처리    │
        └──────────────┘ └──────────────┘
                │               │
                └───────┬───────┘
                        ▼
        ┌───────────────────────────────┐
        │     Shared Resources          │
        ├───────────────────────────────┤
        │ PostgreSQL │ Redis            │
        │ (Port 5432)│ (Port 6379)      │
        └───────────────────────────────┘
```

### 4. 핵심 기능 (간단 버전)

#### 4.1 사용자 인터페이스 스크린샷

**AI 분석 결과 화면**
![AI 분석 결과](./ai-result.png)
*LangGraph 기반 AI가 할 일을 분석하여 우선순위, 카테고리, 예상 시간을 추천하고 신뢰도 점수를 표시*

**메인 대시보드**
![대시보드](./dashboard.png)
*브랜드 컬러 시스템이 적용된 통계 대시보드와 필터 기능, AI 어시스턴트 인터페이스*

#### 4.2 기본 TODO 기능 (향상됨)

- **작업 생성/읽기/수정/삭제 (CRUD)**: 브랜드 컬러 시스템 적용
- **작업 상태 변경**: TODO → DOING → DONE (시각적 상태 표시기 개선)
- **작업 목록 조회 및 필터링**: 향상된 필터 UI와 실시간 검색
- **작업 우선순위 설정**: 컬러 코딩된 우선순위 레벨 (1-5)
- **통계 대시보드**: 실시간 작업 통계 및 완료율 추적
- **접근성 최적화**: 키보드 내비게이션, 스크린 리더 지원

#### 4.3 AI 기능 (LangGraph 활용) - 향상됨

- **작업 우선순위 자동 추천**: ML 기반 지능형 우선순위 설정
- **자연어로 TODO 생성**: "내일까지 보고서 작성하기" → 구조화된 작업 데이터
- **작업 카테고리 자동 분류**: 업무/개인/학습/건강/재정/기타 6개 카테고리
- **예상 소요 시간 추정**: 과거 데이터 기반 시간 예측
- **배치 분석**: 여러 작업 동시 분석 및 생산성 인사이트
- **AI 신뢰도 점수**: 각 추천에 대한 신뢰도 표시 (80-95%)
- **향상된 UI**: 그라디언트 배경과 시각적 피드백이 있는 AI 어시스턴트

### 5. 서비스별 상세 설계

#### 5.1 Todo Service (Port 8001)

**엔드포인트:**

- `GET /todos` - TODO 목록 조회
- `POST /todos` - TODO 생성
- `GET /todos/{id}` - TODO 상세 조회
- `PUT /todos/{id}` - TODO 수정
- `DELETE /todos/{id}` - TODO 삭제
- `PATCH /todos/{id}/status` - 상태 변경

**데이터 모델:**

```python
class Todo:
    id: UUID
    title: str
    description: str | None
    status: Literal["TODO", "DOING", "DONE"]
    priority: int  # 1-5
    category: str | None
    estimated_time: int | None  # minutes
    created_at: datetime
    updated_at: datetime
```

#### 5.2 AI Service (Port 8002)

**엔드포인트:**

- `POST /ai/parse` - 자연어 파싱
- `POST /ai/recommend-priority` - 우선순위 추천
- `POST /ai/categorize` - 카테고리 분류
- `POST /ai/estimate-time` - 시간 추정

**LangGraph 워크플로우:**

```python
# 간단한 AI 워크플로우 예시
1. 입력 분석 노드
   └─> 자연어 파싱

2. 처리 노드
   ├─> 우선순위 계산
   ├─> 카테고리 분류
   └─> 시간 추정

3. 응답 노드
   └─> 결과 반환
```

### 6. 데이터베이스 스키마

#### PostgreSQL

```sql
-- todos 테이블
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'TODO',
    priority INTEGER DEFAULT 3,
    category VARCHAR(50),
    estimated_time INTEGER,
    ai_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ai_recommendations 테이블 (추천 이력)
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    todo_id UUID REFERENCES todos(id),
    recommendation_type VARCHAR(50),
    recommendation_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Docker Compose 구성

```yaml
version: "3.9"

services:
  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: todo-frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - todo-network

  # Todo Service
  todo-service:
    build:
      context: ./services/todo
      dockerfile: Dockerfile
    container_name: todo-service
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/tododb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./services/todo:/app
    networks:
      - todo-network

  # AI Service
  ai-service:
    build:
      context: ./services/ai
      dockerfile: Dockerfile
    container_name: ai-service
    ports:
      - "8002:8002"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/tododb
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./services/ai:/app
    networks:
      - todo-network

  # NGINX API Gateway
  nginx:
    image: nginx:alpine
    container_name: nginx-gateway
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - todo-service
      - ai-service
      - frontend
    networks:
      - todo-network

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: postgres-db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=tododb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - todo-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - todo-network

volumes:
  postgres_data:
  redis_data:

networks:
  todo-network:
    driver: bridge
```

### 8. NGINX 설정

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream todo_service {
        server todo-service:8001;
    }

    upstream ai_service {
        server ai-service:8002;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Todo Service API
        location /api/todos {
            proxy_pass http://todo_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # AI Service API
        location /api/ai {
            proxy_pass http://ai_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

### 9. 프로젝트 구조

```
todo-ai-app/
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   └── public/
├── services/
│   ├── todo/
│   │   ├── Dockerfile
│   │   ├── pyproject.toml
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   ├── crud.py
│   │   │   └── database.py
│   │   └── requirements.txt
│   └── ai/
│       ├── Dockerfile
│       ├── pyproject.toml
│       ├── app/
│       │   ├── main.py
│       │   ├── langraph_workflow.py
│       │   ├── agents.py
│       │   └── prompts.py
│       └── requirements.txt
└── init.sql
```

### 10. 개발 순서 (학습 로드맵)

#### Step 1: 기본 환경 설정 (1주차)

1. Docker Compose 환경 구성
2. PostgreSQL, Redis 설정
3. NGINX 기본 설정

#### Step 2: Todo Service 구현 (2주차)

1. FastAPI 기본 CRUD API 구현
2. PostgreSQL 연동
3. Redis 캐싱 적용

#### Step 3: Frontend 구현 (3주차)

1. React 프로젝트 설정
2. TODO 컴포넌트 개발
3. API 연동

#### Step 4: AI Service 구현 (4주차)

1. LangGraph 워크플로우 설계
2. OpenAI API 연동
3. 자연어 처리 기능 구현

#### Step 5: 통합 및 최적화 (5주차)

1. 서비스 간 통신 최적화
2. 에러 처리
3. 로깅 및 모니터링

### 11. 주요 학습 포인트

- **MSA 패턴**: 서비스 분리, 독립적 배포
- **API Gateway**: NGINX를 통한 라우팅
- **컨테이너화**: Docker를 통한 환경 일관성
- **AI 통합**: LangGraph를 활용한 AI 워크플로우
- **데이터베이스**: PostgreSQL과 Redis 활용
- **REST API**: FastAPI를 통한 API 설계

### 12. 실행 방법

```bash
# 1. 환경 변수 설정
export OPENAI_API_KEY="your-api-key"

# 2. Docker Compose 실행
docker-compose up -d

# 3. 데이터베이스 초기화 (자동)

# 4. 브라우저에서 접속
# http://localhost

# 5. 로그 확인
docker-compose logs -f [service-name]

# 6. 종료
docker-compose down
```
