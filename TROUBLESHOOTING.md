# 🔧 TROUBLESHOOTING RÁPIDO - Ateneo Platform

## Backend No Inicia

### Síntoma: "Error: listen EADDRINUSE: address already in use :::5000"

**Causa**: Puerto 5000 ya esté en uso

**Solución**:
```powershell
# Opción 1: Matar proceso en puerto 5000
netstat -ano | findstr :5000
taskkill /PID <PID_DEL_PROCESO> /F

# Opción 2: Usar puerto diferente
# En backend/.env
PORT=5001

# Luego en frontend/.env o llamadas API:
VITE_BACKEND_URL=http://localhost:5001
```

---

### Síntoma: "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Causa**: PostgreSQL no está corriendo o no está configurado correctamente

**Solución**:
```powershell
# Verificar que PostgreSQL está corriendo (Windows)
Get-Service postgresql-x64-* | Start-Service

# Verificar credenciales en backend/.env
# DATABASE_URL debe ser válido: postgresql://user:pass@localhost:5432/ateneo_db

# Conectar directamente para verificar
psql -U postgres -c "SELECT 1;"

# Recrear base de datos si está corrupta
dropdb ateneo_db
createdb ateneo_db
node scripts/init-db.js
```

---

### Síntoma: "SyntaxError: Unexpected token..."

**Causa**: Error en código JavaScript

**Solución**:
```powershell
# Ejecutar ESLint para verificar
cd backend
npx eslint .

# Ver línea específica del error y corregir
```

---

## Frontend No Inicia

### Síntoma: "Error: EADDRINUSE: address already in use :::5173"

**Causa**: Vite ya está corriendo en ese puerto

**Solución**:
```powershell
# Opción 1: Matar proceso
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Opción 2: Usar puerto diferente
cd frontend
npm run dev -- --port 5174
```

---

### Síntoma: "Error: ENOENT: no such file or directory, open '.../index.html'"

**Causa**: Vite.config.mjs está mal configurado o falta index.html

**Solución**:
```powershell
# Verificar que index.html existe en frontend/
ls frontend/index.html

# Verificar vite config
cat frontend/vite.config.mjs

# Reinstalar
rm -r frontend/node_modules
npm --prefix frontend install
```

---

## API Endpoints No Responden

### Síntoma: "Cannot GET /api/announcements"

**Causa**: Backend no está iniciado o rutas no están registradas

**Solución**:
```powershell
# 1. Verificar que backend está corriendo
curl http://localhost:5000/api/health

# 2. Si no responde, revisar logs
cd backend
npm start

# 3. Verificar que la ruta está en server.js
grep -n "announcements" backend/server.js

# 4. Verificar que el router está importado
ls backend/routes/announcementRoutes.js
```

---

### Síntoma: "401 Unauthorized" o "403 Forbidden"

**Causa**: Token expirado, inválido o permisos insuficientes

**Solución**:
```powershell
# 1. Obtener nuevo token (login)
$loginBody = @{
  email = "admin@example.com"
  password = "AdminPassword123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $loginBody

$token = $response.token

# 2. Usar token en headers
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

# 3. Verificar permisos del usuario
# - Student: puede ver anuncios, órdenes, calificaciones
# - Teacher: puede crear anuncios, ver estudiantes
# - Admin: acceso a /api/admin/*
```

---

### Síntoma: "CORS error: Access to XMLHttpRequest has been blocked"

**Causa**: Frontend no en lista CORS de backend

**Solución**:
```powershell
# En backend/.env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# En backend/server.js verificar:
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

# Reiniciar backend
```

---

## Login No Funciona

### Síntoma: "Invalid credentials" o "User not found"

**Causa**: Email o contraseña incorrectos

**Solución**:
```powershell
# 1. Verificar que el usuario existe
psql -U postgres -d ateneo_db -c "SELECT id, name, email, role FROM users LIMIT 5;"

# 2. Si no hay usuarios, crear uno manualmente
psql -U postgres -d ateneo_db << EOF
INSERT INTO users (name, email, password, role, created_at)
VALUES (
  'Admin User',
  'admin@example.com',
  crypt('AdminPassword123!', gen_salt('bf')),
  'admin',
  NOW()
);
EOF

# 3. Intentar login con credenciales correctas
```

---

### Síntoma: "Backend not running" en login

**Causa**: Frontend no puede conectar a backend

**Solución**:
```powershell
# 1. Verificar backend corre
curl http://localhost:5000/api/health

# 2. Verificar VITE_BACKEND_URL en frontend/.env
cat frontend/.env

# 3. Si VITE_BACKEND_URL es incorrecto, actualizar
# frontend/.env:
# VITE_BACKEND_URL=http://localhost:5000

# 4. Limpiar cache del navegador
# Ctrl+Shift+Delete → borrar cache

# 5. Reiniciar frontend
cd frontend
npm run dev
```

