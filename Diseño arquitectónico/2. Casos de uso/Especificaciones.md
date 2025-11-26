<p align="right">
  <img src="https://i.postimg.cc/13qQdqZs/utpllogo.png" alt="Logo UTPL" width="150"/>
</p>

<h1 align='center'>
  Diagrama de Casos de Uso 
  <br>
  Aplicación Bolsa de Empleos "CAIL"
</h1>

---



## **¿Qué es un Diagrama de Casos de Uso?**

Un **Diagrama de Casos de Uso** es una herramienta fundamental del Lenguaje Unificado de Modelado (UML) que se utiliza para describir gráficamente las **funcionalidades de un sistema** desde la perspectiva del usuario. Representa las interacciones entre los **"actores"** (usuarios o sistemas externos) y el **"sistema"** para alcanzar un objetivo específico.

En esencia, este diagrama no describe *cómo* funciona el sistema internamente, sino *qué* hace el sistema en respuesta a las solicitudes de un actor para proporcionarle un resultado de valor.

---

## **Propósito Principal de un Diagrama de Casos de Uso**

El objetivo principal de este diagrama es capturar y comunicar los **requisitos funcionales** del sistema de una manera clara y concisa. Sirve para:

* **Definir el Alcance:** Establece claramente qué debe hacer el sistema y qué queda fuera de sus límites.
* **Facilitar la Comunicación:** Actúa como un lenguaje común entre los *stakeholders* (como los directivos de la Cámara de Industrias) y el equipo de desarrollo.
* **Identificar Actores:** Clarifica quién (o qué) interactuará con el sistema.
* **Guiar el Desarrollo y las Pruebas:** Cada caso de uso sirve como base para planificar la arquitectura, el desarrollo y, fundamentalmente, los casos de prueba.

---

## **Estructura y Componentes Clave**

Un diagrama de casos de uso se compone de pocos elementos, lo que facilita su comprensión:

1.  **Actor:**
    * Representa cualquier entidad externa que interactúa con el sistema (un usuario humano, otro software, un dispositivo).
    * Se dibuja como una figura humana.

2.  **Caso de Uso:**
    * Representa una funcionalidad específica que el sistema proporciona para entregar un resultado de valor al actor (ej. "Publicar Oferta Laboral", "Validar Candidato").
    * Se dibuja como un **óvalo**.

3.  **Sistema:**
    * Un **rectángulo** que delimita el alcance del sistema. Los casos de uso se dibujan *dentro* de este límite y los actores *fuera*.

4.  **Relaciones:**
    * **Asociación:** Una línea sólida que conecta a un actor con un caso de uso. Indica que el actor participa en esa funcionalidad.
    * **Inclusión (`<<include>>`):** Una flecha punteada que indica que un caso de uso *siempre* invoca a otro (ej. "Administrar Postulaciones" `<<include>>` "Evaluar Perfil"). Se usa para reutilizar funcionalidad obligatoria.
    * **Extensión (`<<extend>>`):** Una flecha punteada que indica que un caso de uso *opcionalmente* puede extender a otro (ej. "Buscar Ofertas" `<<extend>>` "Aplicar Filtros Avanzados").

---

# **Casos de Uso del Sistema de Gestión de Postulaciones**

Basado en el Mapa de Capacidades, se identifican los siguientes actores y casos de uso principales:

## **Actores Principales**

1.  **Candidato:** (O Postulante) Usuario que busca empleo. Su objetivo es registrar su perfil, buscar ofertas y postularse.
2.  **Empleador:** Representante de una empresa. Su objetivo es registrar la empresa, publicar ofertas de trabajo y gestionar los candidatos que se postulan.
3.  **Administrador del Sistema:** Rol interno de supervisión. Su objetivo es mantener la integridad de la plataforma, validando nuevos empleadores y candidatos.

---

## **1. Diagrama de Caso de Uso: Gestión de Postulaciones**

Este diagrama cubre la administración de los actores clave del sistema.

<img width="1242" height="1068" alt="Casos_USO_CAIL (1)" src="https://github.com/user-attachments/assets/eb61c4ea-2b03-4309-8b72-f47c32023fd3" />


### **Módulo: Gestión de perfiles (Administración de empleadores)**

**Especificación (Ingresar datos de empresa)**

| Nombre | Ingresar datos de empresa |
| :--- | :--- |
| **Actores** | - Empleador/Empresa |
| **Flujo normal** | - El Empleador/Empresa inicia el proceso de registro en el sistema.<br>- El Empleador/Empresa completa el formulario con los datos de la compañía (RUC, razón social, dirección, contacto, etc.).<br>- El Empleador/Empresa guarda y envía el formulario.<br>- El sistema registra los datos de la empresa y la marca como "Pendiente de Validación". |

**Especificación (Validar empresas)**

| Nombre | Validar empresas |
| :--- | :--- |
| **Actores** | - Administrador del sistema |
| **Flujo normal** | - El Administrador del sistema accede al panel de empresas pendientes de validación.<br>- El Administrador revisa la información y la documentación de la empresa registrada.<br>- El Administrador aprueba o rechaza el registro.<br>- El sistema actualiza el estado de la empresa (a "Validada" o "Rechazada") y notifica al Empleador/Empresa. |




## **2. Diagrama de Caso de Uso: Administracion de candidatos**

![Caso de uso Candidatos](https://github.com/user-attachments/assets/1480a3ad-94cd-4341-a51e-706e322f6ce6)


**Especificación (Ingresar datos del postulante)**

| Nombre | Ingresar datos del postulante |
| :--- | :--- |
| **Actores** | - Candidato |
| **Flujo normal** | - El Candidato inicia el proceso de registro de su perfil.<br>- El sistema solicita la información en secciones.<br>- **`<<include>>`** El Candidato completa el formulario de "Ingresar información personal" (nombres, cédula, contacto).<br>- **`<<include>>`** El Candidato completa el formulario de "Ingresar información profesional" (experiencia, estudios, habilidades, competencias).<br>- El Candidato guarda la información de su perfil.<br>- El sistema almacena el perfil y lo marca como "Pendiente de Validación". |

**Especificación (Validar candidatos)**

| Nombre | Validar candidatos |
| :--- | :--- |
| **Actores** | - Administrador del sistema |
| **Flujo normal** | - El Administrador del sistema accede al listado de candidatos pendientes de validación.<br>- El Administrador revisa la información clave del perfil (ej. cédula, certificados).<br>- El Administrador aprueba o rechaza el perfil del candidato.<br>- El sistema actualiza el estado del perfil (a "Validado" o "Rechazado") y notifica al Candidato. |






## **3. Diagrama de Caso de Uso: Definicioon de vacantes**


![Caso de uso Vacantes](https://github.com/user-attachments/assets/4832b462-8585-4561-ab92-de4fdfb8332d)

### **Módulo: Gestión de Ofertas Laborales (Definición de Vacantes)**

**Especificación (Registrar oferta laboral)**

| Nombre | Registrar oferta laboral |
| :--- | :--- |
| **Actores** | - Empleador/Empresa |
| **Flujo normal** | - El Empleador/Empresa selecciona la opción de crear una nueva oferta laboral.<br>- **`<<include>>`** El Empleador/Empresa completa el formulario de "Ingresar datos de oferta laboral" (título, descripción, salario, modalidad, ubicación, etc.).<br>- El Empleador/Empresa guarda la oferta como borrador. |

**Especificación (Registrar perfiles requeridos)**

| Nombre | Registrar perfiles requeridos |
| :--- | :--- |
| **Actores** | - Empleador/Empresa |
| **Flujo normal** | - El Empleador/Empresa, durante la creación o edición de una oferta, accede a la sección de requisitos.<br>- El Empleador/Empresa especifica las competencias, nivel de experiencia y formación necesarios para la vacante.<br>- El sistema guarda estos requisitos asociados a la oferta laboral. |

**Especificación (Publicar oferta laboral)**

| Nombre | Publicar oferta laboral |
| :--- | :--- |
| **Actores** | - Empleador/Empresa |
| **Flujo normal** | - El Empleador/Empresa accede a su lista de ofertas en borrador.<br>- El Empleador/Empresa selecciona una oferta para hacerla pública.<br>- El sistema valida que la oferta tenga los datos mínimos (datos de oferta y perfiles requeridos).<br>- El sistema cambia el estado de la oferta a "Publicada" y la hace visible en el catálogo. |



## **4. Diagrama de Caso de Uso: Ciclo de vida Oferta**


![Caso de uso Ciclo Oferta](https://github.com/user-attachments/assets/fe87a559-4855-46af-87f9-2552a3cc9657)


### **Módulo: Gestión de Ofertas Laborales (Gestión del ciclo de vida de la oferta)**

**Especificación (Administrar oferta)**

| Nombre | Administrar oferta |
| :--- | :--- |
| **Actores** | - Empleador/Empresa |
| **Flujo normal** | - El Empleador/Empresa accede a su panel de "Ofertas publicadas".<br>- El Empleador/Empresa selecciona una oferta activa para gestionarla.<br>- **`<<include>>`** El Empleador "Verifica la oferta" (revisa su estado, vistas, número de postulantes).<br>- **`<<include>>`** El Empleador "Actualiza la oferta" (modifica la descripción, salario, o cualquier dato si es necesario).<br>- El sistema guarda los cambios realizados. |

**Especificación (Administrar ofertas finalizadas)**

| Nombre | Administrar ofertas finalizadas |
| :--- | :--- |
| **Actores** | - Empleador/Empresa |
| **Flujo normal** | - El Empleador/Empresa determina que una oferta ya no está vigente (ej. vacante cubierta o expirada).<br>- El Empleador/Empresa selecciona la oferta desde su panel.<br>- **`<<include>>`** El Empleador "Archiva la oferta" (la mueve a un historial de registros).<br>- **`<<include>>`** El Empleador "Retira la oferta" (la quita de la vista pública de candidatos).<Lbr>- El sistema actualiza el estado de la oferta a "Finalizada" o "Archivada". |
















