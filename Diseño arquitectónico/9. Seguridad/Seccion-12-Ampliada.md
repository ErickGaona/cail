# Sección 12: SEGURIDAD (Versión Ampliada)

> **Nota:** Este documento contiene las mejoras solicitadas para la sección de seguridad del SAD-CAIL. 
> Incluye las nuevas subsecciones 12.6, 12.7, 12.8, 12.9 y las mejoras a 12.2 y 12.3.

---

## 12.2. Seguridad de Aplicaciones Web (OWASP) — MEJORADO

### Enfoque
Esta sección detalla los controles de seguridad **específicos para la versión web** de CAIL, accesible mediante navegador. Se diferencia de los controles móviles (12.3) para evitar redundancia.

### Controles Específicos Web

| Control | Implementación | Justificación OWASP |
|---------|----------------|---------------------|
| **CSP (Content Security Policy)** | Headers HTTP estrictos: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` | Previene XSS (A03:2021) |
| **CORS** | Allowlist de dominios autorizados: `*.cail.ec`, `*.firebaseapp.com` | Previene CSRF y data leakage |
| **Cookie Security** | Flags: `HttpOnly`, `Secure`, `SameSite=Strict` | Protege sesiones (A07:2021) |
| **Rate Limiting** | Throttling en WSO2 Gateway: 100 req/min por IP, 1000 req/min por usuario | Previene DoS y brute-force |
| **Subresource Integrity (SRI)** | Hash SHA-384 para scripts externos de CDN | Previene supply-chain attacks |
| **X-Frame-Options** | `DENY` para prevenir clickjacking | Protección de UI |
| **X-Content-Type-Options** | `nosniff` para prevenir MIME sniffing | Previene ejecución maliciosa |

### Controles en Capa de Presentación (React Web)

```javascript
// Ejemplo: Sanitización de inputs en formularios React
import DOMPurify from 'dompurify';

const sanitizeInput = (userInput) => {
  return DOMPurify.sanitize(userInput, {
    ALLOWED_TAGS: [], // Solo texto plano
    ALLOWED_ATTR: []
  });
};

// Uso en formulario de búsqueda de ofertas
const handleSearch = (searchTerm) => {
  const cleanTerm = sanitizeInput(searchTerm);
  // Enviar a API Gateway
};
```

---

## 12.3. Seguridad de Aplicaciones Móviles (OWASP) — MEJORADO

### Enfoque
Esta sección detalla los controles de seguridad **exclusivos para las apps iOS y Android** de CAIL, desarrolladas en React Native. Los riesgos móviles difieren significativamente de los web.

### Controles Específicos por Plataforma

| Control | Android | iOS |
|---------|---------|-----|
| **Almacenamiento Seguro de Tokens** | `EncryptedSharedPreferences` + Android Keystore | Keychain Services con `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` |
| **Detección de Root/Jailbreak** | RootBeer library + SafetyNet Attestation API | IOSSecuritySuite + DeviceCheck API |
| **Certificate Pinning** | OkHttp `CertificatePinner` con SHA-256 | `URLSession` con `NSURLSessionPinningDelegate` |
| **Ofuscación de Código** | ProGuard/R8 en release builds | Habilitado por defecto + Bitcode |
| **Biometría** | `BiometricPrompt` API (Clase 3) | `LocalAuthentication` (Face ID/Touch ID) |
| **Prevención de Screenshot** | `FLAG_SECURE` en Activities con datos sensibles | No disponible nativamente (advertencia al usuario) |
| **Anti-Tampering** | Verificación de firma APK en runtime | App Transport Security (ATS) |
| **Secure Clipboard** | Timeout de 60s para datos copiados | `UIPasteboard` con `expirationDate` |

### Ejemplo: Almacenamiento Seguro en React Native

```javascript
// Uso de react-native-keychain para almacenamiento seguro
import * as Keychain from 'react-native-keychain';

// Guardar token de forma segura
const storeToken = async (token) => {
  await Keychain.setGenericPassword('authToken', token, {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE, // Android Keystore
  });
};

