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

export const subjectService = {
  async getMySubjects() {
    const { data } = await request('/subjects');
    return data;
  },
  async getTeacherSubjects() {
    const { data } = await request('/teacher/subjects');
    return data;
  },
  async getAllSubjects() {
    const { data } = await request('/admin/subjects');
    return data;
  },
  async createSubject(subjectData) {
    const { data } = await request('/admin/subjects', {
      method: 'POST',
      body: subjectData
    });
    return data;
  },
  async updateSubject(subjectId, subjectData) {
    const { data } = await request(`/admin/subjects/${subjectId}`, {
      method: 'PUT',
      body: subjectData
    });
    return data;
  },
  async deleteSubject(subjectId) {
    const { data } = await request(`/admin/subjects/${subjectId}`, {
      method: 'DELETE'
    });
    return data;
  }
};
