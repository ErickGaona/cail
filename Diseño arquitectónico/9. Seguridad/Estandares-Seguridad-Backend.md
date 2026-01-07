# Estándares de Seguridad para el Desarrollo del Backend
## Proyecto CAIL - Bolsa de Empleo

**Responsable de Seguridad:** Erick Gaona  
**Fecha:** Enero 2026  
**Versión:** 1.0

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Estándares Generales para Todo el Equipo](#2-estándares-generales-para-todo-el-equipo)
3. [Requerimientos por Desarrollador](#3-requerimientos-por-desarrollador)
4. [Checklist de Validación de Código](#4-checklist-de-validación-de-código)
5. [Herramientas de Validación](#5-herramientas-de-validación)
6. [Proceso de Revisión de Código](#6-proceso-de-revisión-de-código)
7. [Seguridad de APIs y Comunicación](#7-seguridad-de-apis-y-comunicación)
8. [Notas Importantes por Desarrollador](#8-notas-importantes-por-desarrollador)

---

## 1. Introducción

Este documento establece los estándares de seguridad obligatorios para el desarrollo del backend de CAIL. **Cada desarrollador DEBE cumplir estos estándares antes de hacer merge a la rama principal.**

El responsable de seguridad (Erick Gaona) validará el código de cada miembro del equipo usando las herramientas y checklists definidos en este documento.

---

## 2. Estándares Generales para Todo el Equipo

### 2.1 Reglas de Código Seguro (OBLIGATORIAS)

| # | Regla | Descripción | Ejemplo Malo | Ejemplo Bueno |
|---|-------|-------------|--------------|---------------|
| 1 | **No hardcodear secretos** | Nunca poner passwords, API keys o tokens directamente en el código | `const API_KEY = "abc123"` | `const API_KEY = process.env.API_KEY` |
| 2 | **Validar TODOS los inputs** | Todo dato que venga del usuario debe ser validado | `const email = req.body.email` | `const email = validateEmail(req.body.email)` |
| 3 | **Usar consultas parametrizadas** | Nunca concatenar strings en queries | `db.collection('users').where('id', '==', userId)` ✓ | Firestore SDK ya lo hace |
| 4 | **Sanitizar outputs** | Escapar datos antes de enviarlos | Enviar HTML sin escapar | Usar librerías de sanitización |
| 5 | **Manejar errores correctamente** | No exponer información sensible en errores | `res.status(500).json({ error: err.stack })` | `res.status(500).json({ error: 'Error interno' })` |
| 6 | **Usar HTTPS siempre** | Todas las comunicaciones cifradas | `http://api.cail.ec` | `https://api.cail.ec` |
| 7 | **Logs sin datos sensibles** | No loguear passwords, tokens o datos personales | `console.log('User:', user.password)` | `console.log('User login:', user.id)` |

### 2.2 Estructura de Archivos Obligatoria

```
src/
├── config/
│   └── env.ts              # Variables de entorno (NO hardcodear)
├── middleware/
│   ├── auth.middleware.ts   # Validación de JWT
│   ├── validation.middleware.ts  # Validación de inputs
│   └── error.middleware.ts  # Manejo centralizado de errores
├── utils/
│   ├── validators.ts        # Funciones de validación
│   └── sanitizers.ts        # Funciones de sanitización
└── ...
```

### 2.3 Variables de Entorno Requeridas

```env
# .env.example (NUNCA subir .env real a git)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
JWT_SECRET=
JWT_EXPIRATION=3600
NODE_ENV=development
```

### 2.4 Dependencias de Seguridad Obligatorias

```json
{
  "dependencies": {
    "helmet": "^7.0.0",           // Headers de seguridad
    "express-rate-limit": "^7.0.0", // Rate limiting
    "express-validator": "^7.0.0",  // Validación de inputs
    "sanitize-html": "^2.11.0",     // Sanitización
    "cors": "^2.8.5"                // CORS configurado
  },
  "devDependencies": {
    "eslint-plugin-security": "^1.7.1"  // Reglas de seguridad ESLint
  }
}
```

---

## 3. Requerimientos por Desarrollador

### 3.1 Alex Ramírez - Infraestructura y Auth (Registro/Login)

**Tareas:** 1.1 Configuración del Entorno, 1.2 Servidor de Autenticación (Registro/Login)

#### Requerimientos de Seguridad Específicos:

| # | Requerimiento | Detalle | Prioridad |
|---|---------------|---------|-----------|
| A1 | **Configurar Helmet** | Implementar headers de seguridad en Express | CRÍTICA |
| A2 | **Configurar CORS** | Solo permitir orígenes autorizados | CRÍTICA |
| A3 | **Rate Limiting en Login** | Máximo 5 intentos por IP cada 15 minutos | CRÍTICA |
| A4 | **Validación de Password** | Mínimo 12 caracteres, mayúscula, número, especial | ALTA |
| A5 | **Validación de Email** | Formato válido, sanitizado | ALTA |
| A6 | **No retornar si email existe** | En registro, no revelar si el email ya está registrado | MEDIA |
| A7 | **Dockerfile seguro** | Usuario no-root, imagen base oficial | ALTA |

#### Código de Ejemplo Requerido:

```typescript
// config/security.ts - OBLIGATORIO
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export const securityMiddleware = [
  helmet(),
  cors({
    origin: ['https://cail.ec', 'https://app.cail.ec'],
    credentials: true
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite general
    message: { error: 'Demasiadas solicitudes, intente más tarde' }
  })
];

// Rate limit específico para login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de login' }
});
```

```typescript
// validators/auth.validator.ts - OBLIGATORIO
import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 12 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password debe tener mínimo 12 caracteres, mayúscula, número y símbolo')
];
```

#### Checklist de Alex:
- [ ] Helmet configurado con opciones seguras
- [ ] CORS solo permite dominios de CAIL
- [ ] Rate limiting implementado en login (5 intentos/15 min)
- [ ] Validación de password cumple requisitos
- [ ] Variables de entorno en .env (no hardcodeadas)
- [ ] Dockerfile usa usuario no-root
- [ ] No se exponen errores detallados al cliente

---

### 3.2 Carlos Mejia - Auth (Validación Token/JWT) e Integración WSO2

**Tareas:** 1.2 Validación de Token/JWT, 1.4 Integración WSO2 (Auth)

#### Requerimientos de Seguridad Específicos:

| # | Requerimiento | Detalle | Prioridad |
|---|---------------|---------|-----------|
| C1 | **Algoritmo JWT seguro** | Usar RS256 o HS256 con secret fuerte (mínimo 256 bits) | CRÍTICA |
| C2 | **Expiración de tokens** | Access token: 1 hora, Refresh token: 7 días | CRÍTICA |
| C3 | **Validar firma JWT** | Verificar que el token no fue manipulado | CRÍTICA |
| C4 | **Validar claims** | Verificar iss, aud, exp en cada request | ALTA |
| C5 | **Middleware de autenticación** | Proteger TODAS las rutas excepto login/registro | CRÍTICA |
| C6 | **No exponer JWT en logs** | Nunca loguear el token completo | ALTA |
| C7 | **Configurar WSO2 JWT Policy** | Validación de JWT en el gateway | ALTA |

#### Código de Ejemplo Requerido:

```typescript
// middleware/auth.middleware.ts - OBLIGATORIO
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export const authMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < now) {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    // Agregar usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'postulante'
    };
    
    // Log SIN el token
    console.log(`Auth success: ${decodedToken.uid}`);
    
    next();
  } catch (error) {
    console.error('Auth error:', error.code); // Solo el código, no el mensaje completo
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

```typescript
// middleware/role.middleware.ts - OBLIGATORIO
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};

// Uso: router.post('/ofertas', authMiddleware, requireRole('reclutador'), crearOferta);
```

#### Checklist de Carlos:
- [ ] JWT usa algoritmo seguro (RS256 o HS256)
- [ ] Secret de JWT está en variable de entorno (mínimo 256 bits)
- [ ] Tokens tienen expiración configurada
- [ ] Middleware valida token en TODAS las rutas protegidas
- [ ] Se validan claims (uid, exp, rol)
- [ ] No se loguean tokens completos
- [ ] WSO2 configurado con política JWT

---

### 3.3 Juan Espinosa - Firestore y Función Usuarios (CUENTA, ADMIN)

**Tareas:** 1.3 Configuración Firestore, 2.1 CRUD CUENTA/ADMINISTRADOR

#### Requerimientos de Seguridad Específicos:

| # | Requerimiento | Detalle | Prioridad |
|---|---------------|---------|-----------|
| J1 | **Firestore Security Rules** | Implementar reglas que restrinjan acceso por usuario | CRÍTICA |
| J2 | **Validar permisos en código** | Doble validación: rules + código backend | ALTA |
| J3 | **No exponer IDs internos** | Usar UIDs de Firebase, no IDs secuenciales | ALTA |
| J4 | **Sanitizar datos antes de guardar** | Limpiar HTML, scripts maliciosos | ALTA |
| J5 | **Validar rol de administrador** | Solo admins pueden acceder a rutas de admin | CRÍTICA |
| J6 | **Auditoría de cambios** | Registrar quién y cuándo modificó datos | MEDIA |

#### Código de Ejemplo Requerido:

```typescript
// firestore.rules - OBLIGATORIO
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función para verificar rol
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/cuentas/$(request.auth.uid)).data.tipo_usuario == role;
    }
    
    // Función para verificar que es el dueño
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Colección CUENTAS
    match /cuentas/{userId} {
      // Solo el usuario puede leer su propia cuenta, o un admin
      allow read: if isOwner(userId) || hasRole('administrador');
      
      // Solo el usuario puede actualizar su cuenta
      allow update: if isOwner(userId);
      
      // Solo el sistema puede crear cuentas (via Admin SDK)
      allow create: if false;
      
      // Solo admins pueden eliminar
      allow delete: if hasRole('administrador');
    }
    
    // Colección ADMINISTRADORES
    match /administradores/{adminId} {
      // Solo admins pueden leer/escribir
      allow read, write: if hasRole('administrador');
    }
  }
}
```

```typescript
// services/cuenta.service.ts - OBLIGATORIO
import { getFirestore } from 'firebase-admin/firestore';
import sanitizeHtml from 'sanitize-html';

const db = getFirestore();

export const updateCuenta = async (
  userId: string, 
  requesterId: string,
  data: UpdateCuentaDTO
) => {
  // Validar que el usuario solo puede modificar su propia cuenta
  if (userId !== requesterId) {
    throw new ForbiddenError('No puede modificar otra cuenta');
  }
  
  // Sanitizar datos
  const sanitizedData = {
    nombres: sanitizeHtml(data.nombres, { allowedTags: [] }),
    apellidos: sanitizeHtml(data.apellidos, { allowedTags: [] }),
    // NO permitir cambiar email o rol desde aquí
    updated_at: new Date(),
    updated_by: requesterId
  };
  
  await db.collection('cuentas').doc(userId).update(sanitizedData);
  
  // Log de auditoría
  await db.collection('audit_logs').add({
    action: 'UPDATE_CUENTA',
    userId: userId,
    performedBy: requesterId,
    timestamp: new Date(),
    changes: Object.keys(sanitizedData)
  });
};
```

#### Checklist de Juan:
- [ ] Firestore Security Rules implementadas
- [ ] Reglas verifican autenticación en todas las colecciones
- [ ] Reglas verifican propiedad (solo dueño puede modificar)
- [ ] Datos sanitizados antes de guardar
- [ ] No se usan IDs secuenciales
- [ ] Rutas de admin protegidas con verificación de rol
- [ ] Logs de auditoría implementados

---

### 3.4 Sebastián Calderón - Función Usuarios (POSTULANTE, RECLUTADOR)

**Tareas:** 2.1 CRUD POSTULANTE/RECLUTADOR, 2.2 Lógica de Perfiles

#### Requerimientos de Seguridad Específicos:

| # | Requerimiento | Detalle | Prioridad |
|---|---------------|---------|-----------|
| S1 | **Validar tipo de archivo CV** | Solo PDF, máximo 5MB | CRÍTICA |
| S2 | **Sanitizar datos de perfil** | Experiencia, habilidades, descripción | ALTA |
| S3 | **No exponer datos sensibles** | No retornar cédula completa en listados | ALTA |
| S4 | **Validar cédula ecuatoriana** | Algoritmo de validación de cédula | MEDIA |
| S5 | **Verificación de empresa** | Reclutadores deben validar RUC | ALTA |
| S6 | **Privacidad de datos** | Respetar configuración de privacidad del usuario | ALTA |

#### Código de Ejemplo Requerido:

```typescript
// validators/profile.validator.ts - OBLIGATORIO
import { body } from 'express-validator';

// Validador de cédula ecuatoriana
const validateCedulaEC = (cedula: string): boolean => {
  if (!/^\d{10}$/.test(cedula)) return false;
  
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
  const tercerDigito = parseInt(cedula.charAt(2));
  if (tercerDigito > 5) return false;
  
  // Algoritmo de verificación
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
    if (valor > 9) valor -= 9;
    suma += valor;
  }
  
  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === parseInt(cedula.charAt(9));
};

export const postulanteValidator = [
  body('cedula')
    .matches(/^\d{10}$/)
    .custom(validateCedulaEC)
    .withMessage('Cédula ecuatoriana inválida'),
  body('experiencia')
    .isLength({ max: 2000 })
    .trim()
    .escape(),
  body('habilidades')
    .isArray({ max: 20 })
    .withMessage('Máximo 20 habilidades')
];
```

```typescript
// middleware/upload.middleware.ts - OBLIGATORIO
import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req: any, file: any, cb: any) => {
  // Solo permitir PDF
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Solo se permiten archivos PDF'), false);
  }
  cb(null, true);
};

