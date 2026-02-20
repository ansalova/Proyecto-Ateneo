# 📧 Configuración de Email - Password Recovery

## Estado Actual

✅ **El sistema ya funciona en DEVELOPMENT sin configuración de email**

El nuevo mailer usa un transporte local que no requiere conexión real durante development. Todo funciona correctamente.

---

## 🔄 Testing Password Recovery (Sin Setup)

### En Development (Configuración Actual)
1. El sistema **SÍ genera el token** correctamente
2. El system **SÍ crea el link de reset** 
3. El email **NO se envía de verdad** (pero puedes verlo en los logs)

### Para Testear:
1. Abre el navegador → DevTools (F12)
2. Ve al tab "Network"
3. Haz click en "Enviar Link de Recuperación"
4. Mira la response en Network → deberías ver `{ msg: "Si el email existe..." }`
5. Abre los **logs del backend** (terminal donde corre `npm start`)
6. Busca línea que dice: `[MAILER] Enviando email de reset a: ...`

---

## 📧 Opcional: Configurar Email Real

Si quieres que **realmente se envíen emails** durante development:

### Opción 1: Usar Gmail (Recomendado)

1. **Obtén la App Password**:
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona: Mail + Windows Computer
   - Gmail te generará una contraseña de 16 caracteres
   - Cópiala

2. **Actualiza `backend/.env`**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=la-contraseña-de-16-caracteres-que-copiaste
   SMTP_FROM=Ateneo <tu-email@gmail.com>
   ```

3. **Reinicia backend**:
   ```powershell
   cd backend
   npm start
   ```

4. **Testa**:
   - Abre el cliente → Forgot Password
   - Ingresa tu email
   - Click "Enviar Link"
   - Revisa tu email real (puede tardar 1-2 segundos)

---

### Opción 2: Usar Outlook/Hotmail

```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña-normal
SMTP_FROM=Ateneo <tu-email@outlook.com>
```

---

### Opción 3: Usar SendGrid (Gratis hasta 100 emails/día)

1. Ve a: https://sendgrid.com
2. Crea cuenta gratis
3. Obtén API key
4. En `.env`:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.tu-api-key-aqui
   SMTP_FROM=noreply@tudominio.com
   ```

---

## 🧪 Testing del Link de Reset

Una vez que obtengas el email (o veas el link en los logs):

1. El link se parece a:
   ```
   http://localhost:5173/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Abre ese link en el navegador
3. Ingresa tu nueva contraseña (mínimo 6 caracteres)
4. Click "Restablecer Contraseña"
5. Debería redireccionarse a login
6. Intenta login con nueva contraseña ✅

---

## 📊 Diferencias entre Development y Production

### Development (Estado Actual)
- ✅ Tokens se generan correctamente
- ✅ Links se crean correctamente
- ✅ Todo funciona sin emails reales
- ❌ Emails no se envían (pero aparecen en logs)

### Production (Cuando hagas Deploy)
- ℹ️ **DEBES** configurar SMTP variables
- Sin SMTP configurado → El endpoint falla con error 500
- Los emails se envían de verdad

---

## 🔍 Debugging

### Ver Logs del Mailer

En terminal donde corre backend:
```
[MAILER] Usando transporte local (sin envío real)
[AUTH] Solicitud forgot-password para: usuario@example.com
[AUTH] Usuario encontrado: sí
[MAILER] Enviando email de reset a: usuario@example.com
[MAILER] Email enviado exitosamente. Message ID: <xxx>
[AUTH] Email de reset enviado a: usuario@example.com
```

### Si Ves Error

```
[MAILER] Error sending email: ECONNREFUSED...
```

✅ **En development = NO es problema**, el sistema continúa funcionando

❌ **En production = problema**, necesitas configurar SMTP

---

## ⚙️ Para Production

Cuando deploys a production:

1. **Configura GitHub Secrets** con variables SMTP:
   - `PROD_SMTP_HOST`
   - `PROD_SMTP_PORT`
   - `PROD_SMTP_USER`
   - `PROD_SMTP_PASS`
   - `PROD_SMTP_FROM`

2. **El CI/CD** automáticamente usará esos valores

3. **Emails se enviarán de verdad** a usuarios

---

## 💡 Tips

**Para testing rápido sin emails:**
- Los usuarios recibirán el mensaje "Si el email existe, recibirás instrucciones"
- Ver los logs del backend para verificar que el email se procesó
- El link de reset está disponible en logs (cópialo en la URL del navegador)

**Para testing con emails reales:**
- Configura Gmail (más fácil)
- Usa una cuenta de test de Gmail si quieres
- Todos los emails llegarán correctamente

---

## 📞 Problemas Comunes

### "Connection timed out"
- Probablemente SMTP host/port incorrecto
- Verifica: `SMTP_HOST=smtp.gmail.com` (no `smtp.google.com`)
- Verifica: `SMTP_PORT=587` (no otro puerto)

### "Invalid login credentials"
- Para Gmail: Necesita App Password, no contraseña normal
- Otros emails: Verifica contraseña exacta
- Algunos emails requieren contraseña de app específica

### "Email no llega"
- Revisar spam/junk folder
- Gmail puede demorar 1-2 segundos
- Si usas Gmail desde otra cuenta Gmail, puede ir a spam

---

## ✅ Resumen

| Aspecto | Development | Production |
|--------|------------|-----------|
| ¿Funciona? | ✅ Sí (sin emails) | Requiere SMTP |
| ¿Tokens? | ✅ Sí | ✅ Sí |
| ¿Links? | ✅ Sí | ✅ Sí |
| ¿Emails? | ❌ No | ✅ Sí (si config SMTP) |
| Configuración | 0 cambios | Agregar 5 variables |

---

**Ahora**: Todo funciona. Password recovery está completa ✅
