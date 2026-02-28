# API Endpoints - Documentación Completa

## Base URL

- **Local**: `http://localhost:5000`
- **Staging**: `https://staging-api.tudominio.com`
- **Producción**: `https://api.tudominio.com`

---

## 🔐 Autenticación

### Registro de Usuario

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "student",
  "inviteCode": ""
}
```

**Response 200:**
```json
{
  "msg": "Usuario registrado correctamente"
}
```

---

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "msg": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "student"
  }
}
```

---

### Solicitar Recuperación de Contraseña

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "juan@example.com"
}
```

**Response 200:**
```json
{
  "msg": "Si el email existe, recibirás instrucciones de recuperación"
}
```

---

### Restablecer Contraseña

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newPassword123"
}
```

**Response 200:**
```json
{
  "msg": "Contraseña actualizada correctamente"
}
```

---

## 📢 Anuncios

### Obtener Anuncios

```http
GET /api/announcements
```

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "Cierre de Inscripciones",
    "content": "Las inscripciones cierran el 28 de febrero...",
    "created_by": 2,
    "created_by_name": "Admin",
    "created_at": "2026-02-08T10:30:00Z",
    "is_read": false
  }
]
```

---

### Crear Anuncio (Admin/Profesor)

```http
POST /api/announcements
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Nuevo Anuncio",
  "content": "Contenido del anuncio..."
}
```

**Response 200:**
```json
{
  "success": true,
  "announcement": {
    "id": 5,
    "title": "Nuevo Anuncio",
    "content": "Contenido del anuncio...",
    "created_by": 2,
    "created_at": "2026-02-09T14:20:00Z"
  }
}
```

---

### Obtener Contador de Anuncios Sin Leer

```http
GET /api/announcements/new-count
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "unread_count": 3
}
```

---

### Marcar Anuncio como Leído

```http
POST /api/announcements/{id}/mark-read
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true
}
```

---

### Eliminar Anuncio

```http
DELETE /api/announcements/{id}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true
}
```

---

## 📄 Documentos

### Obtener Documentos

```http
GET /api/documents
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "Certificado 2025",
    "document_type": "certificado",
    "file_url": "https://cdn.tudominio.com/certificates/cert_001.pdf",
    "created_by": 2,
    "is_public": true
  }
]
```

---

### Crear Documento (Admin/Profesor)

```http
POST /api/documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Nuevo Certificado",
  "document_type": "certificado",
  "student_id": 1,
  "file_url": "https://cdn.tudominio.com/new_cert.pdf",
  "is_public": true
}
```

---

## 💳 Pagos

### Obtener Órdenes del Usuario

```http
GET /api/payments/orders
Authorization: Bearer {token}
```

---

### Obtener Estado de una Orden

```http
GET /api/payments/orders/:reference
Authorization: Bearer {token}
```

Devuelve los detalles de la orden particular.

---

### Crear Checkout (Mercado Pago)

```http
POST /api/payments/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Mensualidad Febrero 2026",
  "amount": 150
}
```

El endpoint acepta los siguientes métodos:

- `tarjeta` y `pse`: generan un checkout en línea con Mercado Pago.
- `nequi`, `daviplata`, `oficina`: **pagos offline**. El servidor devolverá instrucciones estáticas con el número de cuenta/mercado y una referencia; el destinatario debe enviar el dinero manualmente al número indicado y luego un administrador deberá marcar la orden como completada.

**Response 200:**
```json
[
  {
    "id": 1,
    "external_reference": "ATENEO-123456",
    "status": "completed",
    "method": "nequi",
    "amount": "150.00",
    "created_at": "2026-02-05T10:00:00Z"
  }
]
```

---

### Crear Checkout (Mercado Pago)

```http
POST /api/payments/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Mensualidad Febrero 2026",
  "amount": 150
}
```

**Response 200:**
```json
{
  "init_point": "https://www.mercadopago.com.co/checkout/v1/redirect?preference-id=12345"
}
```

---

## 📊 Admin

### Obtener Estadísticas del Dashboard

> **Administración**

(estas rutas requieren un token de un usuario con rol `admin`)

### Actualizar Estado de una Orden

```http
PATCH /api/payments/orders/:reference
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed"  # o "pending", "failed"
}
```

Permite a un administrador marcar manualmente una orden como pagada o fallida. Se usa típicamente para pagos offline una vez que el dinero se ha recibido.


### Obtener Estadísticas del Dashboard

```http
GET /api/admin/stats
Authorization: Bearer {token}
```

**Requiere: Admin**

**Response 200:**
```json
{
  "usersByRole": {
    "student": 25,
    "teacher": 5,
    "admin": 1
  },
  "orders": {
    "total": 15,
    "totalAmount": 2250.50,
    "byStatus": [
      { "status": "completed", "count": 12 },
      { "status": "pending", "count": 2 },
      { "status": "failed", "count": 1 }
    ]
  },
  "announcements": 8,
  "documents": 12,
  "recentPayments": [
    {
      "id": 1,
      "external_reference": "ATENEO-123",
      "amount": "150.00",
      "status": "completed",
      "method": "nequi",
      "name": "Juan Pérez",
      "email": "juan@example.com"
    }
  ]
}
```

---

### Obtener Reporte de Pagos

```http
GET /api/admin/payments/report?startDate=2026-01-01&endDate=2026-02-09&status=completed
Authorization: Bearer {token}
```

**Parámetros Query:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `status` (optional): completed, pending, failed

**Response 200:**
```json
{
  "summary": {
    "total": 12,
    "totalAmount": 1800.00,
    "byStatus": { "completed": 12 },
    "byMethod": { "nequi": 8, "daviplata": 4 }
  },
  "payments": [
    {
      "id": 1,
      "external_reference": "ATENEO-123",
      "amount": "150.00",
      "status": "completed",
      "method": "nequi",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "created_at": "2026-02-05T10:00:00Z"
    }
  ]
}
```

---

### Obtener Lista de Usuarios

```http
GET /api/admin/users?role=student&search=juan
Authorization: Bearer {token}
```

**Parámetros Query:**
- `role` (optional): student, teacher, admin
- `search` (optional): nombre o email

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "student",
    "created_at": "2026-01-15T08:00:00Z",
    "total_orders": 3,
    "total_spent": 450.00
  }
]
```