export const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});

// Uso: router.post('/cv', authMiddleware, cvUpload.single('cv'), uploadCV);
```

```typescript
// utils/privacy.ts - OBLIGATORIO
// Ocultar datos sensibles según configuración de privacidad
export const sanitizePostulanteForPublic = (postulante: Postulante) => {
  return {
    id: postulante.id,
    nombres: postulante.nombres,
    // Ocultar apellido parcialmente
    apellidos: postulante.apellidos.charAt(0) + '***',
    // NUNCA exponer cédula completa
    cedula: postulante.cedula.substring(0, 4) + '******',
    experiencia: postulante.experiencia,
    habilidades: postulante.habilidades,
    // Solo si el usuario permite mostrar email
    email: postulante.privacidad?.mostrarEmail ? postulante.email : null
  };
};
```

#### Checklist de Sebastián:
- [ ] Upload de CV solo acepta PDF
- [ ] Tamaño máximo de CV: 5MB
- [ ] Validación de cédula ecuatoriana implementada
- [ ] Datos de perfil sanitizados
- [ ] Cédula no se expone completa en listados
- [ ] Configuración de privacidad respetada
- [ ] Validación de RUC para reclutadores

---

### 3.5 Erick Gaona - Función Ofertas (CRUD y Búsqueda)

**Tareas:** 3.1 CRUD Ofertas, 3.2 Búsqueda de Ofertas

#### Requerimientos de Seguridad Específicos:

| # | Requerimiento | Detalle | Prioridad |
|---|---------------|---------|-----------|
| E1 | **Solo reclutadores crean ofertas** | Verificar rol antes de crear/editar | CRÍTICA |
| E2 | **Validar datos de oferta** | Salario, ubicación, requisitos | ALTA |
| E3 | **Sanitizar descripción** | Limpiar HTML/scripts en descripción | ALTA |
| E4 | **Rate limiting en búsquedas** | Evitar scraping masivo | MEDIA |
| E5 | **Paginación obligatoria** | Máximo 50 resultados por página | ALTA |
| E6 | **No inyección en búsquedas** | Validar parámetros de filtro | CRÍTICA |

#### Código de Ejemplo Requerido:

```typescript
// validators/oferta.validator.ts - OBLIGATORIO
import { body, query } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

