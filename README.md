# Kleino

Plataforma para reservar espacios compartidos (salas de estudio, salas de
reuniones, laboratorios, canchas) sin depender de planillas de Excel, grupos
de WhatsApp o correos cruzados. Permite ver disponibilidad, crear y cancelar
reservas, y evita que dos personas reserven el mismo espacio a la misma hora.

Proyecto del ramo **Computación Web y Móvil (INFO8)** (UTEM): Tarea 1
(API y web) y Tarea 2 (aplicación móvil, roles y autorización).

## Estado del proyecto

Verificado directamente contra el repositorio al 22-11-2026.

| Área | Estado |
|---|---|
| Backend (Rails + API REST + PostgreSQL) | ✅ Listo |
| Autenticación (registro, login, logout, sesión, recuperación de contraseña) | ✅ Listo, con límite de intentos (`rate_limit`) |
| CRUD de Sedes, Espacios y Reservas | ✅ Listo, con validaciones y restricciones en BD |
| Frontend web (React + Vite) en `frontend/` | ✅ Listo (PR #12) |
| Datos de prueba (`db/seeds.rb`) | ✅ Listo (PR #10) |
| Despliegue del frontend y dominios `apikleino` / `kleino` | ⏳ PR #23 en revisión |
| `production` al día con `main` | ⏳ Pendiente de merge `main` → `production` |
| **Tarea 2:** roles y autorización en la API | ⏳ Pendiente |
| **Tarea 2:** autenticación por token para el móvil | ⏳ Pendiente |
| **Tarea 2:** aplicación móvil (React Native) | ⏳ Pendiente |
| **Tarea 2:** tests de autorización y tests móviles | ⏳ Pendiente |

## Arquitectura

```
React (Vite)  ──HTTP/JSON, cookie──┐
   :5173                           ├──>  Rails 8.1 (API only)  ──>  PostgreSQL
React Native (Expo) ──HTTP/JSON, token──┘          :3000
```

Es un **monorepo**: la API está en la raíz, la web en `frontend/` y la app
móvil estará en `mobile/`. Web y móvil comparten el mismo backend y la misma
base de datos; **no hay un backend aparte para el móvil**.

- La **web** se autentica con una **sesión de cookie firmada `httponly`** (no
  JWT): el navegador guarda un `session_id` que el backend valida en cada
  petición. Por eso el frontend usa `fetch` con `credentials: "include"`.
- El **móvil** usará un token en el encabezado `Authorization` (ver
  "Aplicación móvil").
- CORS está habilitado solo para orígenes explícitos y con `credentials: true`
  (por eso no se puede usar `*`).

```
.
├── app/, config/, db/, test/   API Rails
├── frontend/                   Web React + Vite (con Dockerfile y nginx.conf)
├── mobile/                     App React Native con Expo (Tarea 2)
├── Dockerfile                  Imagen de la API
├── Jenkinsfile                 Pipeline de CI/CD
└── .github/
```

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
  espacio si ya existe otra del mismo espacio y fecha cuyo rango de horas se
  cruza con la nueva. Hay un índice en `(espacio_id, fecha)` para esa validación.

> La tabla se llama `users` (no `usuarios`) porque así la genera el mecanismo
> de autenticación nativo de Rails 8. `Sede` agrupa espacios por local o
> edificio y se agregó como evolución del modelo propuesto en la Tarea 0.

## Stack tecnológico

- **Backend:** Ruby 3.3.14, Ruby on Rails 8.1 (`api_only`), PostgreSQL
- **Autenticación:** sesión con cookie firmada (web) y `bcrypt` para el hash de contraseña
- **CORS:** gema `rack-cors`
- **Web:** React 18, Vite, React Router y Tailwind CSS
- **Móvil (Tarea 2):** React Native con Expo y React Navigation
- **CI/CD:** Jenkins + Docker (sin GitHub Actions)

## Cómo correr en local

Requisitos: Ruby 3.3.14 (ver `.ruby-version`), PostgreSQL corriendo localmente
(o una `DATABASE_URL` apuntando a uno), Bundler y Node.js LTS.

### API

```bash
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server        # API en http://localhost:3000
```

Si al correr `db:create` aparece `role "TU_USUARIO" does not exist`, Postgres
no tiene un rol que coincida con tu usuario del sistema operativo. Se
soluciona en Postgres, **no** editando `config/database.yml`:

```bash
sudo -u postgres createuser -s TU_USUARIO_LINUX
```

Con PostgreSQL en Docker (si no quieres instalarlo localmente):

```bash
docker run -d --name kleino-db -p 5433:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine
DATABASE_URL=postgres://postgres:postgres@localhost:5433 bin/rails db:create db:migrate db:seed
```

### Web

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev             # web en http://localhost:5173
```

Páginas: `/` (landing), `/login`, `/register`, y bajo sesión `/app`,
`/app/sedes`, `/app/espacios` y `/app/reservas`.

## Variables de entorno

| Variable | Dónde | Para qué | Valor en local |
|---|---|---|---|
| `DATABASE_URL` | API | Conexión a PostgreSQL | No hace falta si Postgres corre local con tu rol de usuario |
| `RAILS_MASTER_KEY` | API | Descifra `config/credentials` | Contenido de `config/master.key` (no se commitea) |
| `CORS_ORIGINS` | API | Orígenes web permitidos, separados por coma | Por defecto `http://localhost:5173`, `:5174` y `127.0.0.1` equivalentes |
| `VITE_API_URL` | Web | URL de la API (Vite la incrusta al compilar) | `http://localhost:3000` (ver `frontend/.env.example`) |
| `EXPO_PUBLIC_API_URL` | Móvil | URL de la API (Tarea 2) | `http://10.0.2.2:3000` en el emulador de Android |

## Endpoints de la API

Convenciones generales:

- Los parámetros van **planos** en el body JSON (`{"nombre": "..."}`, no
  `{"espacio": {"nombre": "..."}}`).
- Sin sesión iniciada, cualquier endpoint (salvo los públicos) responde
  `401 {"error": "Debes iniciar sesión"}`.
- Un recurso que no existe responde `404 {"error": "Recurso no encontrado"}`.
- Un error de validación responde `422 {"errors": ["mensaje", "mensaje"]}`.
- Demasiados intentos en login, registro o recuperación responde `429`.

### Públicos (no requieren sesión)

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| `POST` | `/registration` | `email_address`, `password`, `password_confirmation` | `201 {"user": {...}}` / `422` |
| `POST` | `/session` | `email_address`, `password` | `201 {"user": {...}}` / `401` |
| `POST` | `/passwords` | `email_address` | `200` (siempre, no revela si el correo existe) |
| `GET` | `/passwords/:token/edit` | — | `200 {"valid": true}` / `422` si el token expiró |
| `PATCH` / `PUT` | `/passwords/:token` | `password`, `password_confirmation` | `200` / `422` |
| `GET` | `/health` | — | `200 {"status": "ok", ...}` (usado por Jenkins) |
| `GET` | `/up` | — | Health check por defecto de Rails |

### Con sesión iniciada

| Método | Ruta | Body | Notas |
|---|---|---|---|
| `GET` | `/session` | — | Usuario actual (`{"user": {"id", "email_address"}}`); sirve para saber si hay sesión al abrir la app |
| `DELETE` | `/session` | — | Logout, `204` |
| `GET` / `POST` | `/sedes` | `nombre`, `direccion` | — |
| `GET` / `PATCH` / `PUT` / `DELETE` | `/sedes/:id` | idem | Borrar falla `422` si la sede tiene espacios |
| `GET` / `POST` | `/espacios` | `nombre`, `tipo`, `capacidad`, `ubicacion`, `descripcion`, `estado`, `sede_id` | — |
| `GET` / `PATCH` / `PUT` / `DELETE` | `/espacios/:id` | idem | Borrar falla `422` si el espacio tiene reservas |
| `GET` / `POST` | `/reservas` | `espacio_id`, `fecha`, `hora_inicio`, `hora_fin` | `GET` devuelve solo las reservas del usuario en sesión; `user_id` lo asigna el backend |
| `GET` / `PATCH` / `PUT` / `DELETE` | `/reservas/:id` | idem | Falla `422` si el horario se solapa; `404` si la reserva es de otro usuario |

> `hora_inicio` y `hora_fin` se envían como `"HH:MM"`, pero la API los devuelve
> como string ISO con una fecha ficticia (ej. `"2000-01-01T10:00:00.000Z"`),
> que es como Rails serializa las columnas de tipo `time`. Al mostrarlos hay
> que quedarse solo con la parte `HH:MM`.

Ejemplo con `curl`:

```bash
# Iniciar sesión con el usuario de prueba (guarda la cookie en el archivo "jar")
curl -i -c jar -H "Content-Type: application/json" \
  -d '{"email_address":"docente@kleino.cl","password":"kleino2026"}' \
  localhost:3000/session

# Listar espacios (usando la cookie guardada)
curl -i -b jar localhost:3000/espacios
```

## Aplicación móvil (Tarea 2)

App React Native creada con **Expo**, que consume la misma API Rails. Se
desarrollará en `mobile/`.

**Pantallas previstas:**

| Pantalla | Qué hace |
|---|---|
| Login | Inicia sesión contra la API y guarda el token de forma segura |
| Espacios | Lista los espacios activos |
| Detalle de espacio | Muestra la información completa y permite reservar |
| Reserva | Formulario para crear o editar una reserva |
| Mis reservas | Lista, edita y cancela las reservas propias |

**Requisitos:** Node.js LTS, Android Studio (SDK y emulador) o un teléfono con
Expo Go.

**Ejecución:**

```bash
cd mobile
npm install
cp .env.example .env    # definir EXPO_PUBLIC_API_URL
npx expo start          # presionar "a" para abrir el emulador de Android
```

Para que el emulador llegue a la API local, esta debe escuchar en todas las
interfaces y la URL usa la dirección especial del emulador:

```bash
bin/rails server -b 0.0.0.0
```

`EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`. Desde un teléfono real se usa la
IP del computador en la red local o la URL de producción.

**Autenticación móvil (prevista):** el móvil no usa la cookie de la web. La API
entregará un token al iniciar sesión (cuando la petición traiga el encabezado
`X-Client: mobile`) y la app lo enviará en `Authorization: Bearer <token>`.
El token se guarda con `expo-secure-store` (Keychain en iOS, Keystore en
Android), nunca en texto plano. Ante un `401`, la app borra el token y vuelve
al login.

## Roles y autorización (Tarea 2)

**Estado actual:** todavía no hay roles. Hoy cualquier usuario con sesión puede
crear, editar y borrar sedes y espacios. Las reservas ya están limitadas a su
dueño: un usuario solo ve y modifica las suyas (y las ajenas responden `404`).

**Diseño previsto:**

- **Administrador:** habilita y administra **sus propias** salas. Es el dueño de
  las sedes que crea y, por lo tanto, de los espacios dentro de ellas.
  "Habilitar" un espacio es cambiar su `estado` (`activo` / `inactivo`).
- **Usuario registrado:** reserva los espacios activos y gestiona sus propias
  reservas.
- El rol se guarda en `users.rol` (migración), con `usuario` por defecto.
- La autorización se verifica **en la API** con Pundit (no solo ocultando
  botones en la web o en la app). Sin sesión o token: `401`; sin permiso: `403`.

**Matriz de permisos prevista:**

| Acción | Administrador | Usuario registrado |
|---|---|---|
| Ver espacios activos | Sí | Sí |
| Ver sus propios espacios (incluidos los inactivos) | Sí | No aplica |
| Crear una sede o un espacio | Sí | No (403) |
| Editar, habilitar, deshabilitar o eliminar sedes y espacios | Solo los propios | No (403) |
| Crear una reserva | No | Sí, en espacios activos |
| Ver reservas | Las de sus espacios | Solo las propias |
| Editar o cancelar una reserva | Cancelar las de sus espacios | Solo las propias |
| Cualquier acción sin sesión | 401 | 401 |

## Usuarios de prueba

`bin/rails db:seed` es idempotente (se puede repetir sin duplicar datos) y crea:

| Rol | Correo | Contraseña |
|---|---|---|
| Usuario registrado | `docente@kleino.cl` | `kleino2026` |
| Administrador | se agrega con la migración de roles (Tarea 2) | — |

También crea la sede "Sede Central", dos espacios de ejemplo ("Sala de
Reuniones A" y "Cancha Techada") y dos reservas. Son credenciales solo de
prueba.

## Tests, lint y seguridad

```bash
bin/rails test              # 25 tests
bin/rubocop                 # estilo (Omakase)
bin/brakeman --no-pager     # vulnerabilidades en el código
bin/bundler-audit           # vulnerabilidades en dependencias
```

Son los mismos chequeos que corre Jenkins en cada rama y PR. Con PostgreSQL en
Docker:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433 bin/rails db:test:prepare test
```

**Tests de la app móvil (Tarea 2, pendiente):** se ejecutarán con
`cd mobile && npm test` (Jest y React Native Testing Library). El objetivo es
un único comando documentado que corra los tests del backend y los del móvil.

## Docker

**API:**

```bash
docker build -t kleino .
docker run -d --name kleino -p 3000:80 \
  -e RAILS_MASTER_KEY=<contenido de config/master.key> \
  -e DATABASE_URL=postgres://user:pass@host:5432/kleino_production \
  -e CORS_ORIGINS=http://localhost:5173 \
  kleino
```

El contenedor escucha en el puerto **80** (Thruster delante de Puma). Al
arrancar, `bin/docker-entrypoint` ejecuta `rails db:prepare` (crea las bases y
corre las migraciones) antes de levantar el servidor.

**Web** (imagen en dos etapas: `node:22-alpine` compila y `nginx` sirve):

```bash
docker build --build-arg VITE_API_URL=http://localhost:3000 -t kleino-frontend frontend/
docker run -d -p 5173:80 --name kleino-frontend kleino-frontend
```

`VITE_API_URL` se fija en el momento del build porque Vite la incrusta en el
bundle. nginx sirve la SPA con fallback a `index.html` y expone `/health`.

## Despliegue y CI/CD

- **`main`**: rama de integración. Todo entra por Pull Request; Jenkins corre
  lint, seguridad y tests en cada rama y PR.
- **`production`**: lo que está desplegado. Se actualiza mergeando `main` en
  `production`; ese merge dispara el deploy.

| Servicio | Contenedor (host) | URL pública |
|---|---|---|
| API | `127.0.0.1:4102` | <https://apikleino.frubilarz.cl> |
| Web | `127.0.0.1:4105` | <https://kleino.frubilarz.cl> |

Job: <https://jenkins.frubilarz.cl/job/kleino/> (Multibranch Pipeline; cada
rama y PR obtiene su propio pipeline a partir del `Jenkinsfile`).

En **todas las ramas**: Checkout → Test DB (Postgres efímero) →
**Backend: Build & Test** (Install deps, Lint, Security, Test) →
**Backend: Build image** → **Frontend: Build image**.

Solo en **`production`**, además: **Backend: Deploy** → **Backend: Health
Check** (espera hasta 180 s a que `/health` responda `200`) →
**Frontend: Deploy** → **Frontend: Health Check**. En el despliegue, la API
recibe `CORS_ORIGINS` con el origen de la web.

Credenciales que Jenkins necesita para el stage de deploy (no se necesitan
para el resto de las etapas):

| ID en Jenkins | Contenido |
|---|---|
| `kleino-rails-master-key` | Contenido de `config/master.key` |
| `kleino-database-url` | `postgres://user:pass@host:5432` |

## Flujo de trabajo con Git

- Nunca se trabaja directo en `main`. Cada tarjeta del tablero de Jira tiene su
  rama: `feature/SCRUM-XX-nombre` (también `fix/`, `test/`, `docs/` y `chore/`).
- Commits pequeños y descriptivos con formato `tipo(área): descripción`, por
  ejemplo `feat(roles): agrega columna rol a users`.
- Todo cambio entra por Pull Request, revisado por alguien **distinto** al autor.
- Al mergear se usa **"Create a merge commit"** (no Squash), para conservar la
  evidencia de trabajo progresivo.
- No se borra una rama mientras otro PR dependa de ella.
- Tablero Jira con las columnas Backlog, Desarrollo, En revisión y Master.

## Equipo

| Integrante | Tarea 1 | Tarea 2 |
|---|---|---|
| Diego Pérez | Tech Lead | Software Engineer |
| Agustín Ugas | Software Engineer | Tech Lead |
| Felipe Cruz | Software Engineer | Software Engineer |

## Pendientes de la Tarea 2

- [ ] Mergear el PR #23 (frontend en Jenkins y dominios) y luego `main` → `production`.
- [ ] Rol de usuario (migración) y usuario administrador en los seeds.
- [ ] Dueño de las sedes y autorización con Pundit (401 y 403).
- [ ] Web con acciones visibles según el rol.
- [ ] Autenticación por token para el móvil.
- [ ] App móvil en `mobile/` con al menos 4 pantallas y un flujo completo.
- [ ] Tests de autorización (backend) y al menos 3 tests móviles.
- [ ] Comando único para ejecutar todos los tests.
- [ ] Video de demostración (3 a 5 minutos).
