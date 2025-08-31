import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // The base URL of your Flask backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