export const crearOfertaValidator = [
  body('titulo')
    .isLength({ min: 5, max: 100 })
    .trim()
    .escape()
    .withMessage('Título debe tener entre 5 y 100 caracteres'),
  body('descripcion')
    .isLength({ min: 50, max: 5000 })
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'ul', 'li', 'p', 'br'],
      allowedAttributes: {}
    }))
    .withMessage('Descripción debe tener entre 50 y 5000 caracteres'),
  body('salario_min')
    .isNumeric()
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Salario inválido'),
  body('salario_max')
    .isNumeric()
    .isFloat({ min: 0, max: 100000 })
    .custom((value, { req }) => value >= req.body.salario_min)
    .withMessage('Salario máximo debe ser mayor al mínimo'),
  body('ubicacion')
    .isLength({ min: 3, max: 100 })
    .trim()
    .escape()
];

export const buscarOfertasValidator = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }) // Máximo 50 por página
    .toInt(),
  query('salario_min')
    .optional()
    .isFloat({ min: 0 })
    .toFloat(),
  query('ubicacion')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .escape()
];
```

```typescript
// controllers/oferta.controller.ts - OBLIGATORIO
import { Request, Response } from 'express';

export const crearOferta = async (req: Request, res: Response) => {
  try {
    // Verificar que es reclutador
    if (req.user.role !== 'reclutador') {
      return res.status(403).json({ error: 'Solo reclutadores pueden crear ofertas' });
    }
    
    // Los datos ya vienen validados y sanitizados del middleware
    const ofertaData = {
      ...req.body,
      reclutador_id: req.user.uid,
      empresa_id: req.user.empresa_id,
      estado: 'activa',
      created_at: new Date(),
      created_by: req.user.uid
    };
    
    const oferta = await ofertaService.crear(ofertaData);
    
    // Log de auditoría
    await auditService.log('CREATE_OFERTA', req.user.uid, oferta.id);
    
    res.status(201).json(oferta);
  } catch (error) {
    console.error('Error creating oferta:', error.message);
    res.status(500).json({ error: 'Error al crear la oferta' });
  }
};