// Recuperar token
const getToken = async () => {
  const credentials = await Keychain.getGenericPassword();
  return credentials ? credentials.password : null;
};
```

### Detección de Dispositivo Comprometido

```javascript
// Pseudocódigo para detección de root/jailbreak
import { isRooted, isJailbroken } from 'react-native-device-info';

const checkDeviceSecurity = async () => {
  const isCompromised = Platform.OS === 'android' 
    ? await isRooted() 
    : await isJailbroken();
  
  if (isCompromised) {
    // Bloquear acceso a funciones sensibles
    Alert.alert(
      'Dispositivo No Seguro',
      'Esta aplicación no puede ejecutarse en dispositivos modificados.'
    );
    return false;
  }
  return true;
};
```

---

## 12.6. Análisis de Amenazas y Matriz de Riesgos — NUEVA SECCIÓN

Esta sección documenta el análisis sistemático de amenazas basado en los estándares OWASP Top 10 (2021) y OWASP Mobile Top 10 (2024), clasificando cada riesgo según su probabilidad, impacto y las mitigaciones implementadas.

### 12.6.1. Matriz de Riesgos OWASP Top 10 Web (2021)

| ID | Amenaza OWASP | Probabilidad | Impacto | Riesgo | Mitigación Implementada en CAIL |
|----|---------------|--------------|---------|--------|----------------------------------|
| A01:2021 | **Broken Access Control** | Media | Alto | **ALTO** | RBAC en Firebase Security Rules + validación server-side en Cloud Functions. Regla: `allow read: if request.auth.uid == resource.data.userId` |
| A02:2021 | **Cryptographic Failures** | Baja | Alto | Medio | TLS 1.3 obligatorio en todas las conexiones + Argon2id para hashing de contraseñas con salt único |
| A03:2021 | **Injection** | Media | Alto | **ALTO** | Firestore SDK no usa SQL. Validación de inputs con Zod schema. Sanitización HTML con DOMPurify |
| A04:2021 | **Insecure Design** | Baja | Medio | Bajo | Threat modeling en fase de diseño. Revisión de arquitectura por Security Champion |
| A05:2021 | **Security Misconfiguration** | Media | Medio | Medio | IaC auditado + Firebase Security Rules testing con emulador. Firestore rules coverage > 90% |
| A06:2021 | **Vulnerable Components** | Media | Alto | **ALTO** | Dependabot habilitado en GitHub + `npm audit` obligatorio en CI/CD pipeline. Bloqueo de builds con vulnerabilidades críticas |
| A07:2021 | **Auth Failures** | Baja | Alto | Medio | Firebase Auth con MFA opcional + rate limiting (5 intentos/15min). Tokens JWT con expiración de 1 hora |
| A08:2021 | **Data Integrity Failures** | Baja | Medio | Bajo | Verificación de firma en actualizaciones OTA (Expo Updates). Integridad de bundle verificada |
| A09:2021 | **Logging Failures** | Media | Medio | Medio | Cloud Logging + alertas automáticas en Security Command Center. Retención de logs: 90 días |
| A10:2021 | **SSRF** | Baja | Alto | Medio | Validación de URLs + allowlist de dominios externos (Registro Civil, Senescyt). No se permiten URLs dinámicas |

### 12.6.2. Matriz de Riesgos OWASP Mobile Top 10 (2024)

| ID | Amenaza Mobile | Probabilidad | Impacto | Riesgo | Mitigación Específica en CAIL |
|----|----------------|--------------|---------|--------|-------------------------------|
| M1 | **Improper Platform Usage** | Media | Alto | **ALTO** | Uso correcto de APIs nativas: Keychain (iOS), Keystore (Android). No almacenamiento en AsyncStorage para datos sensibles |
| M2 | **Insecure Data Storage** | Alta | Alto | **CRÍTICO** | `EncryptedSharedPreferences` (Android) / Keychain (iOS). Base de datos local cifrada con SQLCipher si se requiere offline |
| M3 | **Insecure Communication** | Baja | Alto | Medio | Certificate Pinning implementado. TLS 1.3. No se permite HTTP en ningún caso (ATS enforced) |
| M4 | **Insecure Authentication** | Media | Alto | **ALTO** | Biometría + tokens JWT con refresh. Session timeout: 30 min inactividad. Re-autenticación para operaciones críticas |
| M5 | **Insufficient Cryptography** | Baja | Alto | Medio | AES-256-GCM para datos locales. No se implementa criptografía custom, solo APIs nativas |
| M6 | **Insecure Authorization** | Media | Alto | **ALTO** | Validación de permisos server-side en Cloud Functions. El cliente nunca es fuente de verdad para autorizaciones |
| M7 | **Client Code Quality** | Media | Medio | Medio | ESLint con plugins de seguridad (`eslint-plugin-security`). Code review obligatorio. SonarQube en CI |
| M8 | **Code Tampering** | Baja | Alto | Medio | ProGuard/R8 ofuscación. Detección de root/jailbreak. Verificación de integridad del APK/IPA |
| M9 | **Reverse Engineering** | Media | Medio | Medio | API keys nunca en código cliente. Secrets en variables de entorno del backend. Ofuscación de código |
| M10 | **Extraneous Functionality** | Baja | Bajo | Bajo | Eliminación de `console.log` en release. No hay endpoints de debug en producción. Build variants separados |

### 12.6.3. Ejemplo de Mitigación: Validación de Inputs con Zod

```typescript
// Cloud Function - Validación robusta para prevenir injection
import { z } from 'zod';
import * as functions from 'firebase-functions';
import { sanitizeHtml } from 'sanitize-html';

