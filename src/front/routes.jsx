import { createBrowserRouter, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AuthForm } from './pages/AuthForm';
import { Private } from './pages/Private';

function Layout() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  return <><header className="topbar"><Link className="brand" to="/">◈ Acceso</Link>
    <nav aria-label="Navegación principal">{token ? <>
      <Link to="/private">Mi espacio</Link><button className="button secondary" onClick={() => { logout(); navigate('/'); }}>Cerrar sesión</button>
    </> : <><Link to="/login">Iniciar sesión</Link><Link className="button" to="/signup">Crear cuenta</Link></>}</nav>
  </header><main><Outlet /></main><footer>Tu cuenta. Tu espacio.</footer></>;
}
function Home() {
  const { token } = useAuth();
  return <section className="hero"><p className="eyebrow">UN ESPACIO PARA TI</p><h1>Todo empieza<br />con tu cuenta.</h1>
    <p className="intro">Crea tu cuenta y entra en tu espacio personal. Sencillo, desde el primer paso.</p>
    <div className="actions"><Link className="button" to={token ? '/private' : '/signup'}>{token ? 'Entrar en mi espacio' : 'Crear mi cuenta'} <span aria-hidden="true">↗</span></Link>
    {!token && <Link to="/login">Ya tengo una cuenta →</Link>}</div>
    <div className="feature-grid"><article><span>01</span><h2>Crea tu cuenta</h2><p>Solo necesitas tu correo y una contraseña.</p></article>
    <article><span>02</span><h2>Entra a tu espacio</h2><p>Tu contenido personal, al iniciar sesión.</p></article>
    <article><span>03</span><h2>Tú decides cuándo salir</h2><p>Cierra la sesión desde cualquier pantalla.</p></article></div>
  </section>;
}
function NotFound() { return <section className="card"><h1>Página no encontrada</h1><Link to="/">Volver al inicio</Link></section>; }
export const router = createBrowserRouter([{ element: <Layout />, children: [
  { path: '/', element: <Home /> }, { path: '/signup', element: <AuthForm mode="signup" /> },
  { path: '/login', element: <AuthForm mode="login" /> }, { path: '/private', element: <Private /> },
  { path: '*', element: <NotFound /> }
]}]);