export const buscarOfertas = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    
    // Límite máximo de 50 por página (ya validado)
    const ofertas = await ofertaService.buscar({
      filters,
      page: Number(page),
      limit: Math.min(Number(limit), 50) // Doble verificación
    });
    
    res.json({
      data: ofertas.items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: ofertas.total,
        pages: Math.ceil(ofertas.total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error searching ofertas:', error.message);
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
};
```

#### Checklist de Erick:
- [ ] Solo reclutadores pueden crear/editar ofertas
- [ ] Validación de todos los campos de oferta
- [ ] Descripción sanitizada (HTML permitido limitado)
- [ ] Paginación con máximo 50 resultados
- [ ] Parámetros de búsqueda validados
- [ ] Rate limiting en endpoint de búsqueda
- [ ] Logs de auditoría para creación/edición

---

### 3.6 Dara Van Gijsel - Matching y Postulación

**Tareas:** 3.3 Función Matching, 3.4 Endpoints Postulación, 2.4/3.5 Integración WSO2

#### Requerimientos de Seguridad Específicos:

| # | Requerimiento | Detalle | Prioridad |
|---|---------------|---------|-----------|
| D1 | **Solo postulantes pueden postular** | Verificar rol antes de postular | CRÍTICA |
| D2 | **Una postulación por oferta** | Evitar postulaciones duplicadas | ALTA |
| D3 | **Límite de postulaciones diarias** | Máximo 10 por día | MEDIA |
| D4 | **Validar estado de oferta** | Solo postular a ofertas activas | ALTA |
| D5 | **Proteger algoritmo de matching** | No exponer lógica de puntuación | MEDIA |
| D6 | **WSO2 - Todas las rutas protegidas** | JWT obligatorio en gateway | CRÍTICA |

#### Código de Ejemplo Requerido:

```typescript
// services/postulacion.service.ts - OBLIGATORIO
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();
const MAX_POSTULACIONES_DIA = 10;

export const crearPostulacion = async (
  postulanteId: string, 
  ofertaId: string
) => {
  // Verificar que la oferta existe y está activa
  const oferta = await db.collection('ofertas').doc(ofertaId).get();
  if (!oferta.exists || oferta.data()?.estado !== 'activa') {
    throw new BadRequestError('Oferta no disponible');
  }
  
  // Verificar postulación duplicada
  const existingPostulacion = await db.collection('postulaciones')
    .where('postulante_id', '==', postulanteId)
    .where('oferta_id', '==', ofertaId)
    .get();
    
  if (!existingPostulacion.empty) {
    throw new ConflictError('Ya se postuló a esta oferta');
  }
  
  // Verificar límite diario
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const postulacionesHoy = await db.collection('postulaciones')
    .where('postulante_id', '==', postulanteId)
    .where('created_at', '>=', hoy)
    .count()
    .get();
    
  if (postulacionesHoy.data().count >= MAX_POSTULACIONES_DIA) {
    throw new TooManyRequestsError('Límite de postulaciones diarias alcanzado');
  }
  
  // Crear postulación
  const postulacion = await db.collection('postulaciones').add({
    postulante_id: postulanteId,
    oferta_id: ofertaId,
    estado: 'pendiente',
    created_at: FieldValue.serverTimestamp()
  });
  
  return postulacion.id;
};
```

```typescript
// services/matching.service.ts - OBLIGATORIO
// El algoritmo de matching es interno, no exponer detalles al cliente

interface MatchScore {
  ofertaId: string;
  score: number; // 0-100
  // NO exponer breakdown de puntuación
}

export const calcularMatching = async (
  postulanteId: string
): Promise<MatchScore[]> => {
  const postulante = await getPostulante(postulanteId);
  const ofertasActivas = await getOfertasActivas();
  
  const scores: MatchScore[] = [];
  
  for (const oferta of ofertasActivas) {
    // Lógica interna de matching
    const score = calcularScoreInterno(postulante, oferta);
    
    scores.push({
      ofertaId: oferta.id,
      score: Math.round(score) // Solo el score, no el breakdown
    });
  }
  
  // Ordenar por score descendente
  return scores.sort((a, b) => b.score - a.score);
};

// Esta función es INTERNA, no exponer
const calcularScoreInterno = (postulante: any, oferta: any): number => {
  let score = 0;
  
  // Habilidades coincidentes (peso: 40%)
  const habilidadesCoincidentes = postulante.habilidades
    .filter((h: string) => oferta.habilidades_requeridas.includes(h));
  score += (habilidadesCoincidentes.length / oferta.habilidades_requeridas.length) * 40;
  
  // Experiencia (peso: 30%)
  if (postulante.anos_experiencia >= oferta.experiencia_minima) {
    score += 30;
  }
  
  // Ubicación (peso: 20%)
  if (postulante.ubicacion === oferta.ubicacion || oferta.remoto) {
    score += 20;
  }
  
  // Educación (peso: 10%)
  if (cumpleEducacion(postulante.educacion, oferta.educacion_minima)) {
    score += 10;
  }
  
  return score;
};
```

#### Checklist de Dara:
- [ ] Solo postulantes pueden crear postulaciones
- [ ] Verificación de postulación duplicada
- [ ] Límite de 10 postulaciones por día
- [ ] Solo se puede postular a ofertas activas
- [ ] Algoritmo de matching no expone detalles
- [ ] WSO2 configurado con JWT en todas las rutas
- [ ] Todas las rutas de negocio publicadas en WSO2

---

## 4. Checklist de Validación de Código

### Checklist General (Aplicar a TODOS)

| # | Verificación | Comando/Herramienta | Criterio de Aprobación |
|---|--------------|---------------------|------------------------|
| 1 | Secretos en código | `git secrets --scan` | 0 secretos detectados |
| 2 | Dependencias vulnerables | `npm audit` | 0 vulnerabilidades críticas/altas |
| 3 | Análisis estático | `npm run lint` | 0 errores de seguridad |
| 4 | Cobertura de tests | `npm run test:coverage` | > 80% cobertura |
| 5 | Validación de inputs | Revisión manual | Todos los inputs validados |
| 6 | Manejo de errores | Revisión manual | No expone info sensible |
| 7 | Logs seguros | Revisión manual | No loguea datos sensibles |

### Matriz de Validación por Desarrollador

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE VALIDACIÓN DE SEGURIDAD                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DESARROLLADOR         CHECKLIST          ESTADO       FECHA    VALIDADOR  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Alex Ramírez          [ ] A1-A7          ⏳ Pendiente    -      Erick     │
│  Carlos Mejia          [ ] C1-C7          ⏳ Pendiente    -      Erick     │
│  Juan Espinosa         [ ] J1-J6          ⏳ Pendiente    -      Erick     │
│  Sebastián Calderón    [ ] S1-S6          ⏳ Pendiente    -      Erick     │
│  Erick Gaona           [ ] E1-E6          ⏳ Pendiente    -      Carlos    │
│  Dara Van Gijsel       [ ] D1-D6          ⏳ Pendiente    -      Erick     │
│                                                                             │
│  LEYENDA:  ⏳ Pendiente   🔄 En Revisión   ✅ Aprobado   ❌ Rechazado      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Herramientas de Validación

### 5.1 Configuración de ESLint con Reglas de Seguridad

```javascript
// .eslintrc.js - OBLIGATORIO EN EL PROYECTO
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended'
  ],
  plugins: ['@typescript-eslint', 'security'],
  rules: {
    // Reglas de seguridad
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-possible-timing-attacks': 'warn',
    
    // Otras reglas importantes
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error'
  }
};
```

### 5.2 Scripts de package.json

```json
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "security:scan": "npm run lint && npm run audit",
    "pre-commit": "npm run security:scan && npm run test"
  }
}
```

### 5.3 GitHub Actions para CI/CD Seguro

```yaml
# .github/workflows/security.yml
name: Security Check

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint Security
        run: npm run lint
        
      - name: Run npm audit
        run: npm audit --audit-level=high
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Check secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
```

---

## 6. Proceso de Revisión de Código

### 6.1 Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE REVISIÓN DE SEGURIDAD                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   DESARROLLADOR              ERICK (Seguridad)           MAIN BRANCH       │
│        │                           │                           │            │
│        │  1. Desarrolla feature    │                           │            │
│        │─────────────────────────> │                           │            │
│        │                           │                           │            │
│        │  2. Ejecuta security:scan │                           │            │
│        │     localmente            │                           │            │
│        │                           │                           │            │
│        │  3. Crea Pull Request     │                           │            │
│        │─────────────────────────> │                           │            │
│        │                           │                           │            │
│        │                           │  4. Revisa código         │            │
│        │                           │     vs checklist          │            │
│        │                           │                           │            │
│        │  5. Si hay problemas      │                           │            │
│        │ <─────────────────────────│                           │            │
│        │     Corregir y re-push    │                           │            │
│        │                           │                           │            │
│        │                           │  6. Si está bien          │            │
│        │                           │─────────────────────────> │            │
│        │                           │     Aprobar y Merge       │            │
│        │                           │                           │            │
└─────────┴───────────────────────────┴───────────────────────────┴────────────┘
```

