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

  async getSubjects() {
    const { data } = await request('/teacher/subjects');
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

  async createMission(mission) {
    const { data } = await request('/teacher/missions', { method: 'POST', body: mission });
    return data;
  },

  async listMissions(type = 'NORMAL') {
    const { data } = await request(`/teacher/missions?type=${type === 'DIARIA' ? 'DIARIA' : 'NORMAL'}`);
    return data;
  },

  async listPendingSubmissions(missionId = null) {
    const qs = missionId ? `?missionId=${missionId}` : '';
    const { data } = await request(`/teacher/missions/pending${qs}`);
    return data;
  },

  async approveMissionSubmission(missionId, studentId) {
    const { data } = await request(`/teacher/missions/${missionId}/students/${studentId}/approve`, { method: 'POST' });
    return data;
  },

  async rejectMissionSubmission(missionId, studentId) {
    const { data } = await request(`/teacher/missions/${missionId}/students/${studentId}/reject`, { method: 'POST' });
    return data;
  },
  // Assignments convenience API (map to missions)
  async createAssignment(payload) {
    // payload: { title, description, dueDate, points, difficulty, subjectId }
    const body = {
      title: payload.title,
      description: payload.description,
      type: 'NORMAL',
      points: payload.points || 0,
      difficulty: payload.difficulty || 'medium',
      subjectId: payload.subjectId || null,
    };
    const { data } = await request('/teacher/assignments', { method: 'POST', body });
    return data;
  },

  async updateAssignment(missionId, payload) {
    const { data } = await request(`/teacher/assignments/${missionId}`, { method: 'PUT', body: payload });
    return data;
  },

  async deleteAssignment(missionId) {
    const { data } = await request(`/teacher/assignments/${missionId}`, { method: 'DELETE' });
    return data;
  },
  async enrollStudentToSubject(subjectId, studentId) {
    const { data } = await request(`/teacher/subjects/${subjectId}/students`, { method: 'POST', body: { studentId } });
    return data;
  },

  async unenrollStudentFromSubject(subjectId, studentId) {
    const { data } = await request(`/teacher/subjects/${subjectId}/students/${studentId}`, { method: 'DELETE' });
    return data;
  },
};
