# ✅ CHECKLIST DE CONFIGURACIÓN COMPLETO - Ateneo Platform

## FASE 1: Preparación Local (15-20 min)

### Servidor Backend
- [ ] Verificar que el backend corre en `http://localhost:5000`
  ```powershell
  cd backend
  npm start
  ```
- [ ] Verificar que PostgreSQL está corriendo
  ```powershell
  # Windows: verificar en Services que PostgreSQL esté iniciado
  ```
- [ ] Verificar que la base de datos está inicializada
  ```powershell
  cd backend
  node scripts/init-db.js
  ```

### Servidor Frontend
- [ ] Verificar que el frontend corre en `http://localhost:5173`
  ```powershell
  cd frontend
  npm run dev
  ```
- [ ] Verificar que pueden acceder a `http://localhost:5173` en el navegador

### Variables de Entorno Local
- [ ] Backend: Crear/verificar `backend/.env` con:
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/ateneo_db
  JWT_SECRET=your_jwt_secret_key_min_32_chars_long
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-app-password
  MERCADO_PAGO_TOKEN=your_mercado_pago_token
  NODE_ENV=development
  ```
- [ ] Frontend: Verificar `frontend/.env` contiene:
  ```
  VITE_BACKEND_URL=http://localhost:5000
  ```

---

## FASE 2: Pruebas Locales (10-15 min)

### Tests Manuales
- [ ] Ejecutar script de pruebas:
  ```powershell
  powershell -ExecutionPolicy Bypass -File test-all.ps1
  ```
- [ ] Verificar que no hay errores críticos de conexión

### Tests Unitarios Backend
- [ ] Ejecutar tests unitarios:
  ```powershell
  cd backend
  npm test
  ```
- [ ] Verificar que todos los tests pasan o hay máximo 2-3 fallos esperados

### Tests Unitarios Frontend
- [ ] Ejecutar tests de frontend:
  ```powershell
  cd frontend
  npm test
  ```

### Tests Manuales en Navegador
- [ ] Login como estudiante: ver que funciona el login
- [ ] Ver anuncios: verificar que se carga la lista de anuncios
- [ ] Crear anuncio: intentar crear (solo si eres profesor/admin)
- [ ] Ver badge de anuncios sin leer: verificar que aparece el número rojo
- [ ] Solicitar recuperación de contraseña: llenar formulario
- [ ] Si eres admin: ir a `/admin` para ver dashboard

---

## FASE 3: GitHub Secrets - IMPORTANTE (10-15 min)

**⚠️ CI/CD NO FUNCIONARÁ hasta que hagas esto**

### Setup en GitHub
1. [ ] Ir a: `https://github.com/TuUsuario/TuRepositorio/settings/secrets/actions`
2. [ ] Crear secreto para cada variable de entorno
3. [ ] **STAGING Secrets**:
   - [ ] `STAGING_DATABASE_URL` = PostgreSQL connection string
   - [ ] `STAGING_JWT_SECRET` = Clave JWT segura (32+ caracteres)
   - [ ] `STAGING_EMAIL_USER` = Email para notificaciones
   - [ ] `STAGING_EMAIL_PASS` = Contraseña de aplicación
   - [ ] `STAGING_MERCADO_PAGO_TOKEN` = Token Mercado Pago
   - [ ] `STAGING_NODE_ENV` = staging
   - [ ] `STAGING_BACKEND_URL` = https://api-staging.tudominio.com
   - [ ] `STAGING_FRONTEND_URL` = https://staging.tudominio.com
   - [ ] `STAGING_CORS_ORIGIN` = https://staging.tudominio.com

4. [ ] **PRODUCTION Secrets**:
   - [ ] `PROD_DATABASE_URL` = PostgreSQL connection string
   - [ ] `PROD_JWT_SECRET` = Clave JWT segura (diferente a staging)
   - [ ] `PROD_EMAIL_USER` = Email para notificaciones
   - [ ] `PROD_EMAIL_PASS` = Contraseña de aplicación
   - [ ] `PROD_MERCADO_PAGO_TOKEN` = Token Mercado Pago
   - [ ] `PROD_NODE_ENV` = production
   - [ ] `PROD_BACKEND_URL` = https://api.tudominio.com
   - [ ] `PROD_FRONTEND_URL` = https://tudominio.com
   - [ ] `PROD_CORS_ORIGIN` = https://tudominio.com

5. [ ] **Deploy Secrets** (para GitHub Actions):
   - [ ] `DEPLOY_KEY_STAGING` = SSH private key para servidor staging
   - [ ] `DEPLOY_KEY_PROD` = SSH private key para servidor producción
   - [ ] `DEPLOY_HOST_STAGING` = IP/hostname del servidor staging
   - [ ] `DEPLOY_HOST_PROD` = IP/hostname del servidor producción
   - [ ] `DEPLOY_USER_STAGING` = Usuario SSH (ej: ubuntu)
   - [ ] `DEPLOY_USER_PROD` = Usuario SSH (ej: ubuntu)