### 6.2 Template para Pull Request

```markdown
## Descripción
[Descripción breve del cambio]

## Checklist de Seguridad (completar antes de solicitar revisión)

### General
- [ ] No hay secretos hardcodeados
- [ ] `npm audit` sin vulnerabilidades críticas/altas
- [ ] `npm run lint` sin errores
- [ ] Tests pasan con > 80% cobertura

### Específico de mi tarea
- [ ] [Checklist específico según la sección 3]

### Evidencia
- Screenshot de `npm run security:scan`:
- Screenshot de cobertura de tests:

## Notas para el revisor
[Cualquier contexto adicional]
```

### 6.3 Criterios de Aprobación

| Criterio | Obligatorio | Descripción |
|----------|-------------|-------------|
| Sin secretos | ✅ Sí | Ningún secreto en el código |
| npm audit clean | ✅ Sí | 0 vulnerabilidades críticas/altas |
| ESLint sin errores | ✅ Sí | Todas las reglas de seguridad pasan |
| Tests > 80% | ✅ Sí | Cobertura mínima de código |
| Checklist específico | ✅ Sí | Todos los items del checklist marcados |
| Inputs validados | ✅ Sí | Todos los inputs del usuario validados |
| Errores manejados | ✅ Sí | No exponer info sensible en errores |

