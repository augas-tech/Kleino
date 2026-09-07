# Kleino

Backend del proyecto Kleino. API en **Ruby on Rails 8.1** (modo API) con **PostgreSQL**.

## Requisitos

- Ruby 3.3.7 (ver `.ruby-version`)
- PostgreSQL corriendo localmente (o `DATABASE_URL` apuntando a uno)
- Bundler

## Correr en local

```bash
bundle install
bin/rails db:create db:migrate
bin/rails server
```

La app queda en `http://localhost:3000`.

Endpoints base:

- `GET /health` -> `200 {"status":"ok","service":"kleino","time":"..."}` (usado por el pipeline)
- `GET /up` -> health check por defecto de Rails

## Tests, lint y seguridad

```bash
bin/rails test
bin/rubocop
bin/brakeman --no-pager
bin/bundler-audit
```

Con PostgreSQL en Docker (sin instalarlo localmente):

```bash
docker run -d --name kleino-db -p 5433:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine
DATABASE_URL=postgres://postgres:postgres@localhost:5433 bin/rails db:test:prepare test
```

## Docker

```bash
docker build -t kleino .
docker run -d --name kleino -p 3000:80 \
  -e RAILS_MASTER_KEY=<contenido de config/master.key> \
  -e DATABASE_URL=postgres://user:pass@host:5432/kleino_production \
  kleino
```

El contenedor escucha en el puerto **80** (Thruster delante de Puma). Al arrancar,
`bin/docker-entrypoint` ejecuta `rails db:prepare` (crea las bases y corre las migraciones)
antes de levantar el servidor.

## Flujo de ramas

- `main`: integracion. Todo entra por Pull Request; Jenkins corre lint, seguridad y tests en cada rama y PR.
- `production`: lo que esta desplegado en <https://kleino.frubilarz.cl>. Se actualiza mergeando `main` en `production`; ese merge dispara el deploy.

## CI/CD (Jenkins)

La unica CI del repo es Jenkins (no hay workflows de GitHub Actions). Para que el estado de
cada build aparezca como *check* en los PRs de GitHub, el job Multibranch necesita una
credencial de GitHub (usuario + token) en **Branch Sources -> GitHub -> Credentials**;
sin ella Jenkins usa la API anonima, no puede publicar estados y choca con el rate limit.

Job: <https://jenkins.frubilarz.cl/job/kleino/> (Multibranch Pipeline sobre este repo;
cada rama y PR obtiene su propio pipeline a partir del `Jenkinsfile`).

Etapas que corren en **todas las ramas**:

1. **Checkout**
2. **Test DB** - levanta un PostgreSQL efimero (`postgres:16-alpine`) en la red `course-net`
3. **Install deps** - `bundle install` dentro de `ruby:3.3.7-slim` (gems cacheadas en el volumen `kleino-bundle`)
4. **Lint** - `bin/rubocop`
5. **Security** - `bin/brakeman` + `bin/bundler-audit`
6. **Test** - `bin/rails db:test:prepare test`
7. **Build image** - `docker build`

Solo en la rama **`production`**:

8. **Deploy** - reemplaza el contenedor `kleino`, publicado en `127.0.0.1:4102` (Nginx lo expone en `https://kleino.frubilarz.cl`)
9. **Health Check** - espera hasta 180 s a que `/health` responda 200 dentro del contenedor (`docker exec kleino curl http://127.0.0.1/health`); las migraciones corren en el arranque del contenedor

El PostgreSQL de test se destruye siempre al terminar el build (`post { always }`).

### Credenciales requeridas en Jenkins (solo para deploy)

| ID | Tipo | Valor |
|---|---|---|
| `kleino-rails-master-key` | Secret text | contenido de `config/master.key` |
| `kleino-database-url` | Secret text | `postgres://user:pass@host:5432` (Rails la aplica a las cuatro bases: `kleino_production`, `_cache`, `_queue` y `_cable`) |

Sin ellas el stage **Deploy** falla; las demas etapas no las necesitan.
