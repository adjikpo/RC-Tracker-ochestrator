// src/services/api.js
import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

axios.defaults.withCredentials = true;

export const login = async (username, password) => {
  const response = await axios.post(`${BASE_URL}/tracking/token/`, { username, password });
  console.log('Réponse login:', response.data);
  sessionStorage.setItem('access_token', response.data.access);
  return response.data;
};

export const getUserMe = async () => {
  const token = sessionStorage.getItem('access_token');
  console.log('Requête à /tracking/users/me/ avec token:', token);
  if (!token) throw new Error('No access token found');
  const response = await axios.get(`${BASE_URL}/tracking/users/me/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Réponse userMe:', response.data);
  return response.data;
};

export const getHabitudes = async () => {
  const token = sessionStorage.getItem('access_token');
  const response = await axios.get(`${BASE_URL}/tracking/habitudes/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addHabitude = async (habitude) => {
  const token = sessionStorage.getItem('access_token');
  const response = await axios.post(`${BASE_URL}/tracking/habitudes/`, habitude, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateHabitude = async (habitudeId, habitude) => {
  const token = sessionStorage.getItem('access_token');
  const response = await axios.put(`${BASE_URL}/tracking/habitudes/${habitudeId}/`, habitude, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteHabitude = async (habitudeId) => {
  const token = sessionStorage.getItem('access_token');
  const response = await axios.delete(`${BASE_URL}/tracking/habitudes/${habitudeId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addSuivi = async (suivi) => {
  const token = sessionStorage.getItem('access_token');
  const response = await axios.post(`${BASE_URL}/tracking/suivis/`, suivi, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateSuivi = async (suiviId, suivi) => {
  const token = sessionStorage.getItem('access_token');
  const response = await axios.put(`${BASE_URL}/tracking/suivis/${suiviId}/`, suivi, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSuivis = async () => {
  const token = sessionStorage.getItem('access_token');
  const response = await axios.get(`${BASE_URL}/tracking/suivis/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSections = async () => {
  const token = sessionStorage.getItem('access_token');
  const response = await axios.get(`${BASE_URL}/tracking/sections/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getGroupes = async () => {
  const token = sessionStorage.getItem('access_token');
  const response = await axios.get(`${BASE_URL}/tracking/groupes/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};