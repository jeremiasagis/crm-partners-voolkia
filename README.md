# Voolkia CRM — Programa de Partners Estratégicos

CRM interno de Voolkia S.A. para gestionar partners (agencias/consultoras que refieren oportunidades) y el pipeline comercial asociado.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (tema custom Voolkia)
- Supabase (Postgres + Auth + Storage + RLS)
- TanStack Query · react-hook-form + zod · date-fns (es-AR)
- Recharts · dnd-kit · sonner · lucide-react

## Setup local

1. Cloná el repo e instalá dependencias:

   ```bash
   npm install
   ```

2. Copiá `.env.example` a `.env.local` y completá las credenciales de Supabase
   (Dashboard → Settings → API):

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo server-side)

3. Corré la migración: pegá `supabase/migrations/001_init.sql` en el SQL Editor
   de Supabase y ejecutalo.

4. (Opcional, solo desarrollo) Cargá datos de ejemplo con `supabase/seed.sql`.
   Para limpiarlos: `select public.clean_seed_data();`

5. Creá el primer usuario admin: Supabase Dashboard → Authentication → Users →
   Add user (con email + password, confirmado). El profile se crea solo.

6. Levantá el dev server:

   ```bash
   npm run dev
   ```

## Deploy

Vercel — configurar las tres env vars en el proyecto. `main` deploya a producción.

## Estructura

- `app/(auth)/login` — login (Supabase Auth)
- `app/(app)/…` — secciones protegidas (dashboard, partners, contactos, oportunidades, actividades, configuración)
- `lib/supabase/` — clientes browser/server/middleware + admin
- `supabase/migrations/` — SQL del schema (correr a mano en Supabase)
- `components/ui/` — shadcn/ui · `components/layout/` — sidebar/header
