import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { request } from '../services/auth';

export function Private() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!token) return;
    let active = true;
    setResult(null);
    request('/private', { token }).then(response => { if (active) setResult({ ...response, token }); });
    return () => { active = false; };
  }, [token, retry]);
  const current = result?.token === token ? result : null;
  const invalid = current && [401, 422].includes(current.status);
  useEffect(() => { if (invalid) logout(); }, [invalid, logout]);
  if (!token || invalid) return <Navigate to="/login" replace state={{ expired: Boolean(invalid) }} />;
  // Tener una cadena en el navegador no basta: Flask debe validar la firma.
  if (!current) return <section className="card" aria-busy="true"><p role="status">Comprobando tu sesión…</p></section>;
  if (!current.ok) return <section className="card"><h1>No pudimos cargar tu espacio</h1><p className="error" role="alert">{current.data.message}</p><button className="button" onClick={() => setRetry(x => x + 1)}>Reintentar</button></section>;
  return <section className="card private"><span className="badge">SESIÓN VERIFICADA</span><h1>Este es tu espacio.</h1>
    <p>Has entrado como <strong>{current.data.user.email}</strong>.</p><div className="private-content"><h2>Bienvenido a tu área privada</h2><p>{current.data.message}</p></div>
    <p className="muted">Puedes recargar esta página y seguir aquí mientras tu sesión esté vigente.</p>
    <button className="button secondary" onClick={() => { logout(); navigate('/'); }}>Cerrar sesión</button></section>;
}
