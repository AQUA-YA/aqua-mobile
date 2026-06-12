# Master Prompt — Desarrollo de la app móvil AquaYa (AQUA)

> **Propósito de este documento:** Este es el prompt maestro para implementar la aplicación móvil de AquaYa. Léelo completo antes de escribir código. Junto con `docs/01-definition.md` (producto), `docs/api-definition.md` (contrato del backend, 119 endpoints + WebSockets) y `docs/architecture.md` (arquitectura mobile), define TODO lo que hay que construir. Ante cualquier conflicto: `api-definition.md` manda sobre el contrato de datos, `01-definition.md` manda sobre comportamiento de producto, `architecture.md` manda sobre estructura de código.

---

## 1. Contexto y objetivo

Construir la app móvil (iOS + Android) de **AquaYa**: un marketplace de agua purificada a domicilio. Proyecto React Native 0.86 + TypeScript ya bootstrapeado (`App.tsx` con boilerplate, sin `src/`). La app cubre **4 modos completos**: Consumidor, Purificador, Repartidor y Admin. Todos los modos se implementan en la app móvil, incluyendo los endpoints marcados `ADMIN` en la API.

**Alcance: producto completo.** Todos los módulos: auth, pedidos, monedero, suscripciones, lealtad, referidos, cupones, chat, KYC, QR, purificadoras, inventario, POS, caja, reportes, tickets de soporte, notificaciones push. Implementar por fases (sección 10), pero el objetivo final es todo.

## 2. Decisiones ya tomadas (no re-preguntar)

1. **Idioma UI:** español hardcodeado. Sin i18n. Código (variables, archivos, componentes) en inglés.
2. **Depósitos al monedero:** sin Stripe SDK. La app solo llama `POST /wallets/me/deposits { amount }`; el backend maneja el cobro. Integración Stripe = fase futura.
3. **Tiempo real:** Socket.io client contra `ws://<host>:3000` con `auth: { token }` (eventos documentados en api-definition.md §WebSockets). Complementar con refetch de React Query como fallback (refetchInterval en pantallas de pedido activo: 15s si el socket está desconectado).
4. **Base URL:** configurable. Crear `src/config/env.ts` con `API_URL` (default `http://localhost:3000/api`; en Android emulator usar `http://10.0.2.2:3000/api`) y `WS_URL` derivada.
5. **Stack fijo** (instalar conforme se necesite): React Navigation (native stack + bottom tabs + drawer), Zustand, @tanstack/react-query, Axios, React Hook Form + Zod, React Native Paper (MD3), react-native-mmkv, date-fns, socket.io-client, @react-native-firebase/messaging (FCM), react-native-maps (Google Maps), react-native-vision-camera o react-native-image-picker (fotos/KYC/avatar), react-native-qrcode-svg (mostrar QR) + escáner QR (vision-camera code scanner).

## 3. Arquitectura y convenciones (obligatorias)

Estructura bajo `src/`: `api/`, `components/`, `config/`, `hooks/`, `navigation/`, `screens/`, `store/`, `theme/`, `types/`, `utils/`.

- **Flujo de datos:** Screen → Hook → API → Backend. Las pantallas NUNCA importan de `api/`.
- **Estado:** servidor = React Query; UI global (sesión, rol activo, tema) = Zustand (persistido con MMKV donde aplique); local = `useState`.
- **Naming:** PascalCase componentes/pantallas; hooks `useXxx` camelCase. Prettier: comillas simples, trailing commas, `arrowParens: 'avoid'`.
- **Tipos:** `src/types/` refleja EXACTAMENTE el contrato de `api-definition.md`: enums (`Role`, `OrderStatus`, `OrderMode`, `PaymentMethod`, `TransactionType`, `CouponType`, `SubscriptionFrequency`, `ChatMessageType`, `TicketStatus`, `KycStatus`, `CommissionType`, `InventoryMovementType`, `CashEntryType`, `StoreSalePaymentMethod`) con sus valores en inglés tal cual (`pending`, `in_transit`, etc.). Envelope: `ApiResponse<T> = { data: T; message: string }` y `Paginated<T> = { data: T[]; meta: { total; page; limit; totalPages }; message }`.
- **Tests:** Jest unitarios + React Testing Library para componentes; integración en `__tests__/`. Cada módulo nuevo lleva al menos tests de sus hooks y pantallas críticas.

