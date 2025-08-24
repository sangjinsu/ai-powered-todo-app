import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';
import App from './App';
import { performanceMonitor } from './lib/performance';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Track initial page load performance
const pageLoadStart = performance.now();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Track React hydration/render performance
setTimeout(() => {
  performanceMonitor.trackCustomMetric('REACT_RENDER', pageLoadStart);
}, 0);