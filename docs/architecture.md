# Arquitectura de la App

## Stack Tecnológico

| Capa            | Tecnología                               |
| --------------- | ---------------------------------------- |
| Framework       | React Native                             |
| Lenguaje        | TypeScript                               |
| Navegación      | React Navigation (Native Stack + Drawer) |
| Estado servidor | TanStack React Query                     |
| Estado global   | Zustand                                  |
| Persistencia    | MMKV                                     |
| Formularios     | React Hook Form + Zod                    |
| UI Kit          | React Native Paper                       |
| HTTP            | Axios                                    |
| Fechas          | date-fns                                 |

## Estructura de Directorios

```
src/
├── api/          # Cliente HTTP, endpoints, tipos de respuesta
├── components/   # Componentes compartidos y reutilizables
├── hooks/        # Custom hooks de lógica reutilizable
├── navigation/   # Configuración de rutas y navegadores
├── screens/      # Pantallas (una por ruta)
├── store/        # Stores globales con Zustand
├── theme/        # Definición de colores, tipografía, spacing
├── types/        # Tipos globales de TypeScript
└── utils/        # Utilidades y helpers
```

## Principios Arquitectónicos

### 1. Separación por Capas

Cada carpeta tiene una responsabilidad única y bien definida. Una pantalla **nunca** importa directamente de `api/`; debe hacerlo a través de un hook personalizado en `hooks/`.

### 2. Flujo de Datos Unidireccional

```
Screen
  └─> Hook (custom hook / React Query)
        └─> Api (axios client)
              └─> Backend
```

- Las pantallas solo se comunican con hooks.
- Los hooks encapsulan la lógica de negocio y llamadas API.
- La capa `api/` se encarga exclusivamente de la comunicación HTTP.

### 3. Estado Global vs Estado Servidor

| Tipo            | Herramienta           | Uso                                          |
| --------------- | --------------------- | -------------------------------------------- |
| Estado servidor | TanStack React Query  | Datos obtenidos del backend (CRUD, listados) |
| Estado global   | Zustand               | UI state (modales, filters, sesión local)    |
| Estado local    | useState / useReducer | Estado efímero de un componente              |

### 4. UI System con React Native Paper

- Todos los componentes de UI deben usar los componentes de Paper (`Button`, `Card`, `TextInput`, etc.) en lugar de componentes nativos de RN para mantener consistencia visual.
- Los temas se definen en `theme/` usando el sistema MD3 de Paper con variantes `light` y `dark`.
- Se accede al tema mediante el hook `useTheme()` de Paper; nunca se importan colores sueltos.
- El espaciado, tipografía y paleta de colores se centralizan en el objeto tema.

### 5. Dark Mode

- El tema activo (`light` | `dark`) se persiste en MMKV y se gestiona desde un store de Zustand.
- PaperProvider recibe el tema correspondiente y lo aplica globalmente.
- Cada pantalla y componente usa colores del tema (ej. `theme.colors.primary`, `theme.colors.background`) para adaptarse automáticamente al modo activo.
- El cambio de tema es instantáneo y no requiere reinicio de la app.

### 6. Tipado Fuerte

- Todos los endpoints tienen tipos de request/response definidos en `api/`.
- Los schemas de Zod definen la validación en formularios.
- Se evita `any` en toda la base de código.

## Convenciones

### Nombrado de Archivos

- **Componentes**: `PascalCase.tsx` — ej: `UserCard.tsx`
- **Hooks**: `camelCase.ts` prefijo `use` — ej: `useUsers.ts`
- **Pantallas**: `PascalCase.tsx` sufijo `Screen` — ej: `HomeScreen.tsx`
- **Stores**: `camelCase.ts` — ej: `authStore.ts`
- **Archivos API**: `camelCase.ts` — ej: `users.api.ts`
- **Tipos**: `camelCase.ts` sufijo `.types` — ej: `user.types.ts`

### Organización de Componentes

- Componentes atómicos y reutilizables van en `components/`.
- Componentes específicos de una pantalla pueden vivir junto a ella o en una subcarpeta.
- Preferir composición sobre herencia.

### Gestión de Rutas

- Cada pantalla se define en `navigation/` con su nombre como constante.
- Los parámetros de ruta se tipan con `RootStackParamList`.
- El navegador principal se exporta como `RootNavigator`.

## Flujo de Inicio

```
App.tsx
  └── QueryClientProvider (React Query)
        └── SafeAreaProvider
              └── PaperProvider (theme según modo activo)
                    └── RootNavigator
                          └── AuthStack / MainStack / Drawer

ThemeProvider (Paper) usa el tema definido en theme/
  └── theme/index.ts exporta { lightTheme, darkTheme }
  └── Un store en Zustand (themeStore) persiste el modo en MMKV
  └── PaperProvider recibe el tema activo y lo aplica reactivamente
```

## Cómo Agregar una Pantalla Nueva

1. Crear el archivo en `screens/` (`NuevaScreen.tsx`).
2. Agregar la ruta en `navigation/` (constante + tipo en `RootStackParamList`).
3. Crear un hook en `hooks/` si se necesita lógica de negocio.
4. Si hay llamadas API, definir el endpoint en `api/`.
5. Si hay estado global, agregar el store en `store/`.

## Pruebas

- **Ubicación**: `__tests__/` espejando la estructura de `src/`.
- **Unitarias**: Para hooks y utilidades (Jest).
- **Componentes**: Para componentes puros (React Testing Library).
- **Integración**: Para flujos completos de pantalla.
