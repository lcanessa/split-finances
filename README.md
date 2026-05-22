# Split Finances

App web para control de finanzas en pareja. Permite registrar gastos diarios, dividir costos y llevar el balance entre dos personas.

## Stack

- React + Vite
- Tailwind CSS
- Lucide React
- Supabase (Auth + PostgreSQL)

## Configuración local

1. Clonar el repositorio e instalar dependencias:

```bash
npm install
```

2. Copiar variables de entorno:

```bash
cp .env.example .env
```

Completar en `.env`:

- `VITE_SUPABASE_URL` — Project URL de Supabase
- `VITE_SUPABASE_ANON_KEY` — clave **anon public** (JWT largo o `sb_publishable_...`)

3. Ejecutar migraciones SQL en Supabase (en orden):

- Tablas base (schema inicial)
- `supabase/rls-policies.sql`
- `supabase/migrations/add_daily_expense_fields.sql`

4. Crear un usuario en **Supabase → Authentication → Users**.

5. Iniciar la app:

```bash
npm run dev
```

## Deploy en Netlify

1. Conectar el repo de GitHub en Netlify.
2. El archivo `netlify.toml` ya define:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. En **Site configuration → Environment variables** agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Trigger deploy** después de guardar las variables.

Sin `publish = dist`, el sitio queda en blanco porque se sirve el `index.html` de desarrollo (sin el JS compilado).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |

## Estructura

```
src/
├── components/   # UI y formularios
├── pages/        # Pantallas por ruta
├── services/     # Llamadas a Supabase
├── context/      # Estado global (auth, usuarios)
├── hooks/
└── lib/          # Utilidades (evaluador matemático, etc.)
```
