# Guía de Configuración - Ateneo

## Requisitos previos

- Node.js 18+ y npm/yarn
- PostgreSQL 12+ (para la base de datos)
- (Opcional) Mercado Pago Account para pagos en línea
- (Opcional) Cuenta SMTP para notificaciones por correo

## Instalación rápida

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus valores
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Editar .env si es necesario
npm run dev
```

El frontend estará en `http://localhost:5173` y el backend en `http://localhost:5000`.

---

## Configuración de servicios

### PostgreSQL

Define `DATABASE_URL` en `.env`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/ateneo
```

Las tablas se crean automáticamente al iniciar el backend.

### Mercado Pago

1. Crea una cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Obtén tu `Access Token` (producción o test)
3. Copia en `backend/.env`:

```bash
MP_ACCESS_TOKEN=APP_USR_...
```

Los métodos de pago online (tarjeta, PSE) aprovecharán esta configuración automáticamente.

### SMTP para notificaciones

Si configuraste SMTP, especifica:

```bash
SMTP_HOST=smtp.gmail.com (o tu servidor)
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-o-app-key
SMTP_FROM="Ateneo <no-reply@ateneo.local>"
```

Sin configuración, el sistema usa Ethereal (pruebas) por defecto.

### Códigos de invitación

Para registros de profesor/admin:

```bash
TEACHER_INVITE_CODE=PROF123
ADMIN_INVITE_CODE=ADMIN123
ADMIN_SELF_REGISTRATION=false
```

---

## Rutas principales

### Frontend
- `/` - Landing page
- `/login` - Inicio de sesión
- `/register` - Registro
- `/carrito` - Carrito de compras
- `/checkout` - Confirmación de pago
- `/pago` - Seleccionar método de pago
- `/confirmacion-pago` - Resultado del pago

### Backend API
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/payments/checkout` - Crear orden de pago
- `GET /api/payments/orders/:reference` - Estado de la orden
- `POST /api/payments/webhook/mercadopago` - Webhook de MP (automático)
- `GET /api/health` - Health check

---

## Resolución de problemas

### CORS errors
- Verifica que `FRONTEND_URL` en backend coincida con la URL del frontend
- Revisa `EXTRA_ORIGINS` si tienes múltiples orígenes

### Pagos no se procesan
- Asegúrate de que `MP_ACCESS_TOKEN` es válido
- Revisa logs del backend con `npm run dev`

### Base de datos no conecta
- Verifica que PostgreSQL está corriendo
- Valida `DATABASE_URL` en `.env`

---

## Scripts útiles

### Backend
```bash
npm run dev         # Desarrollo con nodemon
npm run start       # Producción
npm run lint        # Verificar código
npm run lint:fix    # Arreglar linting automáticamente
```

### Frontend
```bash
npm run dev         # Desarrollo
npm run build       # Build para producción
npm run preview     # Preview del build
npm run lint        # Verificar código
npm run typecheck   # Type checking (TS)
```

---

Para preguntas o issues, contacta al equipo de desarrollo.
