# Proyecto Ateneo

Plataforma web para gestión de pagos, usuarios y calificaciones de un colegio. Incluye métodos de pago en línea (Mercado Pago, PSE) y offline (Nequi, DaviPlata, Pago en Secretaría).

## Características

- ✅ Autenticación JWT (estudiantes, profesores, administradores)
- ✅ Carrito de compras para mensualidades
- ✅ Múltiples métodos de pago (online y offline)
- ✅ Integración con Mercado Pago
- ✅ Gestión de órdenes en BD
- ✅ Notificaciones por correo (SMTP)
- ✅ Roles y permisos

## Stack Tecnológico

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT para autenticación
- Mercado Pago SDK

**Frontend:**
- React 18 + Vite
- React Router v6
- Axios para llamadas API
- Lucide React (iconos)

## Inicio Rápido

Ver [SETUP.md](SETUP.md) para instrucciones completas de instalación y configuración.

### Arranque local (5 min)

```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
# Editar .env con tus valores (especialmente DATABASE_URL)
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

El frontend estará en `http://localhost:5173` y el backend en `http://localhost:5000`.

## Estructura del Proyecto

```
backend/
├── config/          # Configuración de BD
├── controllers/     # Lógica de negocio
├── middleware/      # Autenticación, validaciones
├── models/          # Esquemas de BD
├── routes/          # Definición de rutas
├── utils/           # Mailer, helpers
└── server.js        # Punto de entrada

frontend/
├── src/
│   ├── components/  # Componentes reutilizables
│   ├── context/     # Auth, Cart contexts
│   ├── pages/       # Vistas principales
│   ├── services/    # API y payment integrations
│   └── utils/       # Helpers
└── vite.config.mjs  # Config de Vite
```

## Configuración de Mercado Pago

1. Crea cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Obtén tu `Access Token`
3. Copia en `backend/.env`:

```env
MP_ACCESS_TOKEN=APP_USR_...
```

## Mejoras Recientes

- ✅ CORS dinámico desde variables de entorno
- ✅ Webhook mejorado para procesar pagos de Mercado Pago
- ✅ Validaciones robustas en checkout
- ✅ Manejo mejorado de errores en frontend
- ✅ Interceptor de Axios para 401/403
- ✅ Archivos de configuración (.eslintrc, .gitignore)
- ✅ Documentación SETUP.md

## Próximos pasos recomendados

- [ ] Implementar panel de administración
- [ ] Agregar reportes de pagos
- [ ] Mejorar UX de confirmación de pago
- [ ] Implementar recuperación de contraseña
- [ ] Tests unitarios para rutas críticas
- [ ] Deploy automatizado (CI/CD)

## Notas para el Desarrollador

- El frontend usa `import.meta.env.VITE_*` para variables de entorno de Vite
- El backend necesita `DATABASE_URL` apuntando a PostgreSQL
- Sin `MP_ACCESS_TOKEN`, solo funcionan métodos offline
- Los códigos de invitación se validan en registro

## Licencia

Privado - Proyecto Ateneo

