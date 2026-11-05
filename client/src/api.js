let csrfToken;

async function getCsrfToken() {
  if (!csrfToken) {
    const response = await fetch('/api/csrf', { credentials: 'include' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo iniciar una sesión segura.');
    csrfToken = result.csrfToken;
  }
  return csrfToken;
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-CSRF-Token', await getCsrfToken());
  const response = await fetch(path, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  const result = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) throw new Error(result?.error || `La solicitud falló (${response.status}).`);
  if (result?.csrfToken) csrfToken = result.csrfToken;
  return result;
}

export function jsonRequest(method, body) {
  return { method, body: JSON.stringify(body) };
}

export function clearCsrfToken() {
  csrfToken = undefined;
}