### Verificar Securely
- [ ] Ir a Settings → Secrets → Actions
- [ ] Confirmar que ves todos los secretos creados
- [ ] ⚠️ **NO screenshot** de los valores de secretos

---

## FASE 4: Branch Protection (5-10 min)

### Configurar Protección de Rama `main`
1. [ ] Ir a: `https://github.com/TuUsuario/TuRepositorio/settings/branches`
2. [ ] Click en "Add rule"
3. [ ] Branch name pattern: `main`
4. [ ] Aplicar estas reglas:
   - [ ] ✅ Require pull request reviews before merging
   - [ ] ✅ Require status checks to pass before merging
   - [ ] ✅ Require branches to be up to date before merging
   - [ ] ✅ Require linear history
5. [ ] Click "Create"

### Configurar Protección de Rama `develop`
1. [ ] Click en "Add rule"
2. [ ] Branch name pattern: `develop`
3. [ ] Aplicar estas reglas:
   - [ ] ✅ Require pull request reviews before merging
   - [ ] ✅ Require status checks to pass before merging
4. [ ] Click "Create"

### Configurar CODEOWNERS (Opcional pero recomendado)
1. [ ] Crear archivo `.github/CODEOWNERS`
2. [ ] Agregar contenido:
   ```
   # Backend
   /backend/ @tu-usuario
   
   # Frontend
   /frontend/ @tu-usuario
   
   # Tests
   /tests/ @tu-usuario
   
   # GitHub Actions
   /.github/workflows/ @tu-usuario
   ```
3. [ ] Hacer commit y push

---

## FASE 5: Primer Deployment (Staging) (20-30 min)

### Preparar Servidor Staging
- [ ] Crear instancia de servidor (AWS EC2, DigitalOcean, Azure, etc.)
- [ ] SSH a servidor
- [ ] Instalar Node.js:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- [ ] Instalar PostgreSQL:
  ```bash
  sudo apt-get install -y postgresql postgresql-contrib
  ```
- [ ] Instalar PM2 (para mantener servidor corriendo):
  ```bash
  sudo npm install -g pm2
  ```
- [ ] Crear usuario deploy:
  ```bash
  sudo useradd -m -s /bin/bash deploy
  sudo su - deploy
  ```

### Clonar Repositorio en Staging
- [ ] En servidor:
  ```bash
  cd /home/deploy
  git clone https://github.com/TuUsuario/TuRepositorio.git
  cd TuRepositorio
  ```

### Inicializar Base de Datos Staging
- [ ] En servidor:
  ```bash
  sudo su - postgres
  createdb ateneo_staging_db
  createuser ateneo_user
  alter user ateneo_user with password 'secure_password_here';
  grant all privileges on database ateneo_staging_db to ateneo_user;
  ```

### Deploy Backend
- [ ] En servidor:
  ```bash
  cd backend
  npm install --production
  node scripts/init-db.js
  ```
- [ ] Crear `.env` con staging variables
- [ ] Iniciar con PM2:
  ```bash
  pm2 start server.js --name "ateneo-backend"
  pm2 save
  ```

### Deploy Frontend
- [ ] En servidor:
  ```bash
  cd frontend
  npm install
  npm run build
  ```
- [ ] Servir con nginx o similar

### Verificar Staging
- [ ] [ ] Acceder a API: `https://api-staging.tudominio.com/api/health`
- [ ] [ ] Acceder a Frontend: `https://staging.tudominio.com`
- [ ] [ ] Hacer login test
- [ ] [ ] Ver anuncios

---

## FASE 6: Testing en Staging (15-20 min)

### Tests Completos
- [ ] [ ] Registrar nuevo usuario en staging
- [ ] [ ] Login con usuario nuevo
- [ ] [ ] Crear anuncio (si tienes permisos)
- [ ] [ ] Ver anuncios y verificar lectura
- [ ] [ ] Intentar checkout de pago (sin confirmar)
- [ ] [ ] Solicitar password reset
- [ ] [ ] Si eres admin: acceder a `/admin` y ver estadísticas

### Verificar Logs
- [ ] [ ] Revisar logs de backend para errores
  ```bash
  pm2 logs ateneo-backend
  ```
- [ ] [ ] Revisar logs de nginx (si aplica)
- [ ] [ ] Verificar emails se envían correctamente

---

## FASE 7: CI/CD Pipeline Validation (10 min)

### Validar GitHub Actions
- [ ] [ ] Hacer push a rama develop:
  ```powershell
  git push origin develop
  ```
- [ ] [ ] Ir a: `https://github.com/TuUsuario/TuRepositorio/actions`
- [ ] [ ] Verificar que el workflow se ejecuta
- [ ] [ ] Esperar a que terminen todos los jobs (lint, test, build)
- [ ] [ ] ✅ Todos los jobs deberían pasar verde