---

### Obtener Resumen de Actividad (últimos 30 días)

```http
GET /api/admin/activity
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "newUsers": [
    { "date": "2026-02-09", "count": 2 },
    { "date": "2026-02-08", "count": 1 }
  ],
  "paymentsByDay": [
    { "date": "2026-02-09", "count": 3, "total": 450.00 },
    { "date": "2026-02-08", "count": 1, "total": 150.00 }
  ]
}
```

---

## 👨‍🏫 Profesor

### Obtener Lista de Estudiantes

```http
GET /api/teacher/students
Authorization: Bearer {token}
```

**Requiere: Teacher o Admin**

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "student"
  }
]
```

---

### Obtener Calificaciones

```http
GET /api/teacher/grades
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": 1,
    "student_id": 1,
    "subject": "Matemáticas",
    "grade": 4.5,
    "period": "2026-I"
  }
]
```

---

### Guardar Calificación

```http
POST /api/teacher/grades/{studentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "subject": "Matemáticas",
  "period": "2026-I",
  "grade": 4.5
}
```

---

## 🎓 Estudiante

### Obtener Mis Calificaciones

```http
GET /api/student/mi-perfil/calificaciones
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "student",
  "grades": [
    {
      "subject": "Matemáticas",
      "grade": 4.5,
      "period": "2026-I"
    }
  ]
}
```

---

## ✅ Health Check

```http
GET /api/health
```

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T14:30:00.000Z"
}
```

---

## 🔄 General API Response

### Success Response
```json
{
  "success": true,
  "data": {},
  "msg": "Operación exitosa"
}
```

### Error Response (400)
```json
{
  "error": "bad_request",
  "msg": "Email es requerido"
}
```

### Error Response (401)
```json
{
  "error": "unauthorized",
  "msg": "Token expirado o inválido"
}
```

### Error Response (403)
```json
{
  "error": "forbidden",
  "msg": "No tienes permisos para acceder a este recurso"
}
```

### Error Response (500)
```json
{
  "error": "internal_error",
  "msg": "Error interno del servidor"
}
```

---

## 📌 Headers Requeridos

Para endpoints protegidos (requieren auth):

```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 🧪 Testing con cURL

### Ejemplo: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

### Ejemplo: Obtener Anuncios (sin auth)

```bash
curl http://localhost:5000/api/announcements
```

### Ejemplo: Crear Anuncio (con auth)

```bash
curl -X POST http://localhost:5000/api/announcements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nuevo Anuncio",
    "content": "Contenido..."
  }'
```

---

## 📱 CORS

Orígenes permitidos (configurable en `.env`):
- http://localhost:5173 (Vite dev)
- http://localhost:3000
- https://staging.tudominio.com
- https://tudominio.com