---

## 7. Seguridad de APIs y Comunicación

Esta sección explica cómo implementar comunicación segura entre servicios, proteger los endpoints y evitar fugas de información.

### 7.1 Principios de Comunicación Segura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMUNICACIÓN SEGURA ENTRE SERVICIOS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CLIENTE (App/Web)                                                         │
│        │                                                                    │
│        │ 1. HTTPS (TLS 1.3)                                                │
│        │ 2. JWT en header Authorization                                    │
│        │ 3. Sin datos sensibles en URL                                     │
│        ▼                                                                    │
│   ┌──────────────┐                                                          │
│   │ WSO2 Gateway │ ◄── Valida JWT, Rate Limit, Logs                        │
│   └──────┬───────┘                                                          │
│          │                                                                  │
│          │ 4. Reenvía solo si JWT válido                                   │
│          │ 5. Agrega headers internos                                      │
│          ▼                                                                  │
│   ┌──────────────┐                                                          │
│   │   Backend    │ ◄── Valida de nuevo, procesa, responde                  │
│   │  Cloud Run   │                                                          │
│   └──────┬───────┘                                                          │
│          │                                                                  │
│          │ 6. Conexión segura a Firestore                                  │
│          ▼                                                                  │
│   ┌──────────────┐                                                          │
│   │  Firestore   │ ◄── Security Rules + Cifrado en reposo                  │
│   └──────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Cómo Llamar a una API de Manera Segura

#### ❌ INCORRECTO - Llamada Insegura

```typescript
// NUNCA hacer esto
const response = await fetch('http://api.cail.ec/users?password=123456');

// Problemas:
// 1. HTTP en lugar de HTTPS (tráfico no cifrado)
// 2. Password en la URL (se guarda en logs, historial)
// 3. Sin autenticación
```

#### ✅ CORRECTO - Llamada Segura

```typescript
// Así se debe hacer
const response = await fetch('https://api.cail.ec/api/v1/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,  // JWT en header
    'X-Request-ID': generateRequestId(),        // Para tracking
  },
  body: JSON.stringify({
    email: userEmail,    // Datos sensibles en el body, no en URL
    password: password   // Nunca en URL
  })
});

// Manejar respuesta sin exponer errores internos
if (!response.ok) {
  const error = await response.json();
  console.error('Request failed:', error.message); // Solo mensaje, no detalles
  throw new Error('Error en la solicitud');
}
```

### 7.3 Protección de Endpoints

#### Headers de Seguridad Obligatorios (Helmet)

```typescript
// src/config/security.ts
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const configureSecurityMiddleware = (app: Express) => {
  // 1. HELMET - Headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,        // 1 año
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,             // X-Content-Type-Options: nosniff
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    xssFilter: true            // X-XSS-Protection
  }));

  // 2. CORS - Solo dominios permitidos
  app.use(cors({
    origin: [
      'https://cail.ec',
      'https://app.cail.ec',
      'https://admin.cail.ec'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400  // Cache preflight por 24 horas
  }));

  // 3. RATE LIMITING - Prevenir abuso
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 100,                   // 100 requests por ventana
    message: { error: 'Demasiadas solicitudes, intente más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // 4. Limitar tamaño del body
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
};
```

### 7.4 Seguridad de Puertos y Exposición

#### Configuración Segura de Puertos

| Puerto | Servicio | Exposición | Configuración Segura |
|--------|----------|------------|---------------------|
| 8080 | Backend (Cloud Run) | Interna | Solo accesible desde Gateway |
| 443 | WSO2 Gateway | Pública | HTTPS obligatorio |
| 443 | Firestore | Google Cloud | Conexión SDK (no directa) |
| 9229 | Node Debug | ⛔ NUNCA | Deshabilitado en producción |

#### Dockerfile - Solo Exponer Puerto Necesario