// Schema de validación para postulación a oferta
const JobApplicationSchema = z.object({
  jobId: z.string()
    .uuid({ message: 'ID de oferta inválido' }),
  
  userId: z.string()
    .min(20, 'UID demasiado corto')
    .max(128, 'UID demasiado largo')
    .regex(/^[a-zA-Z0-9]+$/, 'UID contiene caracteres inválidos'),
  
  coverLetter: z.string()
    .min(50, 'La carta debe tener al menos 50 caracteres')
    .max(2000, 'La carta no puede exceder 2000 caracteres')
    .transform(val => sanitizeHtml(val, {
      allowedTags: [],      // Solo texto plano
      allowedAttributes: {} // Sin atributos HTML
    })),
  
  expectedSalary: z.number()
    .positive('El salario debe ser positivo')
    .max(100000, 'Salario fuera de rango')
    .optional(),
});

// Cloud Function con validación completa
export const applyToJob = functions.https.onCall(async (data, context) => {
  // 1. Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'Debe iniciar sesión para postularse'
    );
  }
  
  // 2. Validar y sanitizar inputs
  const parseResult = JobApplicationSchema.safeParse(data);
  if (!parseResult.success) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      parseResult.error.errors[0].message
    );
  }
  const validatedData = parseResult.data;
  
  // 3. Verificar autorización (RBAC)
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();
  
  if (userDoc.data()?.role !== 'candidate') {
    throw new functions.https.HttpsError(
      'permission-denied', 
      'Solo los candidatos pueden postularse'
    );
  }
  
  // 4. Verificar que el usuario autenticado coincide con userId
  if (validatedData.userId !== context.auth.uid) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'No puede postularse en nombre de otro usuario'
    );
  }
  
  // 5. Procesar solicitud segura
  return await createApplication(validatedData);
});
```

### 12.6.4. Diagrama de Secuencia: Flujo de Autenticación Segura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  App Móvil   │     │    WSO2      │     │   Firebase   │     │    Cloud     │     │  Firestore   │
│   (React     │     │   Gateway    │     │     Auth     │     │  Functions   │     │              │
│   Native)    │     │              │     │              │     │              │     │              │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │                    │
       │ 1. Login Request   │                    │                    │                    │
       │ (email, password)  │                    │                    │                    │
       │───────────────────────────────────────>│                    │                    │
       │                    │                    │                    │                    │
       │                    │                    │ 2. Validate        │                    │
       │                    │                    │ credentials        │                    │
       │                    │                    │ (Argon2 hash)      │                    │
       │                    │                    │                    │                    │
       │ 3. Return Tokens   │                    │                    │                    │
       │ (ID Token + Refresh Token)             │                    │                    │
       │<───────────────────────────────────────│                    │                    │
       │                    │                    │                    │                    │
       │ 4. Store tokens    │                    │                    │                    │
       │ securely           │                    │                    │                    │
       │ (Keychain/Keystore)│                    │                    │                    │
       │                    │                    │                    │                    │
       │ 5. API Request     │                    │                    │                    │
       │ + Bearer Token     │                    │                    │                    │
       │──────────────────>│                    │                    │                    │
       │                    │                    │                    │                    │
       │                    │ 6. Rate Limit      │                    │                    │
       │                    │ Check (100 req/min)│                    │                    │
       │                    │                    │                    │                    │
       │                    │ 7. Validate JWT    │                    │                    │
       │                    │──────────────────>│                    │                    │
       │                    │                    │                    │                    │
       │                    │ 8. Token Valid     │                    │                    │
       │                    │ + User Claims      │                    │                    │
       │                    │<──────────────────│                    │                    │
       │                    │                    │                    │                    │
       │                    │ 9. Forward Request │                    │                    │
       │                    │ (if authorized)    │                    │                    │
       │                    │───────────────────────────────────────>│                    │
       │                    │                    │                    │                    │
       │                    │                    │                    │ 10. Apply Security │
       │                    │                    │                    │ Rules & Query      │
       │                    │                    │                    │──────────────────>│
       │                    │                    │                    │                    │
       │                    │                    │                    │ 11. Return Data    │
       │                    │                    │                    │ (filtered by rules)│
       │                    │                    │                    │<──────────────────│
       │                    │                    │                    │                    │
       │ 12. Response       │                    │                    │                    │
       │ (TLS 1.3 encrypted)│                    │                    │                    │
       │<──────────────────────────────────────────────────────────────│                    │
       │                    │                    │                    │                    │
```

