# Script de Pruebas Locales - Ateneo Platform
# Run: powershell -ExecutionPolicy Bypass -File test-all.ps1

param(
    [string]$BaseUrl = "http://localhost:5000",
    [string]$TestEmail = "testuser@example.com",
    [string]$TestPassword = "TestPassword123!",
    [string]$AdminEmail = "admin@example.com",
    [string]$AdminPassword = "AdminPassword123!"
)

# Colores para output
$GreenCheck = "✅"
$RedX = "❌"
$YellowWarn = "⚠️"
$BlueDot = "ℹ️"

Write-Host "`n=== PRUEBA DE ENDPOINTS - ATENEO PLATFORM ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl`n" -ForegroundColor Gray

# Helper function para hacer requests
function Invoke-APICall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$Token,
        [string]$Description
    )
    
    try {
        $Uri = "$BaseUrl$Endpoint"
        $Headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $Headers["Authorization"] = "Bearer $Token"
        }
        
        if ($Body) {
            $BodyJson = $Body | ConvertTo-Json
            Write-Host "$BlueDot $Description..." -ForegroundColor Blue
            $Response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $BodyJson -ErrorAction Stop
        } else {
            Write-Host "$BlueDot $Description..." -ForegroundColor Blue
            $Response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -ErrorAction Stop
        }
        
        Write-Host "$GreenCheck Éxito" -ForegroundColor Green
        return $Response
    }
    catch {
        Write-Host "$RedX Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n[1] HEALTH CHECK" -ForegroundColor Yellow
$HealthResponse = Invoke-APICall -Method "GET" -Endpoint "/api/health" -Description "Verificar servidor"

# Test 2: Registro
Write-Host "`n[2] AUTENTICACIÓN - REGISTRO" -ForegroundColor Yellow
$RegisterBody = @{
    name = "Test User $(Get-Random -Maximum 10000)"
    email = "testuser$(Get-Random -Maximum 99999)@example.com"
    password = $TestPassword
    role = "student"
}
$RegisterResponse = Invoke-APICall -Method "POST" -Endpoint "/api/auth/register" -Body $RegisterBody -Description "Registrar nuevo usuario"
$TestEmail = $RegisterBody.email

# Test 3: Login
Write-Host "`n[3] AUTENTICACIÓN - LOGIN" -ForegroundColor Yellow
$LoginBody = @{
    email = $TestEmail
    password = $TestPassword
}
$LoginResponse = Invoke-APICall -Method "POST" -Endpoint "/api/auth/login" -Body $LoginBody -Description "Login con usuario nuevo"

if ($LoginResponse.token) {
    $StudentToken = $LoginResponse.token
    Write-Host "Token obtenido: $($StudentToken.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "$YellowWarn No se obtuvo token, continuando sin autenticación" -ForegroundColor Yellow
    $StudentToken = $null
}

# Test 4: Obtener Anuncios (sin auth)
Write-Host "`n[4] ANUNCIOS - LISTAR (sin auth)" -ForegroundColor Yellow
$AnnouncementsResponse = Invoke-APICall -Method "GET" -Endpoint "/api/announcements" -Description "Obtener lista de anuncios"

# Test 5: Obtener contador de anuncios sin leer (con auth)
if ($StudentToken) {
    Write-Host "`n[5] ANUNCIOS - CONTADOR SIN LEER" -ForegroundColor Yellow
    $UnreadResponse = Invoke-APICall -Method "GET" -Endpoint "/api/announcements/new-count" -Token $StudentToken -Description "Obtener contador de anuncios sin leer"
}

# Test 6: Obtener órdenes
if ($StudentToken) {
    Write-Host "`n[6] PAGOS - MIS ÓRDENES" -ForegroundColor Yellow
    $OrdersResponse = Invoke-APICall -Method "GET" -Endpoint "/api/payments/orders" -Token $StudentToken -Description "Obtener mis órdenes de pago"
}

# Test 7: Login como Admin (crear si no existe)
Write-Host "`n[7] AUTENTICACIÓN - LOGIN ADMIN" -ForegroundColor Yellow
$AdminLoginBody = @{
    email = $AdminEmail
    password = $AdminPassword
}
$AdminLoginResponse = Invoke-APICall -Method "POST" -Endpoint "/api/auth/login" -Body $AdminLoginBody -Description "Login como admin"

if ($AdminLoginResponse.token) {
    $AdminToken = $AdminLoginResponse.token
    Write-Host "Token admin obtenido: $($AdminToken.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "$YellowWarn No se pudo login como admin" -ForegroundColor Yellow
    $AdminToken = $null
}

# Test 8: Dashboard Stats (solo admin)
if ($AdminToken) {
    Write-Host "`n[8] ADMIN - ESTADÍSTICAS DASHBOARD" -ForegroundColor Yellow
    $StatsResponse = Invoke-APICall -Method "GET" -Endpoint "/api/admin/stats" -Token $AdminToken -Description "Obtener estadísticas del dashboard"
    if ($StatsResponse) {
        Write-Host "- Usuarios por rol: $($StatsResponse.usersByRole | ConvertTo-Json -Compress)" -ForegroundColor Gray
        Write-Host "- Total órdenes: $($StatsResponse.orders.total)" -ForegroundColor Gray
        Write-Host "- Total anuncios: $($StatsResponse.announcements)" -ForegroundColor Gray
    }
}

# Test 9: Payment Report (solo admin)
if ($AdminToken) {
    Write-Host "`n[9] ADMIN - REPORTE DE PAGOS" -ForegroundColor Yellow
    $PaymentReportResponse = Invoke-APICall -Method "GET" -Endpoint "/api/admin/payments/report" -Token $AdminToken -Description "Obtener reporte de pagos"
    if ($PaymentReportResponse) {
        Write-Host "- Total pagos: $($PaymentReportResponse.summary.total)" -ForegroundColor Gray
        Write-Host "- Cantidad total: $($PaymentReportResponse.summary.totalAmount)" -ForegroundColor Gray
    }
}

# Test 10: Lista de usuarios (solo admin)
if ($AdminToken) {
    Write-Host "`n[10] ADMIN - LISTA DE USUARIOS" -ForegroundColor Yellow
    $UsersResponse = Invoke-APICall -Method "GET" -Endpoint "/api/admin/users" -Token $AdminToken -Description "Obtener lista de usuarios"
    if ($UsersResponse) {
        Write-Host "- Total usuarios: $($UsersResponse.Count)" -ForegroundColor Gray
    }
}

# Test 11: Actividad (último 30 días - solo admin)
if ($AdminToken) {
    Write-Host "`n[11] ADMIN - RESUMEN DE ACTIVIDAD" -ForegroundColor Yellow
    $ActivityResponse = Invoke-APICall -Method "GET" -Endpoint "/api/admin/activity" -Token $AdminToken -Description "Obtener resumen de actividad"
    if ($ActivityResponse) {
        Write-Host "- Nuevos usuarios hoy: $($ActivityResponse.newUsers[0].count)" -ForegroundColor Gray
        Write-Host "- Pagos hoy: $($ActivityResponse.paymentsByDay[0].count)" -ForegroundColor Gray
    }
}

# Test 12: Crear anuncio (como profesor/admin)
if ($StudentToken) {
    Write-Host "`n[12] ANUNCIOS - CREAR (si tienes permisos)" -ForegroundColor Yellow
    $CreateAnnouncementBody = @{
        title = "Anuncio de Prueba $(Get-Date -Format 'HH:mm:ss')"
        content = "Este es un anuncio de prueba creado por el script de testing"
    }
    $CreateAnnouncementResponse = Invoke-APICall -Method "POST" -Endpoint "/api/announcements" -Body $CreateAnnouncementBody -Token $StudentToken -Description "Crear nuevo anuncio"
}

# Test 13: Solicitar recuperación de contraseña
Write-Host "`n[13] AUTENTICACIÓN - RECUPERACIÓN DE CONTRASEÑA" -ForegroundColor Yellow
$ForgotPasswordBody = @{
    email = $TestEmail
}
$ForgotPasswordResponse = Invoke-APICall -Method "POST" -Endpoint "/api/auth/forgot-password" -Body $ForgotPasswordBody -Description "Solicitar recuperación de contraseña"

# Test 14: Obtener estudiantes (como teacher)
if ($StudentToken) {
    Write-Host "`n[14] PROFESOR - LISTA DE ESTUDIANTES" -ForegroundColor Yellow
    $StudentsResponse = Invoke-APICall -Method "GET" -Endpoint "/api/teacher/students" -Token $StudentToken -Description "Obtener lista de estudiantes (si eres profesor)"
}

# Test 15: Obtener calificaciones
if ($StudentToken) {
    Write-Host "`n[15] PROFESOR - MIS CALIFICACIONES" -ForegroundColor Yellow
    $GradesResponse = Invoke-APICall -Method "GET" -Endpoint "/api/student/mi-perfil/calificaciones" -Token $StudentToken -Description "Obtener mis calificaciones"
}

# Summary
Write-Host "`n=== RESUMEN DE PRUEBAS ===" -ForegroundColor Cyan
Write-Host "
Pruebas completadas:
$GreenCheck Health Check
$GreenCheck Registro de Usuario
$GreenCheck Login
$GreenCheck Listar Anuncios
$GreenCheck Contador Anuncios Sin Leer
$GreenCheck Listar Órdenes
$GreenCheck Estadísticas Admin (Dashboard)
$GreenCheck Reporte de Pagos
$GreenCheck Lista de Usuarios
$GreenCheck Resumen de Actividad
$GreenCheck Crear Anuncio
$GreenCheck Recuperación de Contraseña
$GreenCheck Lista de Estudiantes
$GreenCheck Calificaciones

Notas:
- Algunos endpoints requieren permisos específicos (admin, teacher)
- Si ves errores 403, verifica que tienes los permisos correctos
- Usa estos tokens para probar otros endpoints

Próximos pasos:
1. Verifica que todos los endpoints respondan correctamente
2. Revisa el archivo API.md para más detalles
3. Configura los GitHub Secrets antes de hacer git push
4. Ejecuta tests locales antes de deploy
" -ForegroundColor Green

Write-Host "`nPruebas finalizadas a: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray
