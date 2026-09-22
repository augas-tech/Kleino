# Kleino

Plataforma para reservar espacios compartidos (salas de estudio, salas de
reuniones, laboratorios, canchas) sin depender de planillas de Excel, grupos
de WhatsApp o correos cruzados. Permite ver disponibilidad, crear y cancelar
reservas, y evita que dos personas reserven el mismo espacio a la misma hora.

Proyecto del ramo **Computación Web y Móvil** (UTEM) — Tarea 1 (Evaluación 1).

## Estado del proyecto

Verificado directamente contra el repositorio al 22-09-2026.

| Área | Estado |
|---|---|
| Backend (Rails + API REST + PostgreSQL) | ✅ Listo |
| Autenticación (registro, login, logout, sesión) | ✅ Listo (PR #4 + #5) |
| CRUD de Sedes, Espacios y Reservas | ✅ Listo, con validaciones y restricciones en BD (PR #6) |
| Frontend (React) | 🚧 En desarrollo, todavía no vive en este repositorio |
| Deploy en `production` con los últimos cambios | ⏳ Pendiente de re-desplegar (production sigue en una versión anterior al PR #6) |
| `db/seeds.rb` / datos y credenciales de prueba | ⏳ Pendiente |
| Roles y permisos | No aplica a esta entrega (se evalúan en la Tarea 2) |

## Arquitectura

```
React (Vite)  --HTTP/JSON, cookies-->  Rails 8.1 (API only)  -->  PostgreSQL
   :5173                                     :3000
```

- El frontend todavía no está en este repositorio (ver sección "Frontend" más
  abajo).
- La autenticación usa **sesión con cookie firmada `httponly`** (no JWT):
  el navegador guarda un `session_id` que el backend valida en cada
  petición. El frontend debe llamar a `fetch` con `credentials: "include"`.
- CORS está habilitado solo para los orígenes definidos en `FRONTEND_ORIGINS`
  (con `credentials: true`, así que no se puede usar `*`).

## Modelo de datos

| Tabla | Columnas relevantes | Relaciones |
|---|---|---|
| `users` | `email_address` (único), `password_digest` | tiene muchas `sessions` y `reservas` |
| `sessions` | `user_id`, `ip_address`, `user_agent` | pertenece a `user` |
| `sedes` | `nombre` (obligatorio), `direccion` | tiene muchos `espacios` (no se puede borrar una sede con espacios) |
| `espacios` | `nombre` (obligatorio), `tipo`, `capacidad` (> 0), `ubicacion`, `descripcion`, `estado` (`activo`/`inactivo`, default `activo`), `sede_id` | pertenece a `sede`, tiene muchas `reservas` (no se puede borrar un espacio con reservas) |
| `reservas` | `user_id`, `espacio_id`, `fecha`, `hora_inicio`, `hora_fin`, `estado` (`pendiente`/`aprobada`/`rechazada`/`cancelada`/`completada`, default `pendiente`) | pertenece a `user` y a `espacio` |

Reglas de negocio validadas en el modelo `Reserva`:
- La fecha no puede ser en el pasado.
- `hora_fin` debe ser posterior a `hora_inicio`.
- **Sin solapamiento de horario**: no se puede crear una reserva para un
  espacio si ya existe otra reserva del mismo espacio y fecha cuyo rango de
  horas se cruza con la nueva. Hay un índice en `(espacio_id, fecha)` para
  esa validación.

> Nota: la tabla se llama `users` (no `usuarios`) porque así lo genera el
> mecanismo de autenticación nativo de Rails 8. `Sede` es una entidad que no
> estaba en la propuesta original (Tarea 0): agrupa espacios por local o
> edificio, y se agregó como evolución natural del modelo.

## Stack tecnológico

- **Backend:** Ruby 3.3.7, Ruby on Rails 8.1 (`api_only`)
- **Base de datos:** PostgreSQL
- **Autenticación:** sesión con cookie firmada (`bcrypt` para el hash de
  contraseña)
- **CORS:** gema `rack-cors`
- **Frontend (planeado):** React + Vite, JavaScript
- **CI/CD:** Jenkins + Docker (sin GitHub Actions)
- **Gestión:** GitHub Projects

## Cómo correr en local

Requisitos: Ruby 3.3.7 (ver `.ruby-version`), PostgreSQL corriendo
localmente (o una `DATABASE_URL` apuntando a uno) y Bundler.

```bash
bundle install
bin/rails db:create db:migrate
bin/rails server        # API en http://localhost:3000
```

Si al correr `db:create` aparece un error del estilo
`role "TU_USUARIO" does not exist`: es porque Postgres no tiene un rol que
coincida con tu usuario del sistema operativo (así se conecta Rails por
defecto en desarrollo). Se soluciona en Postgres, **no** editando
`config/database.yml` (eso rompería el entorno del resto del equipo):

```bash
sudo -u postgres createuser -s TU_USUARIO_LINUX
```

### Con PostgreSQL en Docker (si no quieres instalarlo localmente)

```bash
docker run -d --name kleino-db -p 5433:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine
DATABASE_URL=postgres://postgres:postgres@localhost:5433 bin/rails db:test:prepare test
```

## Variables de entorno

| Variable | Para qué | Valor en local |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | No hace falta si Postgres corre local con tu rol de usuario |
| `RAILS_MASTER_KEY` | Descifra `config/credentials` | Contenido de `config/master.key` (no se commitea) |
| `FRONTEND_ORIGINS` | Orígenes permitidos por CORS, separados por coma | Por defecto `http://localhost:5173` (puerto de Vite) si no se define |

## Endpoints de la API

Convenciones generales:
- Los parámetros van **planos** en el body JSON (`{"nombre": "..."}`, no
  `{"espacio": {"nombre": "..."}}`).
- Sin sesión iniciada, cualquier endpoint (salvo los marcados como
  públicos) responde `401 {"error": "Debes iniciar sesión"}`.
- Un recurso que no existe responde `404 {"error": "Recurso no encontrado"}`.
- Un error de validación responde `422 {"errors": ["mensaje", "mensaje"]}`
  (array de strings).

### Autenticación (públicos, no requieren sesión)

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| `POST` | `/registration` | `email_address`, `password`, `password_confirmation` | `201 {"user": {...}}` / `422` |
| `POST` | `/session` | `email_address`, `password` | `201 {"user": {...}}` / `401` |
| `POST` | `/passwords` | `email_address` | `200` (siempre, no revela si el correo existe) |
| `GET` | `/passwords/:token/edit` | — | `200 {"valid": true}` / `422` si el token expiró |
| `PATCH` | `/passwords/:token` | `password`, `password_confirmation` | `200` / `422` |
| `GET` | `/health` | — | `200 {"status": "ok", ...}` (usado por Jenkins) |

### Sesión y recursos (requieren sesión iniciada)

| Método | Ruta | Body | Notas |
|---|---|---|---|
| `GET` | `/session` | — | Usuario actual — usarlo al abrir la app para saber si hay sesión |
| `DELETE` | `/session` | — | Logout, `204` |
| `GET` / `POST` | `/sedes` | `nombre`, `direccion` | — |
| `GET` / `PATCH` / `DELETE` | `/sedes/:id` | idem | Borrar falla `422` si la sede tiene espacios |
| `GET` / `POST` | `/espacios` | `nombre`, `tipo`, `capacidad`, `ubicacion`, `descripcion`, `estado`, `sede_id` | — |
| `GET` / `PATCH` / `DELETE` | `/espacios/:id` | idem | Borrar falla `422` si el espacio tiene reservas |
| `GET` / `POST` | `/reservas` | `espacio_id`, `fecha`, `hora_inicio`, `hora_fin` | `GET` solo devuelve las reservas del usuario en sesión; `user_id` lo asigna el backend, no se envía |
| `GET` / `PATCH` / `DELETE` | `/reservas/:id` | idem | Falla `422` si el horario se solapa con otra reserva del mismo espacio |

> **Nota para el frontend:** `hora_inicio` y `hora_fin` se envían como
> `"HH:MM"`, pero la API los devuelve como string ISO con una fecha ficticia
> (ej. `"2000-01-01T10:00:00.000Z"`) — es cómo Rails serializa columnas de
> tipo `time`. Al mostrarlos, hay que quedarse solo con la parte `HH:MM` e
> ignorar la fecha.

> **Pendiente de decidir:** `GET /reservas` solo trae las reservas del
> usuario logueado. Si el frontend necesita mostrar qué horarios están
> ocupados en un espacio *antes* de reservar (para todos los usuarios, no
> solo el propio), este endpoint no alcanza — falta agregar algo como
> `GET /espacios/:id/reservas` sin el filtro por usuario.

### Ejemplo rápido con `curl`

```bash
# Registrarse (guarda la cookie de sesión en el archivo "jar")
curl -i -c jar -H "Content-Type: application/json" \
  -d '{"email_address":"a@b.cl","password":"clave12345","password_confirmation":"clave12345"}' \
  localhost:3000/registration

# Crear una sede (usando la cookie guardada)
curl -i -b jar -H "Content-Type: application/json" \
  -d '{"nombre":"Sede Central","direccion":"Av. Siempre Viva 123"}' \
  localhost:3000/sedes
```

## Tests, lint y seguridad

```bash
bin/rails test              # 25 tests
bin/rubocop                 # estilo (Omakase)
bin/brakeman --no-pager     # vulnerabilidades en el código
bin/bundler-audit           # vulnerabilidades en dependencias
```

Estos son los mismos cuatro chequeos que corre Jenkins en cada rama y PR.

## Docker

```bash
docker build -t kleino .
docker run -d --name kleino -p 3000:80 \
  -e RAILS_MASTER_KEY=<contenido de config/master.key> \
  -e DATABASE_URL=postgres://user:pass@host:5432/kleino_production \
  kleino
```

El contenedor escucha en el puerto **80** (Thruster delante de Puma). Al
arrancar, `bin/docker-entrypoint` ejecuta `rails db:prepare` (crea las bases
y corre las migraciones) antes de levantar el servidor.

## Despliegue y CI/CD

- **`main`**: rama de integración. Todo entra por Pull Request; Jenkins
  corre lint, seguridad y tests en cada rama y PR.
- **`production`**: lo que está desplegado en <https://kleino.frubilarz.cl>.
  Se actualiza mergeando `main` en `production`; ese merge dispara el
  deploy automáticamente.

Pipeline (`Jenkinsfile`) — job en
<https://jenkins.frubilarz.cl/job/kleino/>:

En **todas las ramas**: Checkout → Test DB (Postgres efímero) → Install deps
→ Lint (`rubocop`) → Security (`brakeman` + `bundler-audit`) → Test → Build
image.

Solo en **`production`**, además: Deploy (reemplaza el contenedor, expuesto
por Nginx en `https://kleino.frubilarz.cl`) → Health Check (espera hasta
180s a que `/health` responda `200`).

Credenciales que Jenkins necesita para el stage de Deploy (no se necesitan
para el resto de las etapas):

| ID en Jenkins | Contenido |
|---|---|
| `kleino-rails-master-key` | Contenido de `config/master.key` |
| `kleino-database-url` | `postgres://user:pass@host:5432` |

## Flujo de trabajo con Git

- Nunca se trabaja directo en `main`. Cada funcionalidad va en una rama
  `feature/nombre-funcionalidad`.
- Todo cambio entra por Pull Request, revisado por alguien **distinto** al
  autor.
- Al mergear se usa **"Create a merge commit"** (no Squash), para conservar
  la evidencia de trabajo progresivo que pide la pauta.
- No se borra una rama mientras otro PR dependa de ella.

## Credenciales de prueba

`db/seeds.rb` todavía está vacío. Antes de la entrega falta cargar al menos
un usuario y algunas sedes/espacios de ejemplo para que se puedan probar
sin tener que registrarse manualmente, y documentar acá el email/contraseña
de esa cuenta de prueba.

## Frontend

Aún no existe una carpeta `frontend/` en este repositorio. Hay un proyecto
React + Vite en desarrollo (landing page ya armada, conectado a los
endpoints de arriba) que todavía no se ha subido como rama de este repo.

## Equipo

| Integrante | Rol |
|---|---|
| Diego Pérez | Tech Lead (Evaluación 1) |
| Agustín Ugas | Software Engineer |
| Felipe Cruz | Software Engineer |

## Pendientes antes de la entrega

- [ ] Mergear `main` → `production` y confirmar el health check con los
      cambios del PR #6.
- [ ] Subir el frontend (React) a este repositorio.
- [ ] Completar `db/seeds.rb` y documentar credenciales de prueba acá.
- [ ] Confirmar que el tablero de GitHub Projects refleje el estado real.
- [ ] Borrar el archivo `jar` (cookie de sesión de pruebas locales) que
      quedó commiteado por error, y agregarlo a `.gitignore`.
- [ ] Decidir si `GET /reservas` necesita una variante sin filtrar por
      usuario, para mostrar disponibilidad general de un espacio.
