import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { request } from '../services/auth';

export function AuthForm({ mode }) {
  // La clave reinicia campos y avisos al cambiar entre registro e inicio.
  return <Form key={mode} signup={mode === 'signup'} />;
}
function Form({ signup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    const result = await request(signup ? '/signup' : '/token', { body: { email, password } });
    setBusy(false);
    if (!result.ok) { setError(result.data.message || 'No se pudo completar la solicitud.'); return; }
    if (signup) { navigate('/login', { replace: true, state: { registered: true } }); return; }
    login(result.data.access_token);
    navigate('/private', { replace: true });
  }
  return <section className="card"><p className="eyebrow">{signup ? 'TU PRIMER PASO' : 'QUÉ BUENO VERTE'}</p>
    <h1>{signup ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h1>
    <p className="muted">{signup ? 'Un correo, una contraseña y tu propio espacio.' : 'Introduce tus datos para continuar.'}</p>
    {!signup && location.state?.registered && <p className="notice" role="status">Cuenta creada. Inicia sesión con tus datos.</p>}
    {!signup && location.state?.expired && <p className="notice" role="status">Tu sesión ha caducado o no es válida. Vuelve a entrar.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    <form onSubmit={handleSubmit} aria-busy={busy}>
      <label htmlFor="email">Correo electrónico</label><input id="email" type="email" autoComplete="email" required maxLength={120} value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
      <label htmlFor="password">Contraseña</label><div className="password"><input id="password" type={visible ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : undefined} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} aria-describedby={signup ? 'password-help' : undefined} />
      <button type="button" className="reveal" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Ocultar' : 'Mostrar'}</button></div>
      {signup && <small id="password-help">Entre 8 y 128 caracteres.</small>}
      <button className="button submit" disabled={busy}>{busy ? 'Un momento…' : signup ? 'Crear cuenta' : 'Iniciar sesión'}</button>
    </form><p className="switch">{signup ? '¿Ya tienes cuenta?' : '¿Es tu primera vez?'} <Link to={signup ? '/login' : '/signup'}>{signup ? 'Inicia sesión' : 'Crea tu cuenta'}</Link></p>
  </section>;
}