**Notas del Diagrama:**
- **Paso 4:** Los tokens nunca se almacenan en AsyncStorage o localStorage, solo en almacenamiento seguro del sistema operativo.
- **Paso 6:** WSO2 implementa throttling para prevenir ataques de fuerza bruta.
- **Paso 10:** Las Security Rules de Firestore actúan como última línea de defensa, verificando que el usuario solo acceda a sus propios datos.

---

## 12.7. Métricas y Monitoreo de Seguridad — NUEVA SECCIÓN

### 12.7.1. KPIs de Seguridad

| Métrica | Objetivo (SLO) | Frecuencia | Herramienta | Responsable |
|---------|----------------|------------|-------------|-------------|
| Tasa de detección de vulnerabilidades SAST | ≥ 95% | Por commit | SonarQube | DevSecOps |
| Cobertura de Security Rules testing | ≥ 90% | Por release | Firebase Emulator | Backend Dev |
| Tiempo medio de parcheo (MTTR) - Crítico | < 24 horas | Por incidente | Jira + PagerDuty | CSIRT |
| Tiempo medio de parcheo (MTTR) - Alto | < 72 horas | Por incidente | Jira | DevSecOps |
| Tasa de falsos positivos WAF | < 5% | Semanal | WSO2 Analytics | Infra |
| Intentos de login fallidos consecutivos | Alerta si > 5/15min | Tiempo real | Firebase Auth + Cloud Monitoring | Security |
| Dependencias con vulnerabilidades conocidas | 0 críticas, < 5 altas | Diario | Dependabot + npm audit | DevSecOps |
| Auditorías de seguridad externas | 1 por semestre | Semestral | Proveedor certificado | Gerencia |
| Cumplimiento OWASP Top 10 | 100% mitigaciones | Trimestral | Checklist interno | Security Champion |
| Cobertura de tests de seguridad | ≥ 80% | Por sprint | Jest + Detox | QA |

### 12.7.2. Herramientas de Monitoreo en Tiempo Real

