# Deploy y CI/CD

## Overview

El proyecto tiene configurado un pipeline automático de CI/CD con GitHub Actions que:

1. **CI (Integración Continua)**: En cada push o pull request
   - Ejecuta linting (ESLint)
   - Corre tests unitarios
   - Verifica type checking
   - Realiza auditoría de seguridad
   - Construye el proyecto

2. **CD (Despliegue Continuo)**: Despliegues automáticos
   - Staging: Al pushear a `develop`
   - Producción: Al pushear a `main`

## Configuración

### 1. GitHub Secrets (Requerido)

Debes configurar estas variables en `Settings > Secrets and variables > Actions`:

**Para Staging (branch: develop)**
```
STAGING_SERVER_URL=https://staging.tudominio.com
STAGING_API_KEY=tu_clave_api_staging
STAGING_DB_URL=postgresql://user:pass@host/db_staging
STAGING_JWT_SECRET=secret_staging
STAGING_FRONTEND_URL=https://staging-frontend.tudominio.com
```

**Para Producción (branch: main)**
```
PROD_SERVER_URL=https://api.tudominio.com
PROD_API_KEY=tu_clave_api_prod
PROD_DB_URL=postgresql://user:pass@host/db_prod
PROD_JWT_SECRET=secret_prod
PROD_FRONTEND_URL=https://tudominio.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/...  # Optional
```

### 2. Configurar rama protegida

En `Settings > Branches > Branch protection rules`:

- Requiere que el status check de CI/CD sea exitoso
- Requiere revisión de al menos 1 persona
- Restringe pushes a main (solo pull requests)

## Workflow

### Ramificación

```
main (producción)
└── pull requests con status check exitoso
develop (staging)
└── feature branches
```

### Proceso de Desarrollo

1. **Crear rama de feature**
   ```bash
   git checkout -b feature/nueva-caracteristica
   ```

2. **Hacer cambios y commits**
   ```bash
   git commit -m "feat: descripción del cambio"
   ```

3. **Push y crear Pull Request**
   ```bash
   git push origin feature/nueva-caracteristica
   ```
   La GitHub Actions automáticamente:
   - Ejecuta linting
   - Corre tests
   - Construye el proyecto
   - Reporta resultados en el PR

4. **Merge a develop (Si todo pasa)**
   - Despliegue automático a staging
   - Testear en: https://staging.tudominio.com

5. **Merge a main (Cuando está listo para producción)**
   - Requiere 1 aprobación
   - Despliegue automático a producción

## Scripts Locales

### Backend

```bash
cd backend

# Desarrollo con auto-reload
npm run dev

# Lint
npm run lint

# Lint y arreglar
npm run lint:fix

# Tests
npm test

# Type checking
npm run type-check
```

### Frontend

```bash
cd frontend

# Desarrollo con Vite
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint

# Lint y arreglar
npm run lint:fix

# Tests
npm test
```

## Monitoreo

### Ver Status de Builds

- En GitHub: `Actions` tab en el repositorio
- En Pull Request: Verifica el estado debajo del título

### Logs

Click en el workflow que fallaste → ver logs detallados

## Troubleshooting

### Build falla por dependencias

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Lint errors

```bash
npm run lint:fix  # Arregla automáticamente
```

### Tests fallan localmente

Asegurate de:
1. Tener Node.js 18+ instalado
2. Tener .env configurado
3. Base de datos ejecutándose (para tests que requieran DB)

### Deploy manual (si GitHub Actions falla)

#### Backend (Heroku example)

```bash
cd backend
heroku login
heroku git:remote -a tu-app-nombre
git push heroku main
```

#### Frontend (Vercel example)

```bash
cd frontend
npm run build
# Luego deploy el contenido de dist/ a tu hosting
# O usar: vercel --prod
```

## Mejoras Futuras

- [ ] Agregar tests de carga
- [ ] Agregar tests E2E con Cypress
- [ ] Configurar deploy automático a AWS/Azure
- [ ] Agregarhealthchecks en producción
- [ ] Configurar logs centralizados
- [ ] Agregar métricas de performance
- [ ] Configurar rollback automático si algo falla

## Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [ESLint](https://eslint.org/)
- [Jest Testing](https://jestjs.io/)
