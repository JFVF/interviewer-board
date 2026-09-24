const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  interviewers: {
    list: () => request('/interviewers'),
    create: (data) => request('/interviewers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/interviewers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/interviewers/${id}`, { method: 'DELETE' }),
    importCsv: (file) => {
      const form = new FormData();
      form.append('file', file);
      return request('/interviewers/import', { method: 'POST', body: form });
    },
  },
  candidates: {
    list: () => request('/candidates'),
    create: (data) => request('/candidates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id, status) =>
      request(`/candidates/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    remove: (id) => request(`/candidates/${id}`, { method: 'DELETE' }),
  },
};