### 3.1 Cliente HTTP (`src/api/client.ts`)

- Axios con `baseURL = API_URL`.
- Request interceptor: agrega `Authorization: Bearer <accessToken>` desde el store de auth.
- Response interceptor: en 401 (y no siendo ruta `/auth/*`), intenta `POST /auth/refresh` con el `refreshToken`; si el refresh tiene éxito, reintenta la petición original; si falla, hace logout (limpia store + MMKV) y navega a Login. Usar un mutex/cola para no disparar múltiples refresh simultáneos.
- Los errores del backend tienen forma `{ statusCode, message, error }` con `message` en español → mostrarlo directamente al usuario (snackbar/toast).

### 3.2 Auth y sesión

- Tokens (`accessToken`, `refreshToken`) y `user` persistidos en MMKV vía Zustand store (`src/store/authStore.ts`).
- Al abrir la app: si hay token, llamar `GET /auth/me` para hidratar el usuario; si 401 tras refresh, ir a Login.
- **Registro (3 pasos, según definition §16.1):** `POST /auth/register {email}` → pantalla de código → `POST /auth/verify-code` → pantalla contraseña (min 8) → `POST /auth/set-password` (devuelve tokens + user → sesión iniciada automáticamente) → pantalla "Completar perfil" (nombre, apellido, fecha nacimiento, género, código de referido opcional) vía `PATCH /users/me/profile` — **se puede saltar**; si el perfil está incompleto, mostrar banner recordatorio persistente en el dashboard, sin bloquear nada.
- **Recuperación:** `forgot-password` → código → `reset-password` → luego login (el endpoint reset devuelve `null`, así que tras resetear hacer `POST /auth/login` automático con la nueva contraseña).

### 3.3 Roles y switcheo de modo

- `user.roles: Role[]`. Todos tienen `consumer`. Store Zustand `activeMode: 'consumer' | 'purifier' | 'delivery' | 'admin'` persistido en MMKV.
- Switcher de modo en el drawer/perfil: solo muestra modos cuyos roles están activos en el usuario. El modo Admin solo aparece si el usuario tiene el rol `admin` (asignado por el backend, no activable desde la app).
- Activar rol: `POST /users/me/roles/purifier` o `/delivery` desde la pantalla de perfil ("Quiero vender agua" / "Quiero repartir").
- Al cambiar `activeMode`, el navigator raíz remonta el tab navigator del modo correspondiente.

### 3.4 Navegación (`src/navigation/`)

- `RootNavigator`: decide entre `AuthStack` (sin sesión) y la app (con sesión).
- Por modo, **bottom tabs** (regla UI/UX de definition §15):
  - **Consumidor:** Inicio · Pedidos · Monedero · Perfil (suscripciones, lealtad, referidos, cupones, soporte y direcciones cuelgan de Inicio/Perfil como stacks).
  - **Purificador:** Dashboard · Pedidos · Negocio (purificadoras, inventario, POS, caja, reportes, promos, repartidores) · Monedero · Perfil.
  - **Repartidor:** Disponibles · Activo · Historial · Monedero · Perfil (KYC, inventario propio, precios, disponibilidad, QR).
  - **Admin:** Dashboard · Usuarios · Purificadoras · Pedidos · Catálogos (tipos de agua, tamaños) · Config (comisiones, KYC, promociones globales, soporte) · Reportes.

### 3.5 Tema

- `src/theme/`: React Native Paper MD3, light/dark, persistido (MMKV + Zustand). Paleta azul/agua. Todo componente visual sale de Paper.

### 3.6 Tiempo real (`src/api/socket.ts` + `src/hooks/useOrderSocket.ts`)

- Singleton socket.io-client conectado tras login con `auth: { token: accessToken }`; reconectar al refrescar token; desconectar en logout.
- Sala personal `user:{userId}` automática. Para un pedido activo: emitir `order.join(orderId)` al montar la pantalla y `order.leave` al desmontar.
- **Cliente emite:** `order.location.update { orderId, lat, lng }` (repartidor en reparto, cada ~10s con geolocalización), `chat.send { orderId, messageType?, content }`.
- **Cliente escucha:** `order.location` (mover marker del repartidor en el mapa del consumidor), `chat.message` (append al chat + invalidar query de mensajes). Escuchar también los eventos planificados (`order.new`, `order.status`, `order.assigned`, `order.cancelled`, `order.updated`, `kyc.status`) → al recibirlos, invalidar las queries de React Query correspondientes. Si el socket está desconectado, las pantallas de pedido activo usan `refetchInterval: 15000`.

