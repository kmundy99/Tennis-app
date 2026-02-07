import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export const login = (phone_or_email) =>
  api.post('/auth/login', { phone_or_email });

export const register = (data) =>
  api.post('/auth/register', data);

export const deleteAccount = (player_id) =>
  api.delete('/auth/account', { data: { player_id } });

// Players
export const getAllPlayers = () =>
  api.get('/players');

export const getPlayer = (id) =>
  api.get(`/players/${id}`);

export const updatePlayer = (id, data) =>
  api.put(`/players/${id}`, data);

export const getPlayerMatches = (id) =>
  api.get(`/players/${id}/matches`);

// Matches
export const getMatches = (params) =>
  api.get('/matches', { params });

export const createMatch = (data) =>
  api.post('/matches', data);

export const getMatch = (id) =>
  api.get(`/matches/${id}`);

export const cancelMatch = (id, organizer_id) =>
  api.delete(`/matches/${id}`, { data: { organizer_id } });

export const joinMatch = (matchId, player_id) =>
  api.post(`/matches/${matchId}/join`, { player_id });

export const leaveMatch = (matchId, player_id) =>
  api.delete(`/matches/${matchId}/leave`, { data: { player_id } });

// Email
export const sendCustomEmail = (data) =>
  api.post('/email/send', data);

export default api;
