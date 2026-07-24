import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Attach the JWT to every request automatically -- reads from localStorage
// set by AuthContext. Kept as a separate interceptor so components never
// have to think about auth headers manually.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