### 3.7 Notificaciones push (FCM)

- Tras login, obtener token FCM y registrarlo: `POST /notifications/tokens { token, platform }`. En logout: `DELETE /notifications/tokens/:token`.
- Manejar notificación tocada → deep-link a la pantalla del pedido/chat correspondiente.

### 3.8 Offline

- React Query con cache persistido (persister sobre MMKV) para lecturas: catálogos (tipos de agua, tamaños), pedidos anteriores, direcciones, purificadoras vistas. Mutaciones requieren conexión (mostrar error claro si no hay red).

### 3.9 Reglas UI/UX globales (definition §15 — aplican a TODA pantalla)

- Listas paginadas (10–20 ítems, infinite scroll con `useInfiniteQuery` usando `meta.totalPages`).
- Confirmación ("¿Estás seguro de…?") antes de toda acción destructiva/importante (cancelar pedido, eliminar dirección, cerrar caja, cancelar suscripción, retiro).
- Feedback de éxito/error en cada mutación (Snackbar de Paper con `message` del backend).
- Loading en toda petición (skeletons en listas, spinner/disabled en botones).
- Avatar editable en perfil (`PATCH /users/me/avatar` con base64).

## 4. Modo Consumidor — pantallas y endpoints

| Pantalla | Comportamiento | Endpoints |
|---|---|---|
| **Inicio/Dashboard** | Pedidos recientes + purificadoras cercanas (pedir permiso de ubicación; mapa + lista). Búsqueda por nombre y filtros por tipo de agua / tamaño. Banner de perfil incompleto. | `GET /orders/mine`, `GET /purifiers/nearby?lat&lng&radiusKm&waterTypeId&bottleSizeId&search`, `GET /water-types`, `GET /bottle-sizes` |
| **Detalle purificadora** | Info, fotos, horario, rating, precios por tipo/tamaño, calificaciones paginadas. Botón "Pedir aquí". | `GET /purifiers/:id`, `GET /purifiers/:id/prices`, `GET /purifiers/:id/ratings` |
| **Crear pedido (wizard)** | 1) modo (`open` / `to_purifier` / `to_delivery`), 2) tipo de agua + tamaño + cantidad, 3) dirección (guardada `addressId` o nueva `deliveryAddress`), 4) propina ($5/$10/$20/personalizada), 5) cupón **o** puntos (excluyentes: no combinar; validar cupón antes de confirmar), 6) método de pago `cash`/`wallet` (si wallet, validar saldo ≥ total y avisar que se bloquea), 7) `requiresEmptyPickup` (devuelve garrafón vacío), 8) resumen + confirmar. | `POST /coupons/validate`, `GET /loyalty/me`, `GET /wallets/me`, `POST /orders` |
| **Pedido activo** | Estado en vivo (`pending→accepted→in_transit→empty_pickup→delivered`), nombre de quien aceptó, mapa con ubicación del repartidor (`order.location`), botón chat, cancelar (con motivo). Al `delivered`: prompt para calificar la purificadora. | `GET /orders/:id`, socket `order.join`/`order.status`/`order.location`, `POST /orders/:id/cancel`, `POST /purifiers/:id/ratings { orderId, score, comment? }` |
| **Chat del pedido** | Solo con pedido activo; consumidor envía texto y ubicación. Mensajes vía socket `chat.send`/`chat.message`; historial REST paginado. Ocultar chats de pedidos finalizados hace >24h. | `GET/POST /orders/:id/messages` |
| **Historial de pedidos** | Lista paginada con filtro por estado; detalle. | `GET /orders/mine?status=` |
| **Monedero** | Saldo + totales, depositar (monto, min 1), historial de transacciones con filtro por tipo. | `GET /wallets/me`, `POST /wallets/me/deposits`, `GET /wallets/me/transactions` |
| **Suscripciones** | Lista (activas/pausadas), crear (tipo, tamaño, cantidad, frecuencia `weekly/biweekly/monthly`, día 0-6, hora, dirección, método de pago, purificadora opcional), editar, pausar/reanudar, cancelar, ver pedidos generados. | `POST/GET/PATCH/DELETE /subscriptions*`, `/subscriptions/:id/pause|resume`, `/subscriptions/:id/orders` |
| **Lealtad** | Puntos totales + historial; canje al crear pedido (`redeemPoints`). Mostrar tabla de canje (100→$10, 250→$30, 500/1000→garrafón gratis) y caducidad 90 días. Lista de eventos activos. | `GET /loyalty/me`, `GET /loyalty/events` |
| **Referidos** | Código propio (de `auth/me.referralCode`) con botón compartir (Share API), estadísticas. | `GET /referrals/me` |
| **Perfil** | Editar datos, avatar, direcciones CRUD (con mapa para lat/lng, marcar principal), activar roles, tickets de soporte (crear/lista/detalle), escanear QR del repartidor para verificar identidad, tema claro/oscuro, logout. | `PATCH /users/me/profile`, `PATCH /users/me/avatar`, `/users/me/addresses*`, `/users/me/roles/*`, `/support-tickets*`, `POST /delivery/verify-qr` |

