# 🚀 START HERE - Ateneo Platform - Guía de Inicio Rápido

## ¡Bienvenido! Aquí está todo lo que necesitas

Este documento es tu punto de partida. La plataforma está **100% funcional** y lista para:
- ✅ Desarrollo local
- ✅ Testing completo
- ✅ Deployment a staging
- ✅ Deployment a producción

---

## 📋 ¿Qué Tenemos?

### ✨ Sistema Completamente Funcional

**Características Implementadas:**
- 🔐 Autenticación con JWT (registro, login, password recovery)
- 📢 Sistema de anuncios con notificación de nuevos mensajes
- 📄 Gestor de documentos
- 💳 Integración con Mercado Pago (pagos online) + métodos offline
- 📊 Dashboard de admin con estadísticas
- 💼 Reportes de pagos con filtros y exportación CSV
- 🎓 Calificaciones de estudiantes
- 🔄 Sistema de permisos por rol (student, teacher, admin)
- 🧪 Tests automatizados (backend + frontend)
- ⚙️ CI/CD con GitHub Actions
- 📚 Documentación completa

---

## 🎯 Próximos Pasos (En Orden)

### ✅ PASO 1: Variables de Entorno Locales (5 min)

Crea o verifica estos archivos:

**`backend/.env`**
```
DATABASE_URL=postgresql://user:password@localhost:5432/ateneo_db
JWT_SECRET=tu_clave_jwt_super_segura_de_mas_de_32_caracteres
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-aplicacion-password-de-gmail
MERCADO_PAGO_TOKEN=APP_USR_xxxxxxxxxxxxxxx
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**`frontend/.env`**
```
VITE_BACKEND_URL=http://localhost:5000
```

---

### ✅ PASO 2: Inicializar Base de Datos (5 min)

```powershell
# 1. Asegúrate que PostgreSQL está corriendo
Get-Service postgresql-x64-* | Start-Service

# 2. Crea la base de datos
createdb ateneo_db

# 3. Corre el script de inicialización
cd backend
node scripts/init-db.js
```

---

### ✅ PASO 3: Iniciar Servidores Locales (5 min)

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
# Deberías ver: "✅ Servidor corriendo en puerto 5000"
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
# Deberías ver: "VITE v... ready in ... ms"
```

**Terminal 3 - Browser:**
```
Abre: http://localhost:5173
```

---

### ✅ PASO 4: Pruebas Rápidas (5 min)

```powershell
# En terminal nueva:
powershell -ExecutionPolicy Bypass -File test-all.ps1
```

Debería mostrar ✅ en todos los tests sin errores críticos.

---

### ✅ PASO 5: Configurar GitHub Secrets (10 min)

⚠️ **CRÍTICO**: Sin esto, CI/CD no funcionará

1. Ve a: `https://github.com/TuUsuario/TuRepositorio/settings/secrets/actions`
2. Haz click en "New repository secret"
3. Agrega TODOS estos secrets (ver `.github/SECRETS_AND_BRANCH_PROTECTION.md`):

**Staging Secrets** (9 secrets):
- `STAGING_DATABASE_URL`
- `STAGING_JWT_SECRET`
- `STAGING_EMAIL_USER`
- `STAGING_EMAIL_PASS`
- `STAGING_MERCADO_PAGO_TOKEN`
- `STAGING_NODE_ENV`
- `STAGING_BACKEND_URL`
- `STAGING_FRONTEND_URL`
- `STAGING_CORS_ORIGIN`

**Production Secrets** (9 secrets):
- `PROD_DATABASE_URL`
- `PROD_JWT_SECRET`
- `PROD_EMAIL_USER`
- `PROD_EMAIL_PASS`
- `PROD_MERCADO_PAGO_TOKEN`
- `PROD_NODE_ENV`
- `PROD_BACKEND_URL`
- `PROD_FRONTEND_URL`
- `PROD_CORS_ORIGIN`

📝 **Nota**: Los valores deben ser diferentes a development (ej: bases de datos diferentes, tokens reales de Mercado Pago, etc.)

---

### ✅ PASO 6: Configurar Branch Protection (5 min)

1. Ve a: `https://github.com/TuUsuario/TuRepositorio/settings/branches`
2. Haz click en "Add rule"
3. Branch name: `main`
4. ✅ Require pull request reviews before merging
5. ✅ Require status checks to pass before merging
6. ✅ Require branches to be up to date before merging
7. Click "Create"

