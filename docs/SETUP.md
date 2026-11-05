# Configuración y despliegue

## Desarrollo local

1. Instala Node.js 20.19+ o 22.12+ y MySQL 8+.
2. Crea una base de datos y un usuario restringido a esa base, por ejemplo:

   ```sql
   CREATE DATABASE tienda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'tienda'@'localhost' IDENTIFIED BY 'elige-una-clave-segura';
   GRANT ALL PRIVILEGES ON tienda.* TO 'tienda'@'localhost';
   ```

3. Copia `.env.example` a `.env`, completa `DATABASE_URL` y genera un secreto de sesión aleatorio de al menos 32 caracteres. No compartas ni publiques `.env`.
4. Instala y prepara el esquema desde la raíz:

   ```bash
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

5. La tienda queda en `http://localhost:5173` y la API en `http://localhost:3000`. Vite redirige `/api` a la API en desarrollo.

Las migraciones se guardan en `server/prisma/migrations`. En producción, aplica las migraciones versionadas con `prisma migrate deploy` y no uses `migrate dev`.

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `NODE_ENV` | No | `development`, `test` o `production`; en producción activa cookies `Secure` y proxy confiable. |
| `PORT` | No | Puerto HTTP del alojamiento; valor local `3000`. |
| `CLIENT_ORIGIN` | No | Origen exacto permitido por CORS y URL de retorno de Stripe. |
| `DATABASE_URL` | Sí | URL MySQL Prisma; usa credenciales propias del entorno. |
| `SESSION_SECRET` | Sí | Secreto aleatorio de al menos 32 caracteres. |
| `STORE_CURRENCY` | No | Moneda ISO de tres letras; por defecto `eur`. |
| `STRIPE_SECRET_KEY` | Para pagos | Clave secreta Stripe de prueba `sk_test_...`; nunca usar una clave publicada en el cliente. |
| `STRIPE_WEBHOOK_SECRET` | Para webhooks | Secreto `whsec_...` del endpoint de webhook correspondiente al entorno. |
| `ADMIN_BOOTSTRAP_TOKEN` | Para inicializar admin | Token aleatorio de al menos 24 caracteres; retirarlo después de crear el primer administrador. |

La API aborta el inicio si faltan variables obligatorias o son inválidas.

## Primer administrador

1. Define `ADMIN_BOOTSTRAP_TOKEN` en `.env` con un valor aleatorio no reutilizado.
2. Ejecuta `npm run admin:create` desde una terminal interactiva y proporciona el token, correo, nombre y una contraseña de al menos 12 caracteres. La contraseña y el token no se muestran mientras se escriben.
3. El script rechaza el registro si ya hay un administrador.
4. Elimina `ADMIN_BOOTSTRAP_TOKEN` de `.env` al terminar. El registro público no asigna rol administrativo.

## Stripe Checkout (solo pruebas)

1. Crea claves de prueba en el panel de Stripe y añádelas a `.env`.
2. Configura el endpoint `https://TU-DOMINIO/api/payments/webhook` para eventos `checkout.session.completed`, `checkout.session.expired` y `checkout.session.async_payment_failed`; copia su secreto de firma a `STRIPE_WEBHOOK_SECRET`.
3. En local, usa Stripe CLI para reenviar eventos a `http://localhost:3000/api/payments/webhook`.
4. El pedido se confirma exclusivamente en el webhook verificado. La redirección de éxito no confirma el pago.
5. No introduzcas claves reales en el repositorio ni habilites cobros reales hasta haber comprobado políticas, impuestos, identidad y webhooks de producción.

El webhook valida la firma sobre el cuerpo HTTP original; eventos repetidos se registran con ID único. Las reservas de stock se liberan en eventos fallidos o sesiones expiradas.

## Producción, copias y restauración

- Despliega el frontend compilado (`npm run build`) como sitio estático y el servidor Node como servicio HTTP. El servidor escucha `PORT`.
- Configura TLS en el alojamiento, `NODE_ENV=production`, `CLIENT_ORIGIN` HTTPS, secretos y una conexión MySQL privada. Cookies de sesión `HttpOnly`, `SameSite=Lax` y `Secure` se activan en producción.
- Ejecuta migraciones con `prisma migrate deploy` durante el despliegue y establece un proceso periódico de copia de seguridad MySQL cifrada y con acceso restringido.
- Prueba restauraciones en una base separada. Ejemplo operativo: `mysqldump --single-transaction tienda > tienda-backup.sql`; restauración: `mysql tienda < tienda-backup.sql`. Protege los archivos, porque contienen datos personales.
- No se ha realizado un despliegue ni verificado un proveedor externo desde este entorno.
