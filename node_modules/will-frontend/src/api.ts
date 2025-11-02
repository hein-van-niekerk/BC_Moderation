import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export function getToken() { return localStorage.getItem('token'); }

export function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const api = axios.create({ baseURL: API_URL });
