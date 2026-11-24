# Kleino móvil (Expo + React Native)

App de la Tarea 2. Usa la misma API Rails que la web, sin un backend aparte.

## Requisitos
- Node.js LTS
- Expo Go en el teléfono, o Android Studio con un emulador
- La API corriendo: `bin/rails server -b 0.0.0.0` (en la raíz del repo)

## Instalación
```bash
cd mobile
npm install
cp .env.example .env
npx expo start -c
```

## URL de la API (`EXPO_PUBLIC_API_URL` en `.env`)
| Escenario | Valor |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` |
| Teléfono en la misma WiFi | `http://IP_DEL_PC:3000` |
| API desplegada | `https://apikleino.frubilarz.cl` |

Si cambias el `.env`, reinicia con `npx expo start -c`.

## Usuarios de prueba
| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `docente@kleino.cl` | `kleino2026` |
| Usuario registrado | `alumno@kleino.cl` | `kleino2026` |

## Autenticación
- El login envía `X-Client: mobile` a `POST /session`. La API responde `{ user, token }` sin cookie.
- El token (Bearer opaco, no JWT) se guarda con `expo-secure-store` (Keychain/Keystore) y va en `Authorization: Bearer <token>`.
- Un `401` borra el token y vuelve al login con el aviso "Tu sesión expiró". El logout invalida el token en la API.
- Los `403`, `404`, `422` y `429` se muestran como mensajes claros, no como errores técnicos.

## Pantallas y flujo
Login → Espacios (búsqueda) → Detalle → Nueva/editar reserva → confirmación → Mis reservas (editar o cancelar) → Perfil (logout).

Administrador: ve también los espacios inactivos, crea y edita espacios (Formulario de espacio) y cancela reservas de sus espacios. No crea reservas. Si fuerza una acción no permitida, la API responde 403 y la app muestra el mensaje.

## Tests
```bash
npm test
```
Jest + React Native Testing Library: formato, validaciones, cliente HTTP (Bearer, 401, 403, 422, 429, red), login y acciones por rol.

## APK (opcional)
```bash
npm install -g eas-cli
eas login
eas init
eas build -p android --profile preview
```

## Pendiente
- Aprobar/rechazar reservas: falta el endpoint en la API (`PATCH /reservas/:id/aprobar` y `/rechazar`).
