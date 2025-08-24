-- 데이터베이스가 존재하지 않을 경우 생성
-- 참고: 데이터베이스 생성은 docker-compose의 POSTGRES_DB 환경변수에 의해 처리됨

-- UUID 생성을 위한 UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- todos 테이블 생성
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'TODO' CHECK (status IN ('TODO', 'DOING', 'DONE')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    category VARCHAR(50),
    estimated_time INTEGER, -- 분 단위
    ai_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI 추천 기록을 추적하기 위한 ai_recommendations 테이블 생성
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    recommendation_value JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 쿼리 성능 향상을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_todo_id ON ai_recommendations(todo_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);

-- updated_at 타임스탬프 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트를 위한 트리거 생성
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 테스트용 샘플 데이터 삽입 (선택사항)
INSERT INTO todos (title, description, status, priority, category, estimated_time) VALUES
    ('Setup Development Environment', 'Install Docker, Node.js, and Python dependencies', 'DONE', 5, 'Setup', 30),
    ('Design Database Schema', 'Create PostgreSQL tables for todos and recommendations', 'DONE', 4, 'Database', 45),
    ('Implement Todo API', 'Create FastAPI endpoints for CRUD operations', 'DOING', 4, 'Backend', 120),
    ('Build React Frontend', 'Create user interface with React and TypeScript', 'TODO', 3, 'Frontend', 180),
    ('Integrate AI Service', 'Connect LangGraph for intelligent recommendations', 'TODO', 3, 'AI', 90)
ON CONFLICT DO NOTHING;