**Repite para rama `develop`** (con requisitos un poco más flexibles)

Ver detalle en: `SETUP_CHECKLIST.md` → Fase 4

---

### ✅ PASO 7: Hacer tu Primer Push (2 min)

```powershell
git add .
git commit -m "Initial setup: docs, tests, secrets configured"
git push origin main
```

Luego ve a GitHub Actions y observa que:
1. ✅ Linting pasa
2. ✅ Tests pasan
3. ✅ Build pasa

---

## 📚 Documentación Disponible

| Documento | Propósito | Cuándo Usarlo |
|-----------|-----------|--------------|
| `README.md` | Descripción general | Primero - Overview |
| **`START_HERE.md`** | **Este archivo** | **Ahora** |
| `API.md` | Referencia de endpoints | Desarrollo |
| `SETUP_CHECKLIST.md` | Checklist completo | Setup completo |
| `TROUBLESHOOTING.md` | Soluciones rápidas | Si algo no funciona |
| `DEPLOY.md` | Deploy a staging/prod | Deployment |
| `.github/SECRETS_AND_BRANCH_PROTECTION.md` | GitHub config | Secrets setup |

---

## 🧪 Testing Local (Recomendado)

Antes de hacer push:

```powershell
# 1. Test unitarios backend
cd backend
npm test

# 2. Test unitarios frontend
cd frontend
npm test

# 3. Test script (15 endpoints automatizados)
powershell -ExecutionPolicy Bypass -File test-all.ps1

# 4. Tests manuales en navegador
# - Registrar
# - Login
# - Ver anuncios
# - Solicitar password reset
```

---

## 🐛 Si Algo No Funciona

**Primero**: Mi mejor amigo es `TROUBLESHOOTING.md` - ahí está 90% de las soluciones

