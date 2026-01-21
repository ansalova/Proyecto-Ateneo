# Proyecto Ateneo

Aplicación web con backend en Node/Express y frontend en React/Vite.

## Estructura
- backend/ — API y lógica de servidor
- frontend/ — Aplicación web (React)
- .gitignore — Exclusiones (node_modules, dist, .vscode, .env)
- README.md — Información del proyecto
- LICENSE — Licencia del proyecto

## Requisitos
- Node.js 18+
- PostgreSQL (variable `DATABASE_URL`)

## Variables de entorno (backend)
- `PORT` (por defecto 5000)
- `HOST` (por defecto 127.0.0.1)
- `FRONTEND_URL` (por defecto http://127.0.0.1:5173)
- `BACKEND_URL` (por defecto http://127.0.0.1:5000)
- `DATABASE_URL` cadena de conexión a PostgreSQL
- `JWT_SECRET` secreto para firmas de JWT
- `MP_ACCESS_TOKEN` token para pagos en Mercado Pago (opcional)

Crea un archivo `.env` dentro de `backend/` con estos valores.

## Desarrollo

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

## Scripts útiles
- Lint: `npm run lint` (en backend y frontend)
- Typecheck: `npm run typecheck` (en backend y frontend)

## Pagos
La integración de Mercado Pago usa Checkout Pro con `back_urls` y `notification_url`. Configura `MP_ACCESS_TOKEN` si quieres habilitar pagos online.

## Licencia
Ver archivo `LICENSE`.
