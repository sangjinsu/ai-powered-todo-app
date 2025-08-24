FROM python:3.13-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 빠른 Python 패키지 관리를 위한 uv 설치
RUN pip install uv

# 의존성 파일 복사
COPY pyproject.toml ./

# uv를 사용한 Python 의존성 설치
RUN uv pip install --system .

# 애플리케이션 코드 복사
COPY ./app ./app

# 포트 노출
EXPOSE 8002

# 애플리케이션 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"]