## 5. Modo Purificador — pantallas y endpoints

| Pantalla | Comportamiento | Endpoints |
|---|---|---|
| **Dashboard** | Selector de purificadora activa (puede tener varias). Pedidos disponibles cercanos + tomados. Resumen del día: ventas, pedidos, garrafones (derivar de store-sales + orders). | `GET /purifiers/mine`, `GET /orders/available?lat&lng&radiusKm`, `GET /orders/assigned`, `GET /purifiers/:id/store-sales?from&to` |
| **Pedidos** | Aceptar (first-accept; manejar 409/404 si otro ganó → quitar de lista), asignar a repartidor vinculado, cambiar estado, entregar (`emptyBottleReturned`), ruta al cliente en mapa, chat. | `POST /orders/:id/accept`, `POST /orders/:id/assign`, `PATCH /orders/:id/status`, `POST /orders/:id/deliver`, `GET /orders/:id`, chat |
| **Mis purificadoras (CRUD)** | Crear/editar/eliminar: nombre, dirección + pin en mapa (lat/lng), horario, teléfono, fotos, descripción, tipos de agua, tamaños, deliveryFee. Gestión de precios por combinación tipo×tamaño. | `POST/GET/PATCH/DELETE /purifiers*`, `GET/PUT /purifiers/:id/prices` |
| **Repartidores** | Vincular por `deliveryUserId`, asignar turno opcional (`matutino/vespertino/completo` — sin turno = disponible según su estado), editar/desvincular. | `/purifiers/:id/delivery-links*` |
| **Inventario** | Por tamaño: cantidad, sellos, umbral de stock bajo (alerta visual si quantity ≤ threshold). Movimientos `in/out/adjustment` con razón + historial. | `GET/PUT /purifiers/:id/inventory`, `/inventory/movements` |
| **POS (venta en local)** | Tipo + tamaño + cantidad + total + método (`cash/wallet/transfer`). Auto-deduce inventario y registra en caja (lo hace el backend). Lista de ventas con rango de fechas. | `POST/GET /purifiers/:id/store-sales` |
| **Caja** | Abrir caja (saldo inicial), agregar ingresos/egresos (concepto + monto), cerrar caja (confirmación), historial de cierres. | `/purifiers/:id/cash-registers*` |
| **Reportes** | Ventas diario/semanal/mensual o rango; gráficas comparativas (lib de charts ligera, ej. react-native-gifted-charts); exportar CSV (`format=csv` → compartir archivo). | `GET /purifiers/:id/reports/sales` |
| **Promociones** | CRUD de cupones propios (`purifierId` propio): código, tipo, valor, vigencia, usos máximos. Eventos de lealtad propios (multiplicador de puntos). | `POST /coupons`, `GET /coupons/mine`, `PATCH/DELETE /coupons/:id`, `/loyalty/events*` |
| **Monedero** | Igual que consumidor + **retiros** (`POST /wallets/me/withdrawals`), desglose de cobros/comisiones (filtros de transacciones `earning`, `commission`, `withdrawal`). Mostrar config de comisión vigente (`GET /commission-config`). | `/wallets/me*` |

