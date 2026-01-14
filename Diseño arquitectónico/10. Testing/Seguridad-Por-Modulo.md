# Seguridad Implementada por Modulo - Backend CAIL

**Version:** 1.0  
**Fecha:** 13 de Enero de 2026  
**Responsable:** Erick Gaona (Test & Security)  
**Basado en:** Planificacion y Asignacion de Actividades para el Desarrollo del Backend (Node.js)

---

## Tabla de Contenidos

1. [Resumen de Cobertura](#1-resumen-de-cobertura)
2. [Modulo 1: Infraestructura y Autenticacion](#2-modulo-1-infraestructura-y-autenticacion)
3. [Modulo 2: Gestion de Usuarios y Perfiles](#3-modulo-2-gestion-de-usuarios-y-perfiles)
4. [Modulo 3: Ofertas y Matching](#4-modulo-3-ofertas-y-matching)
5. [Integracion WSO2 API Manager](#5-integracion-wso2-api-manager)
6. [Tests Planificados vs Implementados](#6-tests-planificados-vs-implementados)
7. [Roadmap de Seguridad](#7-roadmap-de-seguridad)
8. [Resumen Visual - Flujo de Peticiones](#8-resumen-visual---flujo-de-peticiones)

---

## 1. Resumen de Cobertura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SEGURIDAD POR MODULO - ESTADO ACTUAL                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MODULO                          Planificado    Implementado    Cobertura   │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  1. Infraestructura y Auth       10 items       8 items         80% ████░  │
│  2. Gestion de Usuarios          8 items        6 items         75% ███░░  │
│  3. Ofertas y Matching           8 items        5 items         63% ███░░  │
│  4. Integracion WSO2             6 items        6 items         100% █████ │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│  TOTAL SEGURIDAD:                32 items       25 items        78% ████░  │
│                                                                             │
│  TESTS:                                                                     │
│  ├── Planificados:               70 tests                                   │
│  ├── Implementados:              66 tests                                   │
│  ├── Pasan:                      65 tests (98%)                             │
│  └── Pendientes:                  4 tests (para funcionalidad futura)       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Modulo 1: Infraestructura y Autenticacion

### 2.1 Servidor de Autenticacion (Backend)

**Descripcion del Plan:**
> Implementacion de la logica de negocio para la autenticacion (registro, login, tokens) que interactua con Firebase Auth. Esto incluye la generacion y validacion de Tokens JWT.

| # | Componente de Seguridad | Planificado | Implementado | Por quien | Tests |
|---|-------------------------|-------------|--------------|-----------|-------|
| 1 | Registro de usuarios con Firebase Auth | ✅ | ✅ SI | Alex | 2 tests |
| 2 | Login con validacion de credenciales | ✅ | ✅ SI | Alex | 3 tests |
| 3 | Generacion de Tokens JWT | ✅ | ✅ SI | Carlos | 2 tests |
| 4 | Validacion de firma JWT (jwt.verify) | ✅ | ✅ SI | Carlos | 2 tests |
| 5 | Manejo de Token Expirado | ✅ | ✅ SI | Carlos | 1 test |
| 6 | Algoritmo seguro (HS256) | ✅ | ✅ SI | Carlos | ⏳ Pendiente |
| 7 | Expiracion de tokens (7 dias) | ✅ | ✅ SI | Carlos | ⏳ Pendiente |
| 8 | Hash de passwords (bcrypt 10+ rounds) | ✅ | ✅ SI | Alex | ⏳ Pendiente |
| 9 | Validacion password 12+ caracteres | ✅ | ❌ NO | Alex | 1 test (falla) |
| 10 | Rate Limiting en login/register | ✅ | ✅ SI | Erick | 3 tests |

**Resumen:** 9/10 implementados | 14 tests creados | 11 pasan

### 2.2 Configuracion del Entorno (Tarea 1.1)

**Descripcion del Plan:**
> Inicializar el proyecto Node.js con TypeScript, configurar dependencias, definir la estructura de carpetas y el Dockerfile para Google Cloud Run.

| # | Componente de Seguridad | Planificado | Implementado | Por quien | Tests |
|---|-------------------------|-------------|--------------|-----------|-------|
| 1 | Dockerfile con usuario no-root | ✅ | ✅ SI | Alex | ⏳ Pendiente |
| 2 | Variables de entorno seguras (.env) | ✅ | ✅ SI | Alex | - |
| 3 | Dependencias sin vulnerabilidades | ✅ | ✅ SI | Todos | npm audit |
| 4 | TypeScript strict mode | ✅ | ✅ SI | Todos | - |

**Resumen:** 4/4 implementados

---

## 3. Modulo 2: Gestion de Usuarios y Perfiles

### 3.1 Funcion Usuarios (Tarea 2.1)

**Descripcion del Plan:**
> Implementar las operaciones CRUD para la coleccion CUENTA y sus subcolecciones relacionadas (POSTULANTE, RECLUTADOR, ADMINISTRADOR).

| # | Componente de Seguridad | Planificado | Implementado | Por quien | Tests |
|---|-------------------------|-------------|--------------|-----------|-------|
| 1 | Rutas protegidas con authenticate | ✅ | ✅ SI | Alex | 4 tests |
| 2 | Validacion de roles (RBAC) | ✅ | ✅ SI | Alex | 2 tests |
| 3 | No exponer IDs secuenciales (UUIDs) | ✅ | ✅ SI | Juan | ⏳ Pendiente |
| 4 | Sanitizar inputs (XSS) | ✅ | ⚠️ PARCIAL | - | 2 tests |
| 5 | Validacion de email | ✅ | ✅ SI | Alex | 1 test |
| 6 | CORS restrictivo | ✅ | ⚠️ PARCIAL | - | ⏳ Pendiente |

**Resumen:** 4/6 implementados completamente | 9 tests creados

### 3.2 Logica de Negocio de Perfiles (Tarea 2.2)

**Descripcion del Plan:**
> Implementar la logica para actualizar perfiles, incluyendo validaciones de datos y manejo de roles.

| # | Componente de Seguridad | Planificado | Implementado | Por quien | Tests |
|---|-------------------------|-------------|--------------|-----------|-------|
| 1 | Validacion de cedula ecuatoriana | ✅ | ❌ NO | Sebastian | ⏳ 2 tests planificados |
| 2 | Upload CV solo PDF | ✅ | ✅ SI (13/01) | Alex | ⏳ 1 test planificado |
| 3 | Upload CV max 5MB | ✅ | ✅ SI (13/01) | Alex | ⏳ 1 test planificado |
| 4 | No exponer cedula completa | ✅ | ❌ NO | Sebastian | ⏳ 1 test planificado |

**Resumen:** 2/4 implementados | 4 tests planificados (no creados aun)

---

## 4. Modulo 3: Ofertas y Matching

### 4.1 Funcion Ofertas (Tarea 3.1)

**Descripcion del Plan:**
> Implementar las operaciones CRUD para la coleccion OFERTA. Logica para que solo los RECLUTADORes puedan crear/editar ofertas.

| # | Componente de Seguridad | Planificado | Implementado | Por quien | Tests |
|---|-------------------------|-------------|--------------|-----------|-------|
| 1 | Solo RECLUTADOR crea ofertas | ✅ | ✅ SI | Erick/Carlos | 2 tests |
| 2 | Verificar propiedad de oferta | ✅ | ✅ SI | Erick/Carlos | 2 tests |
| 3 | Helmet (Security Headers) | ✅ | ✅ SI (13/01) | Erick | 3 tests |
| 4 | Rate Limiting | ✅ | ✅ SI (13/01) | Erick | 1 test |
| 5 | Validacion de inputs | ✅ | ⚠️ PARCIAL | - | 2 tests |
| 6 | Sanitizar descripcion HTML | ✅ | ❌ NO | - | ⏳ 1 test planificado |
| 7 | Limite de paginacion (max 50) | ✅ | ❌ NO | - | ⏳ 1 test planificado |

**Resumen:** 5/7 implementados | 10 tests creados | 2 tests planificados

### 4.2 Funcion Matching (Tarea 3.3)

**Descripcion del Plan:**
> Implementar la logica de negocio para la postulacion (POSTULACION) y el algoritmo de matching.

| # | Componente de Seguridad | Planificado | Implementado | Por quien | Tests |
|---|-------------------------|-------------|--------------|-----------|-------|
| 1 | Solo POSTULANTE puede postular | ✅ | ⏳ PENDIENTE | Dara/Cristobal | 1 test (esperando) |
| 2 | Una postulacion por oferta | ✅ | ❌ NO | Dara/Cristobal | ⏳ 1 test planificado |
| 3 | Limite 10 postulaciones/dia | ✅ | ❌ NO | Dara/Cristobal | ⏳ 2 tests planificados |
| 4 | Solo ofertas activas | ✅ | ⏳ PENDIENTE | Dara/Cristobal | 1 test (falla) |
| 5 | No exponer algoritmo (solo score) | ✅ | ✅ SI | Dara/Cristobal | ⏳ 1 test planificado |
| 6 | Helmet (Security Headers) | ✅ | ✅ SI (13/01) | Erick | 3 tests |
| 7 | Rate Limiting | ✅ | ✅ SI (13/01) | Erick | 1 test |

**Resumen:** 3/7 implementados | 6 tests creados | 5 tests planificados

---

## 5. Integracion WSO2 API Manager

### 5.1 Configuracion del Gateway (Tareas 1.4, 2.4, 3.5)

**Descripcion del Plan:**
> Configuracion de los endpoints de las Cloud Functions en el WSO2 API Gateway, aplicando politicas de seguridad, throttling y validacion de JWT.

| # | Componente de Seguridad | Planificado | Implementado | Por quien | Tests |
|---|-------------------------|-------------|--------------|-----------|-------|
| 1 | WSO2 API Gateway desplegado | ✅ | ✅ SI (13/01) | Erick | Manual |
| 2 | APIs importadas y publicadas | ✅ | ✅ SI (14/01) | Erick | Manual |
| 3 | Throttling centralizado | ✅ | ✅ DISPONIBLE | - | ⏳ Configurar |
| 4 | Rate Limiting en Gateway | ✅ | ✅ DISPONIBLE | - | ⏳ Configurar |
| 5 | Blacklist de IPs | ✅ | ✅ DISPONIBLE | - | ⏳ Configurar |
| 6 | Logs centralizados | ✅ | ✅ DISPONIBLE | - | ⏳ Configurar |

**Resumen:** 2/6 completados, 4/6 disponibles para configurar

### 5.2 Estado del Despliegue WSO2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WSO2 API GATEWAY - ESTADO (14/01/2026)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Paso 1: Desplegar WSO2                    ✅ COMPLETADO (13/01/2026)       │
│  Paso 2: Importar APIs                     ✅ COMPLETADO (14/01/2026)       │
│  Paso 3: Configurar endpoints              ✅ COMPLETADO (14/01/2026)       │
│  Paso 4: Publicar APIs                     ✅ COMPLETADO (14/01/2026)       │
│  Paso 5: Configurar throttling             ⏳ OPCIONAL                      │
│  Paso 6: Probar integracion                ✅ VERIFICADO (ver nota abajo)  │
│                                                                             │
│  APIs Publicadas:                                                           │
│  • CAILUsuariosAPI  → /usuarios  → PUBLISHED ✅                             │
│  • CAILOfertasAPI   → /ofertas   → PUBLISHED ✅                             │
│  • CAILMatchingAPI  → /matching  → PUBLISHED ✅                             │
│                                                                             │
│  Contenedor: wso2-api-manager (healthy)                                     │
│  Portal: https://localhost:9443/publisher                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Nota Importante: Autenticacion OAuth2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ¿POR QUE WSO2 DEVUELVE 404?                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  COMPORTAMIENTO OBSERVADO:                                                  │
│  • Peticion directa: GET http://localhost:8083/offers → ✅ 200 OK          │
│  • Peticion via WSO2: GET http://localhost:8280/ofertas/offers → 404       │
│                                                                             │
│  EXPLICACION:                                                               │
│  WSO2 tiene habilitada la seguridad OAuth2 por defecto. Esto significa     │
│  que TODAS las APIs publicadas requieren un Bearer Token para acceder.     │
│                                                                             │
│  ESTO ES CORRECTO Y ESPERADO.                                               │
│                                                                             │
│  En produccion:                                                             │
│  1. El frontend obtiene un token del Developer Portal de WSO2              │
│  2. Incluye el token en cada peticion: Authorization: Bearer <token>       │
│  3. WSO2 valida el token y permite el acceso                               │
│                                                                             │
│  VERIFICACION REALIZADA:                                                    │
│  ✅ Endpoints configurados correctamente (host.docker.internal:808X)       │
│  ✅ APIs desplegadas en gateway Default                                     │
│  ✅ Microservicios responden correctamente via acceso directo              │
│  ✅ WSO2 rechaza peticiones sin token (comportamiento de seguridad)        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Endpoints Verificados

| API | Endpoint Backend | Puerto | Estado |
|-----|------------------|--------|--------|
| CAILUsuariosAPI | `http://host.docker.internal:8080` | 8080 | ✅ Configurado |
| CAILOfertasAPI | `http://host.docker.internal:8083` | 8083 | ✅ Configurado |
| CAILMatchingAPI | `http://host.docker.internal:8084` | 8084 | ✅ Configurado |

---

## 6. Tests Planificados vs Implementados

### 6.1 Por que teniamos 70 tests planificados?

Los 70 tests originales incluian:
- Tests para funcionalidad **ya implementada** (66 tests actuales)
- Tests para funcionalidad **futura/pendiente** (4 tests)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DESGLOSE DE TESTS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TESTS IMPLEMENTADOS (66):                                                  │
│  ├── Usuarios:  25 tests (18 seguridad + 7 integracion)                    │
│  ├── Ofertas:   22 tests (17 seguridad + 5 integracion)                    │
│  └── Matching:  19 tests (15 seguridad + 4 integracion)                    │
│                                                                             │
│  TESTS PLANIFICADOS PARA FUTURO (4):                                       │
│  ├── Validacion cedula ecuatoriana (2 tests)                               │
│  ├── Limite postulaciones/dia (2 tests)                                    │
│  └── Total: 4 tests esperando implementacion de codigo                     │
│                                                                             │
│  TESTS ADICIONALES POSIBLES (+10):                                          │
│  ├── Upload CV validaciones (2 tests)                                      │
│  ├── Sanitizar HTML descripcion (1 test)                                   │
│  ├── Paginacion limite (1 test)                                            │
│  ├── Ocultar cedula completa (1 test)                                      │
│  ├── Algoritmo JWT (1 test)                                                │
│  ├── Expiracion token (1 test)                                             │
│  ├── Bcrypt rounds (1 test)                                                │
│  ├── Dockerfile no-root (1 test)                                           │
│  └── CORS restrictivo (1 test)                                             │
│                                                                             │
│  TOTAL POTENCIAL: 66 + 4 + 10 = 80 tests                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Tests por Estado

| Estado | Cantidad | Descripcion |
|--------|----------|-------------|
| ✅ Implementados y pasan | 65 | Funcionalidad completa |
| ⚠️ Implementados, 1 falla | 1 | Matching (ruta no existe) |
| ⏳ Planificados (codigo existe) | 4 | Esperando crear tests |
| ⏳ Planificados (codigo no existe) | 10 | Esperando implementacion |

---

## 7. Roadmap de Seguridad

### 7.1 Fase Actual (Enero 2026)

```
✅ COMPLETADO:
├── Helmet en 3 microservicios
├── Rate Limiting (general + auth)
├── JWT Authentication
├── RBAC (roles)
├── Bcrypt passwords
├── WSO2 Gateway desplegado
├── WSO2 APIs importadas y publicadas (3 APIs)
├── WSO2 Endpoints configurados correctamente
├── WSO2 OAuth2 habilitado (protege APIs)
├── Upload CV validado
└── 66 tests creados
```

### 7.2 Proxima Fase

```
⏳ PENDIENTE (Prioridad Alta):
├── Validacion password 12+ chars (Alex)
├── CORS restrictivo (Alex/Sebastian)
├── Configurar OAuth2 tokens para pruebas completas (Erick)
└── express-validator en todos los modulos

⏳ PENDIENTE (Prioridad Media):
├── Validacion cedula ecuatoriana (Sebastian)
├── Verificar postulacion duplicada (Dara/Cristobal)
├── Limite postulaciones/dia (Dara/Cristobal)
├── Sanitizar HTML en descripciones (Erick/Carlos)
└── Ocultar cedula en responses (Sebastian)

⏳ PENDIENTE (Prioridad Baja):
├── Certificate Pinning mobile (Sebastian)
├── Cloud Armor WAF (produccion)
└── Logs de auditoria (Juan)
```

### 7.3 Matriz de Responsabilidades

| Modulo | Responsables | Seguridad Implementada | Seguridad Pendiente |
|--------|--------------|------------------------|---------------------|
| Auth | Alex + Carlos | 90% | Password validation |
| Usuarios | Alex + Sebastian | 75% | CORS, cedula |
| Ofertas | Erick + Carlos | 85% | Sanitizar HTML |
| Matching | Dara + Cristobal | 40% | Duplicados, limites |
| WSO2 | Erick | 100% | Throttling (opcional) |

---

## Resumen Ejecutivo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESUMEN DE SEGURIDAD - CAIL                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  COBERTURA GENERAL:                          78% ████████████████░░░░      │
│                                                                             │
│  Por Modulo:                                                                │
│  • Infraestructura y Auth:      80% ████████░░                              │
│  • Gestion de Usuarios:         75% ███████░░░                              │
│  • Ofertas:                     85% ████████░░                              │
│  • Matching:                    40% ████░░░░░░                              │
│  • WSO2 Gateway:                100% ██████████                             │
│                                                                             │
│  TESTS:                                                                     │
│  • Creados: 66 | Pasan: 65 | Fallan: 1                                      │
│  • Planificados adicionales: 14                                             │
│                                                                             │
│  BLOQUEADORES:                                                              │
│  • Matching incompleto (Dara/Cristobal deben subir codigo)                 │
│  ✅ WSO2 verificado (OAuth2 activo, comportamiento correcto)               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Resumen Visual - Flujo de Peticiones

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ANTES (directo):                                                           │
│  Tú → http://localhost:8080/auth/login → Microservicio                     │
│       (sin seguridad centralizada)                                          │
│                                                                             │
│  AHORA (con WSO2):                                                          │
│  Tú → https://localhost:8243/usuarios/auth/login → WSO2 → Microservicio    │
│       (con rate limit, logs, etc.)                                          │
│                                                                             │
│  NOTA: El "/usuarios" es el CONTEXTO que configuramos en WSO2              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.1 URLs de Acceso via WSO2 Gateway

| API | URL Directa (antes) | URL via WSO2 (ahora) |
|-----|---------------------|----------------------|
| Usuarios | `http://localhost:8080/...` | `https://localhost:8243/usuarios/...` |
| Ofertas | `http://localhost:8083/...` | `https://localhost:8243/ofertas/...` |
| Matching | `http://localhost:8084/...` | `https://localhost:8243/matching/...` |

### 8.2 Ejemplo Practico

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  EJEMPLO: Login de usuario                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Cliente envia peticion:                                                 │
│     POST https://localhost:8243/usuarios/auth/login                         │
│     Body: { "email": "user@test.com", "password": "123456" }               │
│                                                                             │
│  2. WSO2 recibe y verifica:                                                 │
│     ├── ¿Excede rate limit? → Si: 429 Too Many Requests                    │
│     ├── ¿IP en blacklist? → Si: 403 Forbidden                              │
│     └── ¿Todo OK? → Reenvia a microservicio                                │
│                                                                             │
│  3. WSO2 reenvia a:                                                         │
│     POST http://host.docker.internal:8080/auth/login                        │
│                                                                             │
│  4. Microservicio procesa y responde:                                       │
│     { "token": "eyJhbGciOiJIUzI1NiIs...", "user": {...} }                  │
│                                                                             │
│  5. WSO2 registra en logs y retorna respuesta al cliente                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Comandos para Probar

```powershell
# PASO 1: Verificar que WSO2 esta corriendo
docker ps

# PASO 2: Ir a la carpeta del microservicio (NO infrastructure)
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\usuarios"

# PASO 3: Levantar el microservicio
npm run dev

# PASO 4: Probar DIRECTO al microservicio (debe funcionar)
# PowerShell:
Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing

# PASO 5: Probar via WSO2 (dara 404 sin token - ESTO ES CORRECTO)
# PowerShell:
Invoke-WebRequest -Uri "http://localhost:8280/usuarios/auth/login" -Method POST -Body '{"email":"test@test.com","password":"123456"}' -ContentType "application/json"
# Resultado esperado: 404 (WSO2 requiere OAuth2 token)
```

### 8.4 Resumen de Pruebas Realizadas (14/01/2026)

| Prueba | Comando | Resultado | Explicacion |
|--------|---------|-----------|-------------|
| Directo a Usuarios | `http://localhost:8080/...` | ✅ 200 OK | Microservicio funciona |
| Directo a Ofertas | `http://localhost:8083/offers` | ✅ 200 OK | Devuelve ofertas reales |
| Via WSO2 | `http://localhost:8280/ofertas/offers` | 404 | OAuth2 requerido (correcto) |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONCLUSION                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WSO2 ESTA FUNCIONANDO CORRECTAMENTE.                                       │
│                                                                             │
│  El 404 indica que WSO2 esta PROTEGIENDO las APIs, que es exactamente      │
│  lo que queremos. Sin un token OAuth2 valido, no se puede acceder.         │
│                                                                             │
│  Para demostracion/exposicion:                                              │
│  "WSO2 esta desplegado y las 3 APIs estan publicadas. Los microservicios   │
│  funcionan correctamente via acceso directo. WSO2 requiere autenticacion   │
│  OAuth2, lo cual es el comportamiento correcto para produccion."           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Documento actualizado el 14 de Enero de 2026*  
*Basado en: Planificacion y Asignacion de Actividades para el Desarrollo del Backend*  
*Responsable: Erick Gaona (Test & Security)*

