# Portfolio de desarrollo web

Portfolio en React para presentar servicios y ejemplos de páginas. El catálogo incluye una tienda demostrativa independiente con API REST, sesiones en MySQL, administración, inventario transaccional y Checkout de Stripe cuando se configuren credenciales de prueba. Sus productos e imágenes son de muestra.

## Requisitos

- Node.js 20.19+ o 22.12+ y npm.
- MySQL 8.0+.
- Una cuenta Stripe solo si se desea probar el pago.

## Inicio local

1. Copia `.env.example` como `.env` y configura MySQL y un `SESSION_SECRET` aleatorio de al menos 32 caracteres.
2. Crea la base `tienda` y un usuario MySQL con permisos sobre ella.
3. Desde la carpeta raíz, ejecuta `npm install`, `npm run db:generate`, `npm run db:migrate` y `npm run db:seed`.
4. Arranca frontend y API con `npm run dev`. Abre http://localhost:5173 para ver el portfolio; en el menú Catálogo, visita “Tienda de ejemplo”.

Las imágenes propias de `imagenesausar` se han optimizado y copiado a `client/public/images/`. Para cambiar el fondo de portada reemplaza `portfolio-background.jpg`; para cambiar la imagen de la tarjeta del catálogo, reemplaza `portfolio-project.jpg`. Los archivos de esa carpeta se sirven desde `/images/`.

Los detalles de configuración están en [docs/SETUP.md](./docs/SETUP.md).

## Preparación para GitHub

El `.gitignore` excluye dependencias, compilaciones, coberturas de pruebas, archivos locales de entorno y claves privadas. `.env.example` contiene valores de ejemplo: mantenlo sin credenciales reales y nunca subas `.env`, claves de Stripe ni contraseñas.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia el servidor API y Vite |
| `npm test` | Ejecuta las pruebas unitarias |
| `npm run lint` | Ejecuta ESLint |
| `npm run build` | Compila el frontend |
| `npm run db:migrate` | Aplica migraciones locales |
| `npm run db:seed` | Carga categorías y productos ficticios |
| `npm run admin:create` | Inicializador interactivo del primer administrador |

## Funcionalidad y límites

- Portfolio con presentación, catálogo ampliable y sección de servicios.
- Catálogo público de la tienda consultado desde la API; carrito de navegador persistido localmente.
- Registro, inicio/cierre de sesión y pedidos requieren la API y MySQL.
- El servidor obtiene precios y stock desde MySQL; el total enviado por el navegador se ignora.
- Las credenciales Stripe son opcionales; sin ellas, el servidor no acepta compras y no simula pagos.
- No se ha desplegado ni configurado ningún servicio externo. Consulta [docs/PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) y [docs/HUMAN_TASKS.md](./docs/HUMAN_TASKS.md).