### Validar Deploy Automático
- [ ] [ ] Si todo pasa, staging debería actualizarse automáticamente
- [ ] [ ] [ ] 5 minutos después, verificar staging fue actualizado

---

## FASE 8: Production Setup (30-40 min)

### Crear Servidor Production
- [ ] [ ] Crear instancia de servidor (más grande que staging)
- [ ] [ ] Configurar SSL/TLS certificate (Let's Encrypt)
- [ ] [ ] Instalar Node.js, PostgreSQL, PM2 (mismo que staging)
- [ ] [ ] Crear base de datos production
- [ ] [ ] Clonear repo y configurar

### Setup CI/CD para Production
- [ ] [ ] GitHub Actions está configurado para deploy a production en push a `main`
- [ ] [ ] ⚠️ **Production deploy es MANUAL** (requiere aprobación en GitHub)
- [ ] [ ] Crear Pull Request a `main` desde `develop`
- [ ] [ ] Esperar a que tests pasen en PR
- [ ] [ ] Merge a `main` (requiere 1 aprobación si configuraste)
- [ ] [ ] Ir a Actions y "manually trigger" el production deploy
- [ ] [ ] Esperar a que termine
- [ ] [ ] Verificar que production se actualizó

---

## FASE 9: Monitoreo y Mantenimiento (Continuamente)

### Configurar Alertas (Opcional)
- [ ] [ ] Email alerts si los tests fallan
- [ ] [ ] Slack integration para deployment notifications
- [ ] [ ] Monitoring de uptime (UptimeRobot, Pingdom, etc)

### Reviews Regulares
- [ ] [ ] Semanal: Revisar logs de errores
- [ ] [ ] Semanal: Revisar dependencias desactualizadas
  ```powershell
  npm audit
  ```
- [ ] [ ] Mensual: Revisar GitHub Secrets siguen válidos
- [ ] [ ] Mensual: Backup de base de datos

### Actualizaciones
- [ ] [ ] Cuando Dependabot cree PRs, reviews y merges
- [ ] [ ] Mantener Node.js actualizado
- [ ] [ ] Mantener PostgreSQL actualizado
- [ ] [ ] Revisar cambios en librerías críticas

---

## FASE 10: Documentación Final

- [ ] [ ] Completar README.md con instrucciones de setup
- [ ] [ ] Agregar screenshots de funcionalidades principales
- [ ] [ ] Documentar proceso de reporting de bugs
- [ ] [ ] Crear guía de admin (cómo usar dashboard)
- [ ] [ ] Documentar process de escalamiento de permisos
- [ ] [ ] Crear runbook de troubleshooting

---

## 🎯 Resumen de Estimaciones de Tiempo

| Fase | Tiempo | Estado |
|------|--------|--------|
| 1. Preparación Local | 15-20 min | ⏳ |
| 2. Pruebas Locales | 10-15 min | ⏳ |
| 3. GitHub Secrets | 10-15 min | ⏳ |
| 4. Branch Protection | 5-10 min | ⏳ |
| 5. Deploy Staging | 20-30 min | ⏳ |
| 6. Testing Staging | 15-20 min | ⏳ |
| 7. CI/CD Validation | 10 min | ⏳ |
| 8. Production Setup | 30-40 min | ⏳ |
| 9. Monitoring Setup | 10-15 min | ⏳ |
| 10. Documentación | 15-20 min | ⏳ |

**Total Estimado: 2-3 horas**

---

## 🔗 Referencias Rápidas

- **API Endpoints**: Ver `API.md`
- **Deployment Guide**: Ver `DEPLOY.md`
- **GitHub Secrets Setup**: Ver `.github/SECRETS_AND_BRANCH_PROTECTION.md`
- **Test Script**: Ejecutar `test-all.ps1`

---

## ⚠️ Puntos Críticos

1. **GitHub Secrets DEBE estar configurado** antes de hacer push a main/develop
2. **Branch Protection** previene merges sin pasar tests
3. **Database backups** son esenciales antes de production
4. **SSL Certificates** son obligatorios para production
5. **Email SMTP** debe estar configurado correctamente
6. **Mercado Pago tokens** necesitan ser correctos por entorno

---

## 📞 Soporte Rápido

Si algo no funciona:

1. Verifica los logs:
   ```powershell
   # Backend
   cd backend
   npm start  # Ver errores en consola
   ```

2. Verifica conexión a DB:
   ```powershell
   psql -U user -d ateneo_db -c "SELECT 1;"
   ```

3. Verifica que puertos están disponibles:
   ```powershell
   netstat -ano | findstr :5000
   netstat -ano | findstr :5173
   ```

4. Limpia y reinstala:
   ```powershell
   rm -r node_modules
   npm install
   ```

5. Lee los test logs para errores específicos

---

**Última actualización**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
