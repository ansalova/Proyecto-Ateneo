# Configuración de GitHub Secrets y Branch Protection

## 1️⃣ Configurar GitHub Secrets

### Acceso a Secrets

1. Ve a tu repositorio en GitHub
2. Click en `Settings`
3. En el menú izquierdo: `Secrets and variables` → `Actions`
4. Click en `New repository secret`

### Secrets para Staging (rama: develop)

Copia y pega estas claves una por una:

```
STAGING_SERVER_URL=https://staging-api.tudominio.com
STAGING_API_KEY=tu_clave_api_staging_123
STAGING_DB_URL=postgresql://user:password@staging-db.tudominio.com:5432/ateneo_staging
STAGING_JWT_SECRET=secreto_super_seguro_staging_2026
STAGING_FRONTEND_URL=https://staging.tudominio.com
STAGING_SMTP_HOST=smtp.gmail.com
STAGING_SMTP_PORT=587
STAGING_SMTP_USER=tu_email@gmail.com
STAGING_SMTP_PASS=tu_app_password
```

### Secrets para Producción (rama: main)

```
PROD_SERVER_URL=https://api.tudominio.com
PROD_API_KEY=tu_clave_api_prod_456
PROD_DB_URL=postgresql://user:password@prod-db.tudominio.com:5432/ateneo
PROD_JWT_SECRET=secreto_super_seguro_prod_2026
PROD_FRONTEND_URL=https://tudominio.com
PROD_SMTP_HOST=smtp.gmail.com
PROD_SMTP_PORT=587
PROD_SMTP_USER=tu_email@gmail.com
PROD_SMTP_PASS=tu_app_password
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

### Notas sobre Secrets

- **No uses Variables públicas para datos sensibles**
- Cada secret aparece como `***` en los logs de CI/CD
- Los secrets solo están disponibles en ramas protegidas
- Se pueden usar en workflows: `${{ secrets.NOMBRE_SECRET }}`

---

## 2️⃣ Configurar Rama Protegida (Branch Protection)

### Para la rama `main`

1. Ve a `Settings` → `Branches`
2. Click en `Add rule` bajo "Branch protection rules"
3. Pattern name: `main`

Configura:

- ✅ **Require a pull request before merging**
  - [x] Require approvals: 1
  - [x] Require review from Code Owners
  
- ✅ **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - [x] Select: `lint-and-test`
  - [x] Select: `build`
  - [x] Select: `code-quality`

- ✅ **Require signed commits**
  - [x] Habilitado (recomendado)

- ✅ **Restrict who can push to matching branches**
  - [x] Allow force pushes: Deshabilitado
  - [x] Allow deletions: Deshabilitado

- ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - [x] Habilitado

### Para la rama `develop`

1. Pasos similares al anterior
2. Pattern name: `develop`

Configurar:

- ✅ **Require a pull request before merging**
  - [x] Require approvals: 0 (menos estricto para desarrollo)
  
- ✅ **Require status checks to pass before merging**
  - [x] lint-and-test
  - [x] build

---

## 3️⃣ Configurar CODEOWNERS

Para que automáticamente se asignen revisores, crea el archivo `.github/CODEOWNERS`:

```
# Propietarios de código por ruta

# Backend
/backend/                 @tu_usuario
/backend/routes/          @tu_usuario
/backend/controllers/     @tu_usuario

# Frontend
/frontend/                @tu_usuario
/frontend/src/            @tu_usuario

# Tests
/tests/                   @tu_usuario

# Configs
.github/                  @tu_usuario
.env*                     @tu_usuario
```

---

## 4️⃣ Configurar Acciones Automáticas

### Asignar automáticamente PRs

Crea `.github/workflows/auto-assign.yml`:

```yaml
name: Auto Assign PR

on:
  pull_request:
    types: [opened]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/auto-assign@v2
        with:
          assignees: tu_usuario
          reviewers: revisor_usuario
```

---

## 5️⃣ Verificar Configuración

### Checklist

- [ ] 6+ Secrets configurados (staging)
- [ ] 10+ Secrets configurados (producción)
- [ ] Rama `main` protegida
- [ ] Rama `develop` protegida
- [ ] CODEOWNERS configurado
- [ ] Status checks requeridos
- [ ] Require approvals: 1 (main)
- [ ] Require signed commits: habilitado

### Probar Configuración

1. Crea una rama de prueba: `git checkout -b test/protection`
2. Haz un cambio simple
3. Push y abre un PR a `main`
4. Verifica que:
   - CI/CD se ejecuta automáticamente
   - No puedas mergear sin que pasen los tests
   - Requiera aprobación

---

## 📝 Variables de Entorno - Local vs GitHub

### Local (.env)

```
PORT=5000
DATABASE_URL=postgresql://postgres:1234567@localhost:5432/ateneo
JWT_SECRET=mi_super_secreto_123
FRONTEND_URL=http://localhost:5173
```

### GitHub (Secrets)

Los mismos, pero con URLs de producción/staging

### Diferencia

- **Local**: Para desarrollo, usar `localhost`
- **Staging**: Para testing, usar servidores de staging
- **Producción**: URLs reales de producción

---

## 🚨 Importante

No hagas push de:
- `.env` (nunca)
- Archivos con contraseñas
- API keys o tokens

Usa `.gitignore`:

```
.env
.env.local
.env.*.local
node_modules/
dist/
build/
```
