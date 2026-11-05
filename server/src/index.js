import { app, closeDatabase } from './app.js';
import { config } from './config.js';

const server = app.listen(config.PORT, () => {
  console.log(`API lista en http://localhost:${config.PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  });
}
