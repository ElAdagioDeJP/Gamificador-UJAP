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

export const teacherService = {
  async getStudents() {
    const { data } = await request('/teacher/students');
    return data;
  },

  async getAssignments() {
    const { data } = await request('/teacher/assignments');
    return data;
  },

  async getSubmissions(assignmentId = null) {
    const qs = assignmentId ? `?assignmentId=${assignmentId}` : '';
    const { data } = await request(`/teacher/submissions${qs}`);
    return data;
  },

  async gradeSubmission(submissionId, grade, feedback) {
    const { data } = await request(`/teacher/submissions/${submissionId}/grade`, { method: 'POST', body: { grade, feedback } });
    return data;
  },

  async getTeacherStats() {
    const { data } = await request('/teacher/stats');
    return data;
  },
};
