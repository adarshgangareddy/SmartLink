import axios from 'axios';

// For local development use: http://localhost:8000
// For production use your EC2 Public IP or Domain
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL
});

export default api;
export { API_BASE_URL };
