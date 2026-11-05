# Tareas que requieren intervención humana

## Antes de ejecutar localmente

- **Instalar/activar MySQL 8 y crear la base `tienda`.** La aplicación guarda catálogo, cuentas, sesiones, stock y pedidos en MySQL. Hazlo en tu equipo o en un proveedor que elijas; necesitas una URL `DATABASE_URL` con permisos limitados. Se completa al conectar la API y aplicar las migraciones descritas en [SETUP.md](./SETUP.md).
- **Crear `.env` local.** Los secretos no están en el repositorio. Copia `.env.example`, introduce `DATABASE_URL` y un secreto aleatorio `SESSION_SECRET` de 32 caracteres o más. Se completa al iniciar la API sin errores de configuración.

## Antes de vender

- **Completar la presentación profesional.** Sustituye los textos provisionales del portfolio por tu nombre, perfil, experiencia, servicios definitivos y datos de contacto.
- **Añadir imágenes propias si lo deseas.** Colócalas en `client/public/images/`; la portada acepta `portfolio-background.jpg`. Comprueba que tienes derechos para publicarlas.
- **Definir contenido comercial de la tienda de ejemplo.** Los productos, precios e imágenes actuales son demostrativos; sustitúyelos por productos, imágenes autorizadas, precios, disponibilidad, moneda, textos y datos de contacto definitivos.
- **Revisar términos y obligaciones legales.** Proporciona y publica datos fiscales, política de privacidad/cookies, condiciones de venta, envío, devoluciones, garantías e impuestos según tu jurisdicción. El proyecto no inventa ni certifica políticas legales.
- **Contratar/configurar proveedor externo y dominio.** Elige alojamiento Node, MySQL administrado y dominio; configura DNS, TLS, secretos y tareas de respaldo. Comprueba el sitio desde el dominio HTTPS y una restauración de copia.
- **Configurar Stripe en modo de prueba y verificar webhooks.** Crea cuenta, completa verificaciones exigidas y configura claves y endpoint como explica [SETUP.md](./SETUP.md). Necesitas claves de prueba y el secreto de firma; verifica que un pago de prueba solo se confirme tras el webhook.
- **Activar pagos reales solo tras revisión.** Debes completar la verificación de identidad/empresa en Stripe, revisar tarifas y cumplimiento, introducir claves de producción y registrar el webhook de producción. Ninguna compra ni activación se ha realizado por este agente.

## Administración

- **Crear la primera cuenta administradora.** Es una acción explícita para el propietario: define `ADMIN_BOOTSTRAP_TOKEN`, ejecuta `npm run admin:create` interactivamente y elimina el token al terminar. Necesitas una contraseña robusta; comprueba que el rol aparece como administrador y que el registro público no puede asignar ese rol.

La recuperación de contraseñas aún requiere que elijas y configures un proveedor de correo; no se envían correos ni se simula una recuperación.
