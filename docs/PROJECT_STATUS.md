# Estado del proyecto

## Implementado en código

- Portfolio principal con navegación Presentación/Catálogo/Contrata nuestros servicios; la tienda previa está conservada como “Tienda de ejemplo” en `/tienda`.
- Imágenes propias de `imagenesausar` optimizadas y conectadas: fondo del portfolio y arte de la tarjeta de tienda; los originales se conservaron.
- Aplicación React/Vite adaptable, catálogo remoto, filtros por búsqueda/categoría/precio, detalle, carrito persistido y vistas de autenticación, pedidos y administración.
- API Express con validación Zod, sesiones en MySQL, controles CSRF/CORS, Helmet, rate limits, contraseñas con bcrypt, acceso administrativo protegido y errores sin detalles internos al cliente.
- Esquema Prisma/MySQL para usuarios, sesiones, categorías, productos, direcciones, pedidos, líneas, pagos y eventos de webhook.
- Reservas de inventario transaccionales con precio e información de producto congelados en el pedido; Checkout Stripe del lado del servidor y webhooks firmados/idempotentes.
- Seed ficticio, inicializador de primer administrador, documentación y pruebas unitarias iniciales.

## Verificación

- Revisado: la carpeta de trabajo estaba vacía antes de crear el proyecto; Node.js 24.14.1, npm 11.11.0 y Git están disponibles.
- Pendiente: instalación de dependencias, pruebas, lint y compilación.
- No fue posible detectar MySQL ni Docker en el equipo al iniciar el trabajo. Migraciones, persistencia real, integración Stripe y despliegue no están verificados.

## Pendiente

- Conectar MySQL y generar/aplicar la primera migración.
- Probar flujos completos de sesión, carrito, checkout, webhook y administración contra MySQL/Stripe de prueba.
- Integrar proveedor de correo para recuperación de contraseña.
- Añadir pruebas de integración y de navegador al disponer de servicios locales.
- Completar las tareas humanas de [HUMAN_TASKS.md](./HUMAN_TASKS.md).