## 6. Modo Repartidor — pantallas y endpoints

| Pantalla | Comportamiento | Endpoints |
|---|---|---|
| **Onboarding/KYC** | Si KYC no está `approved`: bloquear aceptación de pedidos y mostrar flujo: foto INE + selfie (cámara, enviar base64), estado `pending/approved/rejected` (+motivo). Escuchar `kyc.status` por socket. | `POST/GET /delivery/me/kyc` |
| **Configuración delivery** | Toggle disponibilidad, `hasOwnInventory` (propio vs recoge en purificadora), deliveryFee; si inventario propio: upsert inventario (tipo×tamaño×cantidad) y precios propios. | `GET/PATCH /delivery/me/profile`, `PATCH /delivery/me/availability`, `GET/PUT /delivery/me/inventory`, `GET/PUT /delivery/me/prices` |
| **Pedidos disponibles** | Lista por cercanía (geolocalización) con detalles; aceptar (first-accept, manejar carrera). Refrescar con `order.new` + pull-to-refresh. | `GET /orders/available`, `POST /orders/:id/accept` |
| **Pedido activo** | Mapa con ruta al cliente, cambiar estado (`in_transit`, `empty_pickup` si aplica), emitir ubicación (`order.location.update` cada ~10s), chat (texto, foto, ubicación), marcar entregado (`emptyBottleReturned?`) — al entregar, si fue wallet el settlement es automático; si cash, recordar cobrar total + propina. | `GET /orders/assigned`, `PATCH /orders/:id/status`, `POST /orders/:id/deliver`, sockets, chat |
| **Mi QR** | Mostrar QR (`qrToken`) para que el consumidor lo escanee al recibir. | `GET /delivery/me/qr` |
| **Historial** | Entregas realizadas, paginado. | `GET /delivery/me/deliveries` |
| **Monedero** | Igual que purificador (cobros, comisiones, retiros). | `/wallets/me*` |

## 7. Modo Admin — pantallas y endpoints

| Pantalla | Comportamiento | Endpoints |
|---|---|---|
| **Dashboard** | Métricas y gráficas: usuarios registrados (totales/nuevos), pedidos por día/semana/mes, tipo de agua más vendido, ingresos y comisiones, top purificadoras/repartidores, tasa de conversión referidos, puntos emitidos/canjeados, suscripciones activas, mapa de calor de demanda. | `GET /admin/stats`, `GET /admin/reports/sales`, `GET /admin/demand-heatmap` |
| **Usuarios** | Lista paginada filtrable (email, nombre). Ver perfil completo, cambiar roles, suspender, ver KYC. | `GET /admin/users`, `GET /admin/users/:id`, `PATCH /admin/users/:id` |
| **KYC** | Lista de verificaciones pendientes/aprobadas/rechazadas. Ver documentos (foto INE + selfie), aprobar o rechazar con motivo. | `GET /admin/kyc`, `PATCH /admin/kyc/:id` |
| **Purificadoras** | Lista paginada. Ver, editar o eliminar cualquier purificadora. | `GET /admin/purifiers`, `GET /purifiers/:id`, `PATCH /purifiers/:id`, `DELETE /purifiers/:id` |
| **Pedidos** | Todos los pedidos con filtros por estado, fecha, usuario. Ver detalle. | `GET /admin/orders` |
| **Catálogos** | CRUD de tipos de agua y tamaños de garrafón (agregar, editar, activar/desactivar). | `POST/GET/PATCH/DELETE /water-types`, `POST/GET/PATCH/DELETE /bottle-sizes` |
| **Comisiones** | Ver y editar configuración de comisión (fija / porcentaje / desactivada). | `GET/PUT /commission-config` |
| **Promociones globales** | CRUD de cupones globales (sin purificadora asignada) y eventos de lealtad (puntos dobles, fechas especiales). | `POST /coupons`, `GET/PATCH/DELETE /coupons/:id`, `/loyalty/events*` |
| **Soporte** | Lista de tickets (abiertos, en proceso, cerrados). Ver detalle, responder, cerrar. | `GET /admin/support-tickets`, `PATCH /admin/support-tickets/:id` |
| **Reportes** | Descargar reportes en CSV (usuarios, pedidos, ventas, comisiones). | `GET /admin/reports/*?format=csv` |