---

## Base de Datos Problemas

### Síntoma: Multiple errors database on startup

**Causa**: Schema incompatible o tabla faltante

**Solución**:
```powershell
# 1. Conectar a DB
psql -U postgres -d ateneo_db

# 2. Ver tablas actuales
\dt

# 3. Si tables están vacias, inicializar
# Salir de psql primero: \q

# 4. En directorio backend:
node scripts/init-db.js

# 5. Verificar que se crearon tablas
psql -U postgres -d ateneo_db -c "\dt"
```

---

### Síntoma: "Relation 'users' does not exist"

**Causa**: Tabla no existe, DB nunca fue inicializada

**Solución**:
```powershell
cd backend

# 1. Verificar script existe
ls scripts/init-db.js

# 2. Ejecutar script
node scripts/init-db.js

# 3. Verificar resultados
psql -U postgres -d ateneo_db -c "SELECT COUNT(*) FROM users;"
```

---

## Anuncios No Se Ven

### Síntoma: Lista de anuncios vacía

**Causa**: No hay anuncios creados o no tienes permisos

**Solución**:
```powershell
# 1. Verificar que hay anuncios en DB
psql -U postgres -d ateneo_db -c "SELECT * FROM announcements LIMIT 10;"

# 2. Si no hay, crear uno como admin
$headers = @{
  "Authorization" = "Bearer ADMIN_TOKEN"
  "Content-Type" = "application/json"
}

$body = @{
  title = "Anuncio de Prueba"
  content = "Este es un anuncio de prueba"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/announcements" `
  -Method POST `
  -Headers $headers `
  -Body $body

# 3. Verificar que usuario actual no es bloqueado de ver anuncios
```

---

### Síntoma: Badge de anuncios sin leer no aparece

**Causa**: Tabla announcement_reads no existe o caché del navegador

**Solución**:
```powershell
# 1. Verificar tabla existe
psql -U postgres -d ateneo_db -c "\d announcement_reads"