| Herramienta | Propósito | Integración con CAIL |
|-------------|-----------|----------------------|
| **Google Cloud Security Command Center** | Monitoreo centralizado de vulnerabilidades, amenazas y configuraciones incorrectas en GCP | Habilitado para proyecto Firebase |
| **Firebase Crashlytics** | Detección de crashes, incluyendo los relacionados con seguridad (memory corruption, stack overflow) | SDK integrado en React Native |
| **Cloud Audit Logs** | Registro inmutable de todas las operaciones administrativas en GCP/Firebase | Habilitado por defecto, retención 400 días |
| **Sentry** | Monitoreo de errores en tiempo real con stack traces completos | SDK integrado en frontend y Cloud Functions |
| **WSO2 Analytics** | Métricas de tráfico API, detección de patrones anómalos, rate limiting | Dashboard configurado |

### 12.7.3. Alertas Automatizadas

| Evento | Severidad | Canal de Notificación | Tiempo de Respuesta |
|--------|-----------|----------------------|---------------------|
| Múltiples intentos de login fallidos (>5/15min) | Media | Slack #security-alerts | < 1 hora |
| Acceso desde país no autorizado | Alta | Email + Slack + PagerDuty | < 30 min |
| Vulnerabilidad crítica detectada en dependencia | Crítica | Email + Slack + PagerDuty | Inmediato |
| Cambio en Security Rules de Firestore | Alta | Slack #security-alerts | < 1 hora |
| Pico anormal de tráfico (>300% promedio) | Media | Slack #infra-alerts | < 1 hora |
| Error rate > 5% en Cloud Functions | Alta | PagerDuty | < 30 min |

---

## 12.8. Referencias Cruzadas de Seguridad — NUEVA SECCIÓN

Esta sección establece las conexiones explícitas entre los controles de seguridad y otras vistas arquitectónicas del documento, asegurando una visión integral.

| Sección Relacionada | Relación con Seguridad |
|---------------------|------------------------|
| **9. Vista de Despliegue** | La redundancia geográfica de Firebase (multi-región `us-central1` + `europe-west1`) soporta la **disponibilidad** durante ataques DDoS. El diagrama 9.2 muestra la topología de red donde el WAF perimetral protege el acceso al API Gateway WSO2. |
| **11. Vista de Calidad (Disponibilidad)** | El SLO del **99.9% de uptime** se mantiene mediante los controles del IRP (12.4). En caso de incidente S1, el failover automático a región secundaria garantiza continuidad del servicio. |
| **11. Vista de Calidad (Escalabilidad)** | La arquitectura serverless permite **escalado automático** durante ataques volumétricos, absorbiendo picos sin degradación. Cloud Functions escala a miles de instancias en segundos. |
| **10. Vista de Datos** | Las políticas de retención de datos (12.5) se implementan mediante **Cloud Scheduler + Cloud Functions** que ejecutan purga automática de cuentas inactivas (24 meses) y logs (90 días). |
| **8. Vista de Implementación** | El pipeline CI/CD (8.6) incluye **gates de seguridad obligatorios**: SAST (SonarQube), dependency scanning (npm audit), y Security Rules testing. Un build con vulnerabilidades críticas es bloqueado automáticamente. |
| **6. Vista Lógica** | Las clases `AuthService` y `TokenService` del diagrama de clases implementan los patrones de autenticación descritos en 12.3 y 12.6.4. |
| **7. Vista de Procesos** | Los diagramas de secuencia CU01 y CU02 muestran la integración con Registro Civil y Senescyt, cuya comunicación se realiza sobre **TLS 1.3** con validación de certificados. |

---

## 12.9. Plan de Cumplimiento y Auditoría — NUEVA SECCIÓN

### 12.9.1. Roadmap de Certificaciones

| Certificación | Estado | Fecha Objetivo | Responsable | Notas |
|---------------|--------|----------------|-------------|-------|
| **LOPDP (Ecuador)** | ✅ **Cumplido** | Actual | Legal + Arquitectura | Implementado en Política de Privacidad y mecanismo de Consentimiento Informado |
| **ISO 27001:2022** | 📋 Planificado | Q4 2026 | Oficial de Seguridad | Requiere auditoría externa y documentación de SGSI |
| **SOC 2 Type II** | 🔍 Evaluación | Q2 2027 | Auditor Externo | Dependiente de madurez operacional |

