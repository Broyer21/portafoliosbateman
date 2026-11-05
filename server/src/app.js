import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config.js';
import { prisma } from './db.js';
import { issueCsrfToken, verifyCsrf } from './middleware.js';
import { router } from './routes.js';
import { PrismaSessionStore } from './session-store.js';

export const app = express();
app.set('trust proxy', config.NODE_ENV === 'production' ? 1 : false);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.CLIENT_ORIGIN, credentials: true }));
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }));
app.use(express.json({ limit: '100kb' }));
app.use(session({
  name: 'tienda.sid',
  secret: config.SESSION_SECRET,
  store: new PrismaSessionStore(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }));
app.get('/api/csrf', issueCsrfToken);
app.use(verifyCsrf);
app.use(router);

app.use((req, res) => res.status(404).json({ error: `No existe la ruta ${req.method} ${req.path}.` }));

app.use((error, _req, res, _next) => {
  if (error?.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos.' });
  }
  if (error?.code === 'P2025') {
    return res.status(404).json({ error: 'No se encontró el registro.' });
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo JSON no es válido.' });
  }
  if (error?.status && error.status < 500) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }
  console.error('Error al procesar la solicitud:', error);
  res.status(500).json({ error: 'No se pudo completar la solicitud. Inténtalo de nuevo.' });
});

export async function closeDatabase() {
  await prisma.$disconnect();
}
