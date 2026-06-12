# API Gaps

Features documented in `01-definition.md` that lack backend endpoints:

| Feature | Required Endpoint | Status |
|---------|------------------|--------|
| Calificar repartidor | `POST /delivery/:deliveryUserId/ratings` | Missing |
| Calificar repartidor (lista) | `GET /delivery/:deliveryUserId/ratings` | Missing |
| Notificaciones push (registro FCM) | `POST /notifications/register` | Missing |
| Notificaciones push (preferencias) | `GET/PUT /notifications/preferences` | Missing |

These endpoints should be added to the backend before implementing the corresponding mobile features.
