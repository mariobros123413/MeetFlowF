import axios from 'axios';

const api = axios.create({
  baseURL: 'https://meetflow-production.up.railway.app', // URL del backend
});

export default api;
