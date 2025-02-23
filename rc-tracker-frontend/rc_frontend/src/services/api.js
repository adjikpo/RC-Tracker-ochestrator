import axios from 'axios';

const API_URL = 'http://localhost:8000';

axios.defaults.withCredentials = true;

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/tracking/token/`, { username, password });
  return response.data;
};

export const getHabitudes = async (token) => {
  const response = await axios.get(`${API_URL}/tracking/habitudes/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addHabitude = async (token, habitude) => {
  const response = await axios.post(`${API_URL}/tracking/habitudes/`, habitude, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateHabitude = async (token, habitudeId, habitude) => {
  const response = await axios.put(`${API_URL}/tracking/habitudes/${habitudeId}/`, habitude, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addSuivi = async (token, suivi) => {
  const response = await axios.post(`${API_URL}/tracking/suivis/`, suivi, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSuivis = async (token) => {
  const response = await axios.get(`${API_URL}/tracking/suivis/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSections = async (token) => {
  const response = await axios.get(`${API_URL}/tracking/sections/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getGroupes = async (token) => {
  const response = await axios.get(`${API_URL}/tracking/groupes/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};