## 9. Reglas de negocio que la app debe respetar

1. **Estados del pedido:** `pending → accepted → in_transit → [empty_pickup] → delivered`, cancelable antes de `delivered`. La UI solo ofrece la transición siguiente válida.
2. **First-accept:** al fallar la aceptación porque otro ganó, mostrar "Este pedido ya fue tomado" y remover de la lista.
3. **Cupón XOR puntos:** un pedido usa cupón O puntos, nunca ambos. Promos no aplican sobre propina.
4. **Pago wallet:** validar saldo suficiente (total = subtotal + propina − descuento) antes de permitir confirmar; explicar el bloqueo de fondos.
5. **KYC:** repartidor sin `approved` no puede aceptar pedidos (deshabilitar UI aunque el backend también valide). Mostrar badge "Verificado".
6. **Chat:** activo solo en `pending/accepted/in_transit/empty_pickup`; ocultar de la lista 24h después de finalizar. Consumidor: texto + ubicación; repartidor: texto + foto + ubicación.
7. **Roles:** la UI de cada modo solo aparece si el rol está activo; consumidor puro no puede switchear sin activar el rol antes.
8. **Soft delete:** los DELETE devuelven `{ deletedAt }`; tratar como eliminación normal en UI (sin vista de eliminados en mobile).
9. **Referidos:** el código se ingresa solo al completar perfil (campo `referralCode`); bonos los acredita el backend.

## 10. Calidad y verificación

- `npm run lint` y `npm test` deben pasar antes de dar por terminada cada fase.
- TypeScript estricto: sin `any` en el contrato API.
- Probar build: `npm run android` / `npm run ios` (recordar `bundle exec pod install` en `ios/` tras agregar módulos nativos).
- Manejar permisos nativos (ubicación, cámara, notificaciones) con flujos de solicitud y estados denegados (pantalla explicativa, no crash).

## 11. Qué NO hacer

- No integrar Stripe SDK ni pasarelas de pago en el cliente.
- No inventar endpoints: si una feature de `01-definition.md` no tiene endpoint en `api-definition.md`, implementar la UI con lo disponible y dejar un `TODO(api)` documentado en el código y un listado en `docs/api-gaps.md`.
- No usar librerías de UI distintas a React Native Paper.
- No guardar tokens fuera de MMKV ni loggear datos sensibles (tokens, documentos KYC).

## 12. Plan de implementación por fases (en orden)

1. **Fundación:** `src/` completo, theme MD3 + dark mode, axios client + refresh, authStore + MMKV, React Query provider + persister, RootNavigator, tipos del contrato API.
2. **Auth:** registro 3 pasos, login, recuperación, completar perfil, banner perfil incompleto, perfil + avatar + direcciones + tema.
3. **Consumidor núcleo:** dashboard, purificadoras cercanas + detalle + filtros, wizard de pedido (sin cupones/puntos aún), historial, pedido activo con polling.
4. **Tiempo real:** socket singleton, tracking en mapa, chat completo, estados live.
5. **Monedero:** saldo, depósitos, transacciones; pago wallet en wizard.
6. **Repartidor:** KYC, disponibilidad, inventario/precios propios, disponibles + aceptar, pedido activo + ubicación + entrega, QR, historial, retiros.
7. **Purificador núcleo:** CRUD purificadoras + precios, dashboard, aceptar/asignar pedidos, repartidores vinculados + turnos.
8. **Negocio purificador:** inventario + movimientos, POS, caja, reportes + CSV + gráficas.
9. **Crecimiento:** cupones (validación en wizard + CRUD purificador), lealtad (canje + eventos), referidos, suscripciones.
10. **Admin:** dashboard con métricas/gráficas, gestión de usuarios + KYC, purificadoras, pedidos, catálogos, comisiones, promociones globales, soporte, reportes CSV.
11. **Cierre:** push FCM + deep links, offline cache, calificaciones, escaneo QR consumidor, pulido UX (skeletons, empty states, confirmaciones) y barrido de tests.

Cada fase termina con: lint + tests verdes, build corriendo, y commit con mensaje descriptivo.