# 2. Si no existe, crear tabla manualmente
psql -U postgres -d ateneo_db << EOF
CREATE TABLE announcement_reads (
  id SERIAL PRIMARY KEY,
  announcement_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(announcement_id, user_id),
  FOREIGN KEY(announcement_id) REFERENCES announcements(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
EOF

# 3. Limpiar caché del navegador
# Abrir DevTools → Application → Clear cache

# 4. Reiniciar frontend
```

---

## Tests Fallan

### Síntoma: "Cannot find module '@/...'"

**Causa**: Alias de path en tsconfig no coincide

**Solución**:
```powershell
# En backend o frontend, verificar tsconfig.json:
cat tsconfig.json | grep -A 5 "compilerOptions"

# Debe tener:
# "baseUrl": ".",
# "paths": { "@/*": ["src/*"] }

# Luego en package.json, agregar:
# "test": "jest --moduleNameMapper ..."
```

---

### Síntoma: "ENOENT: no such file or directory, open 'tests/...'"

**Causa**: Test file no existe o path incorrecto

**Solución**:
```powershell
# 1. Verificar que archivos test existen
ls tests/

# 2. Ejecutar test específico con path correcto
npm test -- --testPathPattern="auth.test.js"

# 3. Si falta archivo, crear directorio tests/
mkdir backend/tests
mkdir frontend/tests
```

---

## Pagos No Procesan

### Síntoma: Checkout da error o no redirecciona a Mercado Pago

**Causa**: Token de Mercado Pago inválido o no configurado

**Solución**:
```powershell
# 1. Verificar token en backend/.env
$token = (Get-Content backend/.env | grep MERCADO_PAGO_TOKEN).Split('=')[1]
echo "Token: $token"

# 2. Si no existe o está vacío, agregar en .env
# MERCADO_PAGO_TOKEN=APP_USR_xxxxxxxxxxxxxxxx

# 3. Verificar formato es correcto (APP_USR_... o similar)

# 4. Probar conectar a Mercado Pago API:
curl -H "Authorization: Bearer $token" \
  https://api.mercadopago.com/v1/preference

# 5. Si 401, token es inválido, conseguir uno nuevo
```

---

### Síntoma: Pago confirma pero no actualiza base de datos

**Causa**: Webhook de Mercado Pago no está registrado o configurado

**Solución**:
```powershell
# 1. En Mercado Pago dashboard:
# - Configuración → Webhooks
# - Agregar URL: https://tudominio.com/api/payments/webhook

# 2. Verificar endpoint webhook existe:
curl -X GET http://localhost:5000/api/payments/webhook

# 3. Verificar logs de webhook
# Backend debe logear cada webhook recibido
```

---

## Password Reset No Funciona

### Síntoma: Email de reset no llega

**Causa**: Credenciales SMTP incorrectas

**Solución**:
```powershell
# 1. Verificar credenciales en backend/.env
# EMAIL_USER=tu-email@gmail.com
# EMAIL_PASS=tu-app-password

# 2. Si usas Gmail, necesitas app password (no contraseña normal)
# https://support.google.com/accounts/answer/185833

# 3. Probar enviar email manualmente
node -e "
const mailer = require('./utils/mailer');
mailer.sendMail({
  to: 'tu-email@gmail.com',
  subject: 'Test',
  html: 'Test email'
}).then(() => console.log('Email enviado')).catch(e => console.error(e));
"

# 4. Revisar logs de backend
```

---

### Síntoma: "Invalid token" en página de reset

**Causa**: Token expirado o inválido

**Solución**:
```powershell
# Tokens de reset expiran en 1 hora
# 1. Solicitar nuevo reset
# 2. Usar link dentro de 1 hora
# 3. No compartir link con otros (es personal)

# 4. Si token está corrupto, solicitar otro
```

---

## Admin Dashboard Vacío

### Síntoma: Dashboard muestra 0 en todas las estadísticas

**Causa**: No hay datos creados o permisos insuficientes

**Solución**:
```powershell
# 1. Verificar que eres admin
# Login y revisar que role = 'admin'

# 2. Crear datos de prueba
# - Crear anuncios
# - Crear pagos de prueba
# - Crear usuarios

# 3. Verificar API endpoints
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/admin/stats

# 4. Ver respuesta en browser DevTools → Network → admin/stats
```

---

## GitHub Actions No Ejecuta

### Síntoma: Workflow muestra error en GitHub

**Causa**: GitHub Secrets no configurados o workflow file corrupto

**Solución**:
```powershell
# 1. Verificar Secrets existen
# Settings → Secrets → Actions
# - Debe haber al menos 9 secrets (o más)

# 2. Verificar workflow file sintaxis
# .github/workflows/ci-cd.yml
# - YAML format correcto
# - Sin tabs (solo espacios)

# 3. Ver logs del workflow:
# Actions → Workflow failure → Click para ver logs completos

# 4. Errores comunes:
# - Node version no existe (cambiar a 18.x o 20.x)
# - Comando no encontrado (ej: npx eslint)
# - Test falló (ver output)
```

---

## Performance Lento

### Síntoma: Frontend tarda mucho en cargar

**Causa**: Build sin optimizar o archivo grande

**Solución**:
```powershell
cd frontend

# 1. Analizar bundle
npm install --save-dev vite-plugin-compression
npm run build

# 2. Ver tamaño de archivos
ls -lh dist/

# 3. Habilitar compresión en vite.config.mjs:
# import compression from 'vite-plugin-compression';
# plugins: [react(), compression()]

# 4. Optimizar imports
# Cambiar import * as something from 'lib'
# A: import { specificFunction } from 'lib'
```

---

### Síntoma: Backend responde lento

**Causa**: Query a DB no optimizada

**Solución**:
```powershell
# 1. Revisar logs de qué query es lenta
# backend logs deberían incluir query time

# 2. En PostgreSQL, ver queries lentas:
psql -U postgres -d ateneo_db << EOF
SELECT query, calls, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 5;
EOF

# 3. Agregar índices si es necesario:
psql -U postgres -d ateneo_db << EOF
CREATE INDEX idx_announcements_created_by 
ON announcements(created_by);
EOF
```

---

## 📞 No Encuentro el Problema?

1. **Revisar log completo**:
   ```powershell
   # Backend
   npm start 2>&1 | Tee-Object -FilePath debug.log
   
   # Frontend browser console
   F12 → Console → Buscar errores rojos
   ```

2. **Buscar en GitHub Issues**:
   ```
   https://github.com/facebook/react/issues
   https://github.com/vitejs/vite/issues
   https://github.com/expressjs/express/issues
   ```

3. **Generar debug output**:
   ```powershell
   # Backend con verbose logging
   DEBUG=* npm start
   
   # API calls con curl verbose
   curl -v http://localhost:5000/api/health
   ```

4. **Resetear todo**:
   ```powershell
   # Última opción - clean slate
   rm -r backend/node_modules frontend/node_modules
   rm backend/package-lock.json frontend/package-lock.json
   npm --prefix backend install
   npm --prefix frontend install
   ```

