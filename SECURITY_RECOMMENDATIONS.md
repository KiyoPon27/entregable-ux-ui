# Recomendaciones de Seguridad y Cambios realizados

Fecha: 22-01-2026

Resumen rápido
- Cambios aplicados por el agente en frontend:
  - `Fronted/src/context/AuthContent.jsx`: expuso `checking` y usó `user = undefined` inicialmente para evitar redirecciones prematuras.
  - `Fronted/src/hooks/ProtectedRoute.jsx`: ahora espera `checking` y muestra `Spinner1` mientras se valida la sesión.
  - `Fronted/src/api/api.js`: añadido interceptor de respuesta que limpia token y redirige a `/login` en 401/403.
  - `Fronted/src/routers/routes.jsx`: añadida ruta `/home` → `/` para compatibilidad con URLs antiguas.

¿Estaba protegido el sistema antes de los cambios?
- Estado antes de los cambios: parcialmente protegido, pero con vulnerabilidades prácticas:
  - El token se guardaba en `localStorage` (vulnerable a XSS). Esto es funcional pero no ideal para producción.
  - No había un manejo centralizado de respuestas 401/403 (posible inconsistencia en manejo de sesión expirada).
  - Al montar la app, la ausencia de un estado "comprobando sesión" provocaba redirecciones prematuras y posibles exposiciones a rutas públicas/privadas involuntarias.
  - Había usos de `window.location.href` y `window.location.reload()` en varios puntos (hard reloads, menos control SPA).

- Conclusión: el sistema no era inseguro por sí mismo (el backend sigue siendo la defensa última), pero existían riesgos prácticos que podrían permitir fallos UX o exfiltración del token si un XSS estuviera presente.

Prioridad inmediata (qué aplicar ahora)
1. Mantener tokens fuera de `localStorage` en producción: mover a cookies `httpOnly, Secure, SameSite=Strict` con short-lived access tokens + refresh tokens.
2. Backend: soportar refresh tokens y endpoints para renovar/invalidar tokens, y emitir cookies httpOnly en vez de exponer el token a JS.
3. Validar y sanitizar todas las entradas que se renderizan en el DOM (prevención XSS). Aplicar Content Security Policy (CSP).
4. Evitar `window.location.href` para navegación normal: usar `useNavigate` de React Router o un store central para realizar navegación sin reload.
5. Manejar 401/403 de forma SPA (interceptor que notifica un store / emite evento en lugar de forzar `window.location.href`) para que la app pueda reaccionar sin hard reload.
6. Asegurar HTTPS, revisar y endurecer CORS origin permitido y cabeceras.
7. Revisar todos los puntos que acceden a `user` y añadir checks (`user && user.id` o `user?.id`) para evitar errores cuando `user` sea `undefined`.

Lista de cambios recomendados (con archivos sugeridos)

- `Fronted/src/context/AuthContent.jsx` (recomendar cambios backend+cookies):
  - Cambiar flujo para aceptar cookie httpOnly: no depender de `localStorage.getItem('token')` en frontend.
  - Si no puedes cambiar backend aún, minimiza el tiempo que el token permanece en storage y usa short-lived tokens.

- `Fronted/src/api/api.js`:
  - Ya existe interceptor `request` que añade token y `response` que maneja 401/403. Recomendación:
    - En vez de `window.location.href = '/login'`, emitir un evento (p.ej. `window.dispatchEvent(new CustomEvent('auth:expired'))`) o actualizar un `useAuthStore` para que la navegación la haga React sin recargar.
    - Mantener logging y posibles intentos de refresh automático si hay `refreshToken`.

- `Fronted/src/hooks/ProtectedRoute.jsx`:
  - Mantener espera con `checking` y mostrar spinner global en `App` si lo prefieres.
  - Revisar permisos y la lógica `hasPermission` para evitar bypasses.

- `Fronted/src/store/*` y llamadas API:
  - Revisa llamadas que usan `localStorage` directamente y centralízalas (todo pasa por `api.js` interceptor, idealmente no accedan a `localStorage` por separado).

- Backend (recomendado; cambios fuera del repo front):
  - Emitir token en cookie `httpOnly` y `Secure`.
  - Implementar `refresh token` con revocación segura (lista de revocación o DB).
  - Forzar HTTPS y revisar CORS.

Buenas prácticas adicionales
- CSP (Content Security Policy) para reducir superficie XSS.
- Escaneo de dependencias (`npm audit`, `snyk`) y actualizaciones regulares.
- Rate limiting en endpoints sensibles (login, token refresh).
- Force password rules, 2FA para cuentas admin.
- Monitorización y alertas (sentry, logs centralizados) por 401 repetidos o comportamiento anómalo.

Pruebas sugeridas (manuales)
1. Test de refresh: inicia sesión y fuerza una 401 en el backend; verifica que la app limpia token y redirige correctamente sin bucles.
2. Test de recarga (F5): navega a `/pos` y refresca; valida que permaneces en la ruta y no eres enviado incorrectamente a `/`.
3. Test XSS básico: revisar escape/sanitize de inputs que se muestran en la UI.
4. Test de navegación: reemplazar redirecciones `window.location.href` por `useNavigate` y comprobar que no provoca hard reload innecesario.

Plan de trabajo recomendado (prioridad y tiempos estimados)
- Corto (1-2 días):
  - Cambiar interceptor 401 para notificar al store en vez de `window.location.href`.
  - Barrido para añadir guards `user?` en componentes críticos.
  - Añadir tests manuales descritos arriba.
- Medio (3-7 días):
  - Implementar refresh tokens (si backend lo permite) y migrar a cookies httpOnly.
  - Añadir CSP y escaneo de dependencias.
- Largo (2-4 semanas):
  - Harden backend: revocación de tokens, 2FA, rate limiting, logging y monitorización.

Si quieres, puedo:
- 1) automatizar un "barrido" por el frontend y añadir guards `user?.` en los componentes que usan `user` (hacer PR con cambios), o
- 2) reemplazar la redirección por `useNavigate` para que el interceptor llame a un store central en vez de `window.location.href`.

---

Archivo generado por el asistente: `SECURITY_RECOMMENDATIONS.md`

