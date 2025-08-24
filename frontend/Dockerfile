FROM node:22-alpine

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 애플리케이션 파일 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 개발 서버 시작
CMD ["npm", "start"]