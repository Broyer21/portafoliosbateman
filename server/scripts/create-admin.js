import 'dotenv/config';
import { timingSafeEqual } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
if (!expectedToken || expectedToken.length < 24) {
  throw new Error('Define ADMIN_BOOTSTRAP_TOKEN (mínimo 24 caracteres) en .env antes de crear el administrador.');
}

async function readSecret(prompt) {
  if (!stdin.isTTY || !stdin.setRawMode) {
    throw new Error('Ejecuta este comando desde una terminal interactiva para introducir secretos de forma segura.');
  }
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let value = '';
    const onData = (character) => {
      if (character === '\u0003') {
        stdin.setRawMode(false);
        reject(new Error('Operación cancelada.'));
      } else if (character === '\r' || character === '\n') {
        stdin.setRawMode(false);
        stdout.write('\n');
        stdin.off('data', onData);
        resolve(value);
      } else if (character === '\u007f' || character === '\b') {
        value = value.slice(0, -1);
      } else {
        value += character;
      }
    };
    stdin.on('data', onData);
  });
}

const prisma = new PrismaClient();
try {
  const enteredToken = await readSecret('Token de inicialización: ');
  const expected = Buffer.from(expectedToken);
  const supplied = Buffer.from(enteredToken);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new Error('Token de inicialización incorrecto.');
  }
  if (await prisma.user.count({ where: { role: 'ADMIN' } })) {
    throw new Error('Ya existe un administrador. El inicializador solo se puede usar una vez.');
  }
  const email = (await readSecret('Correo del administrador: ')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('El correo no es válido.');
  const name = (await readSecret('Nombre del administrador: ')).trim();
  const password = await readSecret('Contraseña (mínimo 12 caracteres): ');
  if (password.length < 12 || password.length > 128) throw new Error('La contraseña debe tener entre 12 y 128 caracteres.');
  await prisma.user.create({
    data: { email, name, passwordHash: await bcrypt.hash(password, 12), role: 'ADMIN' },
  });
  console.log('Administrador creado. Elimina ADMIN_BOOTSTRAP_TOKEN de .env.');
} finally {
  await prisma.$disconnect();
}
