# 5D Visual Building

De un plano PDF a un edificio 3D que se puede recorrer. React + Vite + Three.js + Supabase.

## 1. Base de datos (Supabase, una sola vez)

1. supabase.com → New project (región São Paulo).
2. SQL Editor → New query → pegá todo `supabase/setup.sql` → Run.
   Crea la tabla `docs`, permisos, el bucket `assets` y te deja como administrador (pabloperedo04@gmail.com).
3. Authentication → URL Configuration:
   - Site URL: tu dominio de Vercel (ej. https://5d-visual-building.vercel.app)
   - Redirect URLs: el mismo dominio y http://localhost:5173
4. Project Settings → API: copiá Project URL y anon public key.
5. Google (opcional): Authentication → Providers → Google, con tu Client ID/Secret de Google Cloud.

## 2. Correr en tu compu

```
cp .env.example .env      (y pegá la URL y la key)
npm install
npm run dev
```

## 3. Vercel

1. Subí la carpeta a GitHub.
2. vercel.com → Add New → Project → importá el repo.
3. Environment Variables: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Deploy. Cada push se publica solo.

## Permisos

- Cualquiera: ve edificios, catálogo y acabados publicados; puede pedir cotizaciones.
- Usuario con cuenta: su perfil privado (`data/users/<id>/...`).
- Administrador (tabla `admins`): carga planos, sube modelos, guarda acabados y amoblado para todos, ve perfiles y cotizaciones.
  Para sumar otro admin: `insert into admins select id from auth.users where email='correo@x.com';`

Sin variables de Supabase la app corre igual en modo invitado (todo se guarda en el navegador).
