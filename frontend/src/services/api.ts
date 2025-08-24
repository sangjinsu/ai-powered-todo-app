import axios from 'axios';

// 기본 설정으로 axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 로깅을 위한 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 로깅 및 오류 처리를 위한 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status} 오류:`, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;