### 12.9.2. Plan de Auditoría

| Tipo de Auditoría | Frecuencia | Alcance | Ejecutor |
|-------------------|------------|---------|----------|
| **Revisión de Security Rules** | Mensual | Firestore rules, Storage rules | Equipo interno |
| **Penetration Testing** | Semestral | App móvil, API Gateway, Web | Proveedor externo certificado |
| **Revisión de código de seguridad** | Por release mayor | Cloud Functions, autenticación | Security Champion |
| **Auditoría de accesos** | Trimestral | Consola Firebase, GCP IAM | Líder Técnico |
| **Simulacro de incidente (Tabletop)** | Semestral | Escenarios S1 y S2 | CSIRT completo |

### 12.9.3. Escenarios de Breach Response

| Escenario | Clasificación | Acciones Inmediatas (< 1 hora) | Acciones de Seguimiento |
|-----------|---------------|-------------------------------|-------------------------|
| **Fuga de base de datos completa** | S1 - Crítico | 1) Activar CSIRT 2) Revocar todos los tokens (`Firebase Admin SDK`) 3) Aislar servicios afectados 4) Notificar a Gerencia | 1) Análisis forense 2) Notificar a Autoridad de Protección de Datos (< 72h según LOPDP) 3) Comunicado a usuarios afectados 4) Post-mortem |
| **Compromiso de cuenta administrador** | S1 - Crítico | 1) Desactivar cuenta inmediatamente 2) Rotar todos los secrets y API keys 3) Forzar cierre de todas las sesiones admin | 1) Auditoría completa de logs 2) Verificar integridad de datos 3) Revisar cambios en Security Rules |
| **Ransomware en infraestructura** | S1 - Crítico | 1) Aislar sistemas afectados 2) Activar backup de Firestore (point-in-time recovery) 3) NO pagar rescate | 1) Restaurar desde backup limpio 2) Análisis de vector de entrada 3) Fortalecer controles de acceso |
| **Defacement de landing page** | S2 - Media | 1) Rollback a versión anterior (Firebase Hosting) 2) Verificar integridad de otros servicios | 1) Análisis de vector de ataque 2) Revisar pipeline de deploy |
| **Scraping masivo de ofertas** | S3 - Baja | 1) Ban de IPs ofensoras en WAF 2) Incrementar rate limiting temporal | 1) Revisar políticas de rate limiting 2) Considerar CAPTCHA para búsquedas |
| **Fuga de credenciales de API externa** | S2 - Media | 1) Revocar credencial comprometida 2) Generar nueva credencial 3) Actualizar en Secret Manager | 1) Auditar uso de la credencial comprometida 2) Verificar si hubo acceso no autorizado |

### 12.9.4. Comunicación en Incidentes

| Audiencia | Canal | Tiempo | Responsable |
|-----------|-------|--------|-------------|
| CSIRT interno | Slack #incident-response + llamada | Inmediato | Líder de Incidente |
| Gerencia CAIL | Email + llamada telefónica | < 1 hora | Líder de Incidente |
| Autoridad de Protección de Datos | Formulario oficial | < 72 horas (si aplica) | Oficial Legal |
| Usuarios afectados | Email + notificación in-app | < 7 días (si aplica) | Comunicaciones + Legal |
| Público general | Comunicado en website | Según decisión de Gerencia | Comunicaciones |

---

## ANEXO A: Glosario de Términos Técnicos — NUEVA SECCIÓN

