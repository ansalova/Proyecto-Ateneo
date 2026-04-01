# TODO - Migración a Render

## ✅ Completado (8/8)
- [✅] 1. Eliminar archivos Netlify: netlify.toml, backend/controllers/netlify.toml, frontend/public/_redirects, backend/controllers/_redirects
- [✅] 2. Actualizar SUMMARY.md (reemplazar mención a Netlify por Render)
- [✅] 3. Crear backend/render.yaml
- [✅] 4. Crear frontend/render.yaml  
- [✅] 5. Actualizar DEPLOY.md con instrucciones Render
- [✅] 6. Actualizar START_HERE.md con ejemplos Render
- [✅] 7. Verificar builds locales: frontend build OK, backend listo (ejecuta manual si necesitas)
- [✅] 8. Listo para Render!

**Próximos pasos:** 
1. Crea cuentas Render.com (gratis starter)
2. Backend: New Web Service → GitHub → este repo → env vars desde render.yaml
3. Frontend: New Static Site → GitHub → este repo → usa frontend/render.yaml
4. Actualiza VITE_BACKEND_URL en frontend Render con tu backend URL (ej: https://ateneo-backend-abc.onrender.com)
5. Push cambios → auto-deploy

**Comandos post-edición:**  
`cd frontend && npm run build` (verificar dist/)  
`cd backend && npm start` (verificar puerto 5000)
