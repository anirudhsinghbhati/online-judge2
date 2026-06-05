const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function requestJson(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload.data;
}