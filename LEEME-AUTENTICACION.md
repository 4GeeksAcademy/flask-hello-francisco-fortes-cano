# Autenticación con Flask y React

## Instalar en Codespaces

Coloca instalar-autenticacion.cjs en la raíz del repositorio y ejecuta:

```bash
node instalar-autenticacion.cjs --apply
pipenv install
pipenv run python scripts/setup_auth.py
pipenv run flask db upgrade
npm install
pipenv run python -m unittest discover -s tests
npm run lint
npm run build
```

El instalador no modifica la base de datos ni el .env. setup_auth.py añade la clave
JWT y las variables de Flask solo si faltan. Conserva DATABASE_URL y no muestra secretos.
La migración que venía en tu ZIP ya crea la tabla user; no necesitas generar otra.
No ejecutes reset_db ni borres migraciones.

Terminal 1 (dejar funcionando):

```bash
pipenv run start
```

Terminal 2 (dejar funcionando):

```bash
npm run start
```

Abre el puerto 3000 en la pestaña Ports. Las peticiones /api pasan a Flask a través
del proxy de Vite. No necesitas publicar el puerto 3001 ni cambiar VITE_BACKEND_URL.

## Comprobar desde el navegador

1. Abre /private sin sesión: debe ir a /login sin mostrar contenido privado.
2. Crea una cuenta en /signup. Debe mostrar la confirmación en /login.
3. Prueba un correo repetido y una contraseña incorrecta: muestra errores claros.
4. Inicia sesión: entra en /private y muestra tu correo.
5. Recarga /private: la sesión continúa si el JWT sigue vigente.
6. Cierra sesión: vuelve al inicio y elimina token de sessionStorage.
7. Con DevTools, escribe sessionStorage.setItem('token', 'inventado') y abre /private:
   Flask lo rechaza, se limpia el token y se vuelve al login.

El JWT caduca en una hora. Un fallo de conexión ofrece reintento sin borrar la sesión.
Cerrar sesión elimina el token del navegador; este ejercicio no incorpora una lista
de revocación de tokens en el servidor.

## API

- POST /api/signup: email y password. Crea la cuenta (201), sin iniciar sesión.
- POST /api/token (también /api/login): valida credenciales y devuelve access_token.
- GET /api/private: requiere Authorization: Bearer <token> y devuelve el usuario.

Las contraseñas se guardan como hashes de Werkzeug, nunca en texto plano.
Se desactiva el administrador público de ejemplo para no exponer los usuarios.
Los usuarios antiguos creados con contraseñas en texto plano no podrán iniciar sesión:
registra una cuenta nueva. No se elimina ningún usuario existente.

## Qué se entrega

Backend y pruebas en src/api, src/app.py y tests/test_auth.py. Frontend en
src/front/auth, src/front/pages/AuthForm.jsx, src/front/pages/Private.jsx y routes.jsx.
El resto de pantallas de ejemplo queda sin rutas. No se añaden dependencias.

El enlace del enunciado requiere iniciar sesión. La implementación sigue el texto
facilitado en la conversación: /signup, /login, /private, JWT y sessionStorage.
