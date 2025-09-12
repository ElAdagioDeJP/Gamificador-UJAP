const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = options.token || localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || 'Error de servidor';
    throw new Error(msg);
  }
  return data;
}

export const gameService = {
  async getGameData() {
    const { data } = await request('/game');
    return data;
  },

  async completeMission(missionId) {
    const { data } = await request(`/missions/${missionId}/complete`, { method: 'POST' });
    return data;
  },

  async getLeaderboard() {
    const { data } = await request('/leaderboard');
    return data;
  },

  async updateProfile(profileData) {
    const { data } = await request('/user/profile', { method: 'PUT', body: profileData });
    return data;
  },
};