```dockerfile
# ✅ CORRECTO
EXPOSE 8080

# ❌ INCORRECTO - No exponer múltiples puertos
# EXPOSE 8080 9229 3000
```

#### Variables de Entorno para Puertos

```typescript
// ✅ CORRECTO - Puerto desde variable de entorno
const PORT = process.env.PORT || 8080;

// ❌ INCORRECTO - Puerto hardcodeado
const PORT = 8080;
```

### 7.5 Prevención de Fugas de Información

#### Qué NO debe salir nunca en responses:

```typescript
// ❌ INCORRECTO - Expone información sensible
res.status(500).json({
  error: err.message,
  stack: err.stack,           // Expone código interno
  query: req.query,           // Expone parámetros
  headers: req.headers,       // Expone tokens
  user: {
    password: user.password,  // Expone contraseña
    cedula: user.cedula       // Expone datos personales completos
  }
});

// ✅ CORRECTO - Respuesta segura
res.status(500).json({
  status: 'error',
  message: 'Error interno del servidor',
  requestId: req.requestId    // Solo para tracking
});
```

#### Qué NO debe aparecer en logs:

```typescript
// ❌ INCORRECTO
console.log('Login attempt:', { email, password });
console.log('Token:', token);
console.log('User data:', user);

// ✅ CORRECTO
console.log('Login attempt:', { email, timestamp: new Date() });
console.log('Token generated for user:', userId);
console.log('User action:', { userId, action: 'login', success: true });
```

### 7.6 Comunicación Segura entre Microservicios (Futuro)

Cuando migren a microservicios, así deben comunicarse:

```typescript
// offers-service llamando a users-service

import axios from 'axios';

class UsersServiceClient {
  private baseUrl: string;
  private serviceToken: string;

  constructor() {
    // URLs desde variables de entorno
    this.baseUrl = process.env.USERS_SERVICE_URL || 'http://users-service:8082';
    this.serviceToken = process.env.INTERNAL_SERVICE_TOKEN;
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/users/${userId}`, {
        headers: {
          // Token de servicio-a-servicio (diferente al JWT de usuario)
          'Authorization': `Bearer ${this.serviceToken}`,
          'X-Service-Name': 'offers-service',
          'X-Request-ID': generateRequestId(),
        },
        timeout: 5000,  // Timeout de 5 segundos
        validateStatus: (status) => status < 500
      });

      if (response.status === 404) {
        throw new NotFoundError('Usuario no encontrado');
      }

      return response.data;
    } catch (error) {
      // Log sin exponer detalles
      console.error('Error calling users-service:', {
        userId,
        errorCode: error.code,
        timestamp: new Date()
      });
      throw new ServiceUnavailableError('Servicio de usuarios no disponible');
    }
  }
}
```

---

## 8. Notas Importantes por Desarrollador

### 📌 ALEX RAMÍREZ - Infraestructura y Auth

> **ASEGURARSE DE:**

| # | Nota Importante | Por qué |
|---|-----------------|---------|
| 1 | **Instalar Helmet ANTES de definir rutas** | Si se pone después, las rutas no tendrán los headers de seguridad |
| 2 | **CORS no debe ser `origin: '*'`** | Permite que cualquier sitio llame a tu API (inseguro) |
| 3 | **Rate limit diferente para login** | Login debe ser más estricto (5 intentos) que endpoints normales (100) |
| 4 | **PASSWORD: 12+ caracteres obligatorio** | Menos de 12 es vulnerable a fuerza bruta |
| 5 | **No revelar si email existe en registro** | Un atacante puede enumerar usuarios |
| 6 | **Dockerfile: USER después de COPY** | Si pones USER antes, no podrás copiar archivos |

```typescript
// ⚠️ EJEMPLO: Orden correcto de middleware
app.use(helmet());           // 1. Primero seguridad
app.use(cors(corsOptions));  // 2. Luego CORS
app.use(rateLimiter);        // 3. Luego rate limit
app.use(express.json());     // 4. Luego parsers
app.use('/api', routes);     // 5. Al final rutas
```

---

### 📌 CARLOS MEJIA - JWT y WSO2

> **ASEGURARSE DE:**

| # | Nota Importante | Por qué |
|---|-----------------|---------|
| 1 | **JWT_SECRET mínimo 256 bits (32 chars)** | Menos es vulnerable a fuerza bruta |
| 2 | **Access token: 1 hora máximo** | Tokens largos son más riesgosos si se filtran |
| 3 | **Refresh token: 7 días máximo** | Después de 7 días, forzar re-login |
| 4 | **Verificar token EN CADA REQUEST** | No cachear resultados de verificación |
| 5 | **No poner datos sensibles en el JWT** | El JWT puede ser decodificado (solo está firmado, no cifrado) |
| 6 | **WSO2: Validar JWT antes de reenviar** | El backend NO debe confiar ciegamente |

```typescript
// ⚠️ EJEMPLO: Qué poner y qué NO en el JWT
// ✅ CORRECTO
const payload = {
  uid: user.id,
  email: user.email,
  role: user.tipoUsuario,
  iat: Date.now()
};

