# Portfolio personal

Sitio estático de presentación para mostrar experiencia, proyectos de ejemplo y vías de contacto. Incluye una tienda de muestra navegable con catálogo y bolsa local para enseñar el flujo visual; su pasarela de pago es solo una maqueta deshabilitada y no se realizan compras ni pedidos.

## Desarrollo local

- Requisitos: Node.js 20.19+ o 22.12+ y npm.
- Instala dependencias con `npm install`.
- Inicia el sitio con `npm run dev` y abre http://localhost:5173.
- Comprueba la compilación de producción con `npm run build`.
- Ejecuta las pruebas con `npm test` y ESLint con `npm run lint`.

El portfolio y la tienda de muestra no necesitan MySQL, claves de Stripe ni variables de entorno. La carpeta `server/` se conserva en el repositorio, pero no se usa ni se despliega para el sitio estático.

## Publicación en GitHub Pages

El workflow [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) compila el sitio y lo publica automáticamente al actualizar la rama `main`. En GitHub, configura **Settings → Pages → Build and deployment → Source → GitHub Actions**. La compilación genera también `404.html` para que las secciones sigan funcionando al abrir o recargar sus URL.

## Personalización

- Para poner tus perfiles, edita la lista `socialLinks` de `client/src/Portfolio.jsx` y añade la URL correspondiente a cada red.
- La tienda de ejemplo está en `client/src/App.jsx`; la pantalla de pasarela sin pagos se define en `client/src/PortfolioApp.jsx`.
- Las imágenes que se muestran en el portfolio están en `client/public/images/`.
