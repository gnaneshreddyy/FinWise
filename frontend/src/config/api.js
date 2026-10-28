// Always same-origin: Vercel serves /api in production and Vite proxies it to backend/server.js in development.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
