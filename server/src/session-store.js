import session from 'express-session';
import { prisma } from './db.js';

export class PrismaSessionStore extends session.Store {
  get(sid, callback) {
    prisma.session.findUnique({ where: { sid } })
      .then((record) => {
        if (!record) return callback(null, null);
        if (record.expiresAt <= new Date()) {
          return prisma.session.delete({ where: { sid } })
            .then(() => callback(null, null))
            .catch(callback);
        }
        callback(null, JSON.parse(record.data));
      })
      .catch(callback);
  }

  set(sid, data, callback = () => {}) {
    const expiresAt = data.cookie?.expires ? new Date(data.cookie.expires) : new Date(Date.now() + 86400000);
    prisma.session.upsert({
      where: { sid },
      create: { sid, data: JSON.stringify(data), expiresAt },
      update: { data: JSON.stringify(data), expiresAt },
    }).then(() => callback(null)).catch(callback);
  }

  touch(sid, data, callback = () => {}) {
    const expiresAt = data.cookie?.expires ? new Date(data.cookie.expires) : new Date(Date.now() + 86400000);
    prisma.session.updateMany({ where: { sid }, data: { expiresAt } })
      .then(() => callback(null))
      .catch(callback);
  }

  destroy(sid, callback = () => {}) {
    prisma.session.deleteMany({ where: { sid } })
      .then(() => callback(null))
      .catch(callback);
  }
}