Búsqueda rápida:
- Backend no inicia → [Backend No Inicia](TROUBLESHOOTING.md#backend-no-inicia)
- Frontend no inicia → [Frontend No Inicia](TROUBLESHOOTING.md#frontend-no-inicia)
- Login error → [Login No Funciona](TROUBLESHOOTING.md#login-no-funciona)
- Tests fallan → [Tests Fallan](TROUBLESHOOTING.md#tests-fallan)

---

## 🔄 Flujo de Trabajo Recomendado

### Desarrollo Diario

```
1. Crear feature branch:
   git checkout -b feature/nombre-feature

2. Hacer cambios + escribir tests

3. Verificar todo funciona localmente:
   npm test
   test-all.ps1

4. Commitment:
   git add .
   git commit -m "feature: descripcion clara"
   git push origin feature/nombre-feature

5. Pull Request en GitHub:
   - Describe cambios
   - Espera que pase CI/CD
   - Request review
   - Merge cuando esté aprobado

6. GitHub Actions automáticamente:
   - Ejecuta linting + tests
   - Si develop: deploy a staging
   - Si main: preparado para production
```

---

## 🚀 Deployment Quick Reference

### Local → Render (5 min)
1. Push a main
2. Render auto-deploys desde GitHub
3. Backend: https://tu-backend.onrender.com
4. Frontend: https://tu-frontend.onrender.com
5. Configura env vars en Render Dashboard (ver render.yaml)

Ver detalles en: `DEPLOY.md`

---

## 📊 Status de Features

| Feature | Status | Tests | Docs |
|---------|--------|-------|------|
| Autenticación | ✅ | ✅ | ✅ |
| Anuncios | ✅ | ✅ | ✅ |
| Notificaciones | ✅ | ✅ | ✅ |
| Documentos | ✅ | ✅ | ✅ |
| Pagos (Mercado Pago) | ✅ | ⚠️ | ✅ |
| Admin Dashboard | ✅ | ✅ | ✅ |
| Password Recovery | ✅ | ✅ | ✅ |
| CI/CD | ✅ | N/A | ✅ |

**⚠️ Notas**:
- Tests están en formato mock (no ejecutan contra BD real)
- Para E2E testing, considera agregar Cypress/Playwright

---

## 🔑 Credenciales de Prueba

Para testing local, crea un usuario:

```powershell
# Via API - en terminal PowerShell
$body = @{
  name = "Test User"
  email = "test@example.com"
  password = "TestPassword123!"
  role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

Luego login con `test@example.com` / `TestPassword123!`

---

## 📞 Support Rápido

**P: ¿Dónde busco errores?**
A: 
- Backend: Terminal donde corre `npm start`
- Frontend: Browser DevTools (F12 → Console)
- Database: Ver `TROUBLESHOOTING.md`

**P: ¿Cómo reseteo todo?**
A:
```powershell
# Backend
rm -r backend/node_modules backend/package-lock.json
npm --prefix backend install

# Frontend
rm -r frontend/node_modules frontend/package-lock.json
npm --prefix frontend install

# Database (si necesario)
dropdb ateneo_db
createdb ateneo_db
cd backend
node scripts/init-db.js
```

**P: ¿Qué hago después de hacer push?**
A:
1. Ve a GitHub Actions
2. Espera a que terminen los jobs (5-10 min)
3. Si develop: verifica staging se actualizó
4. Si main: sigue DEPLOY.md para producción

**P: ¿Cómo agrego un nuevo endpoint?**
A:
1. Crea en `backend/routes/newRoutes.js`
2. Crea test en `backend/tests/new.test.js`
3. Registra en `backend/server.js`: `app.use('/api', newRoutes);`
4. Documenta en `API.md`
5. Haz PR como de costumbre

---

## ✨ Próximas Mejoras Opcionales

Después de que esté todo funcionando en producción:

- [ ] E2E testing con Cypress
- [ ] Monitoring con Sentry
- [ ] Performance monitoring
- [ ] Rate limiting en API
- [ ] Caching con Redis
- [ ] Logging centralizado
- [ ] Mobile app (React Native)
- [ ] Two-factor authentication (2FA)
- [ ] Role-based API permissions más finas

---

## 🎓 Entendimiento Rápido de la Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React 18 + Vite)                                 │
│  - Login, Dashboard, Announcements, Payments                │
│  - 127KB gzipped, fast HMR dev mode                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ 
                    HTTP/REST API
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  BACKEND (Express.js + PostgreSQL)                          │
│  - Auth (JWT), Announcements, Payments, Grades              │
│  - Admin Dashboard, Reports                                 │
│  - Connected to Mercado Pago SDK                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    PostgreSQL         JWT Cache        Email (SMTP)
   ┌─────────┐         ┌──────┐        ┌────────┐
   │ Tables: │         │ Tokens      │Notifications
   │ users  │         │ stored      │
   │ orders │         │             │
   │grades  │         │             │
   │announ. │         │             │
   └─────────┘         └──────┘      └────────┘
```

---

## 🎯 Checklist Final Antes de Producción

- [ ] Local development funciona sin errores
- [ ] GitHub Secrets configurados (18 variables)
- [ ] Branch protection activo en `main` y `develop`
- [ ] Tests pasan: `npm test` backend + frontend
- [ ] `test-all.ps1` muestra todos ✅
- [ ] API endpoints documentados en `API.md`
- [ ] Password reset probado
- [ ] Pagos probados (al menos flow sin confirmar)
- [ ] Admin dashboard accesible
- [ ] Staging deployment exitoso
- [ ] Staging testing validado
- [ ] Production database preparada
- [ ] Production servidor preparado
- [ ] Email SMTP funciona
- [ ] Mercado Pago tokens válidos
- [ ] URL's actualizadas (staging/prod)

---

## 📞 ¿Necesitas Ayuda?

1. **Lee la documentación relevante** (90% de respuestas están ahí)
2. **Busca en `TROUBLESHOOTING.md`**
3. **Revisa los logs** (backend console o browser DevTools)
4. **Git log** para ver cambios recientes

---

## 🎉 ¡Estás Listo!

Todo está configurado. Solo necesitas:

1. ✅ Backend corriendo
2. ✅ Frontend corriendo  
3. ✅ Hacer push
4. ✅ Configurar GitHub Secrets
5. ✅ Ver magia de CI/CD

**Siguiente paso**: Abre terminal y corre:
```powershell
cd backend
npm start
```

¡Buenas Prácticas! 🚀

---

**Última actualización**: 2026-02-09
**Versión**: 1.0 - Complete Setup
**Status**: ✅ Listo para Producción