// ❌ INCORRECTO - Nunca incluir esto
const payload = {
  password: user.password,      // NUNCA
  cedula: user.cedula,          // NUNCA datos sensibles
  creditCard: user.creditCard   // NUNCA
};
```

---

### 📌 JUAN ESPINOSA - Firestore y Usuarios

> **ASEGURARSE DE:**

| # | Nota Importante | Por qué |
|---|-----------------|---------|
| 1 | **Firestore Rules son OBLIGATORIAS** | Sin ellas, cualquiera puede leer/escribir TODO |
| 2 | **Verificar propiedad en código Y en rules** | Doble capa de seguridad |
| 3 | **Sanitizar ANTES de guardar, no después** | Si guardas datos maliciosos, ya es tarde |
| 4 | **No usar IDs secuenciales** | Facilita enumerar usuarios (id=1, id=2, id=3...) |
| 5 | **Logs de auditoría para cambios críticos** | Para investigar incidentes |
| 6 | **No confiar en `type` del frontend** | Siempre validar rol en backend |

```javascript
// ⚠️ EJEMPLO: Firestore Rules básicas
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Un usuario SOLO puede leer/escribir SU documento
    match /cuentas/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Las ofertas solo las pueden crear reclutadores
    match /ofertas/{ofertaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/cuentas/$(request.auth.uid)).data.tipoUsuario == 'reclutador';
    }
  }
}
```

---

### 📌 SEBASTIÁN CALDERÓN - Perfiles de Usuario

> **ASEGURARSE DE:**

| # | Nota Importante | Por qué |
|---|-----------------|---------|
| 1 | **Validar cédula en BACKEND, no solo frontend** | El frontend puede ser bypaseado |
| 2 | **Upload de CV: validar MIME type en backend** | El frontend solo valida extensión, un atacante puede cambiarla |
| 3 | **Límite de 5MB en el servidor** | Configurar en multer Y en nginx/express |
| 4 | **No retornar cédula completa en listados** | Mostrar solo primeros 4 dígitos: `0102******` |
| 5 | **Respetar configuración de privacidad** | Si usuario dice "no mostrar email", NO mostrarlo |
| 6 | **Validar RUC para empresas** | 13 dígitos, algoritmo de validación |

```typescript
// ⚠️ EJEMPLO: Validación de cédula ecuatoriana
function validarCedulaEC(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
  const tercerDigito = parseInt(cedula.charAt(2));
  if (tercerDigito > 5) return false;
  
  // Algoritmo Módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
    if (valor > 9) valor -= 9;
    suma += valor;
  }
  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === parseInt(cedula.charAt(9));
}
```

---

### 📌 ERICK GAONA - Ofertas

> **ASEGURARSE DE:**

| # | Nota Importante | Por qué |
|---|-----------------|---------|
| 1 | **Verificar rol ANTES de crear oferta** | Solo reclutadores pueden crear |
| 2 | **Sanitizar descripción de oferta** | Puede contener scripts maliciosos |
| 3 | **Paginación obligatoria, máximo 50** | Evitar que alguien descargue toda la base de datos |
| 4 | **Validar rangos de salario** | salario_min <= salario_max, ambos positivos |
| 5 | **No permitir HTML peligroso** | Solo tags seguros: `<b>`, `<i>`, `<ul>`, `<li>`, `<p>` |
| 6 | **Rate limiting en búsqueda** | Evitar scraping masivo |

```typescript
// ⚠️ EJEMPLO: Sanitización de descripción
import sanitizeHtml from 'sanitize-html';

const sanitizedDescription = sanitizeHtml(oferta.descripcion, {
  allowedTags: ['b', 'i', 'u', 'p', 'br', 'ul', 'ol', 'li'],
  allowedAttributes: {},  // Ningún atributo permitido
  disallowedTagsMode: 'discard'
});
```

---

### 📌 DARA VAN GIJSEL - Matching y Postulación

> **ASEGURARSE DE:**

| # | Nota Importante | Por qué |
|---|-----------------|---------|
| 1 | **Verificar que usuario es POSTULANTE** | Reclutadores no deben poder postularse |
| 2 | **Verificar que oferta está ACTIVA** | No postular a ofertas cerradas |
| 3 | **Verificar postulación duplicada ANTES** | Evitar múltiples postulaciones |
| 4 | **Límite de 10 postulaciones por día** | Evitar spam de postulaciones |
| 5 | **No exponer lógica de matching** | Solo retornar score, no el breakdown |
| 6 | **WSO2: Todas las rutas con JWT** | Ningún endpoint público sin auth |

```typescript
// ⚠️ EJEMPLO: Verificaciones antes de postular
async function crearPostulacion(postulanteId: string, ofertaId: string) {
  // 1. Verificar que es postulante
  const cuenta = await getCuenta(postulanteId);
  if (cuenta.tipoUsuario !== 'postulante') {
    throw new ForbiddenError('Solo postulantes pueden postularse');
  }
  
  // 2. Verificar que oferta está activa
  const oferta = await getOferta(ofertaId);
  if (oferta.estado !== 'activa') {
    throw new BadRequestError('La oferta no está disponible');
  }
  
  // 3. Verificar postulación duplicada
  const existente = await getPostulacion(postulanteId, ofertaId);
  if (existente) {
    throw new ConflictError('Ya te postulaste a esta oferta');
  }
  
  // 4. Verificar límite diario
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const countHoy = await countPostulacionesDesde(postulanteId, hoy);
  if (countHoy >= 10) {
    throw new TooManyRequestsError('Límite diario de postulaciones alcanzado');
  }
  
  // Si pasa todo, crear postulación
  return await savePostulacion({ postulanteId, ofertaId, estado: 'pendiente' });
}
```

---



*Documento actualizado: 07 Enero 2026*  
*Versión: 2.1*

