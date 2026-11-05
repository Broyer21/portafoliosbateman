import { randomBytes, timingSafeEqual } from 'node:crypto';

export function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Inicia sesión para continuar.' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
  }
  next();
}

export function issueCsrfToken(req, res) {
  req.session.csrfToken ??= randomBytes(32).toString('hex');
  res.json({ csrfToken: req.session.csrfToken });
}

export function verifyCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.path === '/api/payments/webhook') {
    return next();
  }
  const supplied = req.get('x-csrf-token');
  const expected = req.session.csrfToken;
  if (!supplied || !expected) return res.status(403).json({ error: 'Token CSRF ausente o inválido.' });
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return res.status(403).json({ error: 'Token CSRF ausente o inválido.' });
  }
  next();
}
