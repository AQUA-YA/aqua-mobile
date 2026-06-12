# START — AquaYa (AQUA)

App mobile de marketplace de agua purificada. React Native 0.86 + TypeScript.

## Requisitos

- Node.js >= 22.11.0
- Xcode (iOS, macOS únicamente)
- Android Studio (Android)
- CocoaPods (iOS, `sudo gem install cocoapods` o via Bundler)
- Ruby + Bundler (para CocoaPods en iOS)

---

## Desarrollo

### 1. Instalar dependencias

```sh
npm install
```

### 2. Dependencias nativas (iOS)

Solo la primera vez o después de agregar módulos nativos:

```sh
cd ios && bundle install && bundle exec pod install && cd ..
```

### 3. Iniciar Metro

```sh
npm start
```

### 4. Ejecutar en dispositivo/emulador

En otra terminal:

```sh
npm run ios      # iOS simulator
npm run android  # Android emulator/device
```

### Lint y tests

```sh
npm run lint
npm test
```

---

## Producción

### Android

```sh
cd android
./gradlew bundleRelease   # AAB para Play Store
./gradlew assembleRelease # APK directo
```

El archivo generado estará en `android/app/build/outputs/`.

### iOS

Abrir `ios/AquaMobile.xcworkspace` en Xcode, seleccionar _Any iOS Device (arm64)_ y archivar (_Product → Archive_). Luego distribuir vía TestFlight o App Store Connect.

---

## Uso básico

La app inicia con la pantalla boilerplate. A medida que se construyan las funcionalidades, el flujo principal será:

1. **Registro / Login** — correo + código de verificación de 6 caracteres.
2. **Completar perfil** — nombre, apellido, fecha de nacimiento, dirección.
3. **Modo Consumidor** (por defecto) — buscar purificadoras cercanas, filtrar por tipo de agua/tamaño, hacer pedidos.
4. **Modo Purificador / Repartidor** — activable desde el perfil; cada rol tiene su propio dashboard y navegación.

La arquitectura del código sigue el patrón **Screen → Hook → API → Backend**. Más detalles en `docs/architecture.md`.