| Término | Definición |
|---------|------------|
| **API Gateway** | Punto de entrada único que gestiona, asegura y monitorea las llamadas a los microservicios. En CAIL se utiliza WSO2 API Manager. |
| **ARCO+** | Derechos de Acceso, Rectificación, Cancelación (Eliminación), Oposición y Portabilidad de datos personales, garantizados por la LOPDP. |
| **ATS (App Transport Security)** | Mecanismo de iOS que obliga a las apps a usar conexiones HTTPS seguras. |
| **Certificate Pinning** | Técnica que asocia un certificado específico con un servidor, previniendo ataques man-in-the-middle. |
| **CI/CD** | Integración Continua / Despliegue Continuo. Prácticas DevOps para automatizar la construcción, prueba y despliegue de software. |
| **Cloud Functions** | Funciones serverless de Firebase/GCP que ejecutan código backend sin gestionar servidores. |
| **CSP (Content Security Policy)** | Header HTTP que controla qué recursos puede cargar una página web, previniendo XSS. |
| **CSIRT** | Computer Security Incident Response Team. Equipo de respuesta a incidentes de seguridad. |
| **DevSecOps** | Cultura que integra prácticas de seguridad en todo el ciclo de desarrollo de software. |
| **DOMPurify** | Librería JavaScript para sanitizar HTML y prevenir ataques XSS. |
| **Firestore** | Base de datos NoSQL en tiempo real de Firebase/Google Cloud, utilizada como persistencia principal en CAIL. |
| **JWT (JSON Web Token)** | Estándar (RFC 7519) para tokens de autenticación seguros y autocontenidos. |
| **Keychain (iOS)** | Sistema seguro de almacenamiento de credenciales en dispositivos Apple. |
| **Keystore (Android)** | Sistema de almacenamiento criptográfico seguro en dispositivos Android. |
| **LOPDP** | Ley Orgánica de Protección de Datos Personales de Ecuador (2021). |
| **MFA** | Multi-Factor Authentication. Autenticación que requiere múltiples factores de verificación. |
| **MTTR** | Mean Time To Recovery/Repair. Tiempo promedio de recuperación ante incidentes. |
| **OWASP** | Open Web Application Security Project. Organización que publica estándares y guías de seguridad. |
| **ProGuard/R8** | Herramientas de ofuscación y optimización de código para aplicaciones Android. |
| **Rate Limiting** | Técnica para limitar la cantidad de requests que un cliente puede hacer en un período de tiempo. |
| **RBAC** | Role-Based Access Control. Control de acceso basado en roles asignados a usuarios. |
| **SAST** | Static Application Security Testing. Análisis de seguridad del código fuente sin ejecutarlo. |
| **Security Champion** | Miembro del equipo de desarrollo con responsabilidades adicionales de seguridad. |
| **SLO** | Service Level Objective. Objetivo medible de nivel de servicio. |
| **SQLCipher** | Extensión de SQLite que proporciona cifrado transparente de base de datos. |
| **TLS (Transport Layer Security)** | Protocolo criptográfico para comunicaciones seguras sobre redes. CAIL usa TLS 1.3. |
| **WAF** | Web Application Firewall. Firewall especializado que filtra tráfico HTTP malicioso. |
| **WSO2** | Plataforma de integración y gestión de APIs utilizada como gateway en CAIL. |
| **Zod** | Librería TypeScript para validación de esquemas de datos. |

---

## Resumen de Cambios Realizados

| Sección | Tipo de Cambio | Descripción |
|---------|----------------|-------------|
| 12.2 | **Mejorado** | Tabla de controles específicos web, ejemplo de código sanitización |
| 12.3 | **Mejorado** | Tabla diferenciada Android/iOS, ejemplos de código React Native |
| 12.6 | **Nueva** | Matrices OWASP Top 10 y Mobile Top 10, ejemplo de validación con Zod, diagrama de secuencia de autenticación |
| 12.7 | **Nueva** | KPIs de seguridad, herramientas de monitoreo, alertas automatizadas |
| 12.8 | **Nueva** | Referencias cruzadas con otras secciones del SAD |
| 12.9 | **Nueva** | Roadmap ISO 27001, plan de auditoría, escenarios de breach response |
| Anexo A | **Nueva** | Glosario de 30+ términos técnicos |

---

*Documento preparado para integración en SAD-CAIL v1.1*
*Fecha de elaboración: Diciembre 2025*

