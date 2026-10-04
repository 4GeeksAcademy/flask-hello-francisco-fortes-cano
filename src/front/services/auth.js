export async function request(path, { body, token } = {}) {
  try {
    const response = await fetch(`/api${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: { message: 'No se pudo conectar con el servidor. Comprueba que Flask está iniciado y vuelve a intentarlo.' } };
  }
}
