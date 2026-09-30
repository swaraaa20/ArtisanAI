import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.0.182:8001',
  timeout: 10000,
});

console.log('API BASE URL:', API.defaults.baseURL);

export default API;