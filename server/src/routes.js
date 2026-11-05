import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import Stripe from 'stripe';
import { z } from 'zod';
import { config } from './config.js';
import { prisma } from './db.js';
import { requireAdmin, requireAuth } from './middleware.js';
import { calculateSubtotal } from './utils/pricing.js';
import {
  checkoutSchema,
  addressSchema,
  categorySchema,
  loginSchema,
  productMutationSchema,
  productQuerySchema,
  registerSchema,
} from './validators.js';

export const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const stripe = config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : null;
const SHIPPING_CENTS = 500;
const FREE_SHIPPING_FROM_CENTS = 5000;

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const error = new Error('Revisa los datos enviados.');
    error.status = 400;
    error.details = result.error.issues.map(({ path, message }) => ({ field: path.join('.'), message }));
    throw error;
  }
  return result.data;
}

function productView(product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.imageUrl,
    priceCents: product.priceCents,
    currency: product.currency,
    stock: product.stock,
    active: product.active,
    featured: product.featured,
    category: product.category,
  };
}

function orderView(order) {
  return {
    id: order.id,
    status: order.status,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    shippingData: JSON.parse(order.shippingData),
    items: order.items,
    checkoutUrl: order.payment?.checkoutUrl ?? null,
    createdAt: order.createdAt,
  };
}

router.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

router.get('/api/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { products: { some: { active: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

router.get('/api/products', async (req, res) => {
  const query = parse(productQuerySchema, req.query);
  const orderBy = {
    featured: [{ featured: 'desc' }, { createdAt: 'desc' }],
    'price-asc': [{ priceCents: 'asc' }],
    'price-desc': [{ priceCents: 'desc' }],
    name: [{ name: 'asc' }],
  }[query.sort];
  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(query.search ? { name: { contains: query.search } } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy,
  });
  res.json(products.map(productView));
});

router.get('/api/products/:slug', async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, active: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!product) return res.status(404).json({ error: 'No se encontró el producto.' });
  res.json(productView(product));
});

router.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const input = parse(registerSchema, req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash: await bcrypt.hash(input.password, 12) },
      select: { id: true, email: true, name: true, role: true },
    });
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.user = user;
      req.session.csrfToken = randomBytes(32).toString('hex');
      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.status(201).json({ user, csrfToken: req.session.csrfToken });
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const input = parse(loginSchema, req.body);
    const record = await prisma.user.findUnique({ where: { email: input.email } });
    if (!record || !(await bcrypt.compare(input.password, record.passwordHash))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }
    const user = { id: record.id, email: record.email, name: record.name, role: record.role };
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.user = user;
      req.session.csrfToken = randomBytes(32).toString('hex');
      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.json({ user, csrfToken: req.session.csrfToken });
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post('/api/auth/logout', requireAuth, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('tienda.sid');
    res.status(204).end();
  });

  router.post('/api/auth/password-recovery/request', authLimiter, async (req, res, next) => {
    try {
      const input = parse(z.object({ email: z.string().trim().email().max(191).transform((value) => value.toLowerCase()) }), req.body);
      const user = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
      if (user) {
        // Se registra únicamente la solicitud para integrar un proveedor de correo sin revelar si el correo existe.
        console.info('Password recovery requested for userId', user.id);
      }
      res.status(202).json({ message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.' });
    } catch (error) {
      next(error);
    }
  });
});

router.get('/api/auth/me', async (req, res) => {
  if (!req.session.user) return res.json({ user: null });
  const addresses = await prisma.address.findMany({
    where: { userId: req.session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ user: req.session.user, addresses });
});

router.post('/api/addresses', requireAuth, async (req, res, next) => {
  try {
    const address = parse(addressSchema, req.body);
    res.status(201).json(await prisma.address.create({
      data: { ...address, userId: req.session.user.id },
    }));
  } catch (error) {
    next(error);
  }
});

router.delete('/api/addresses/:id', requireAuth, async (req, res) => {
  const result = await prisma.address.deleteMany({
    where: { id: req.params.id, userId: req.session.user.id },
  });
  if (!result.count) return res.status(404).json({ error: 'No se encontró la dirección.' });
  res.status(204).end();
});

router.get('/api/orders', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.session.user.id },
    include: { items: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders.map(orderView));
});

router.post('/api/checkout', requireAuth, async (req, res, next) => {
  try {
    if (!stripe) return res.status(503).json({ error: 'Los pagos aún no están configurados.' });
    const input = parse(checkoutSchema, req.body);
    const grouped = new Map();
    for (const item of input.items) {
      grouped.set(item.productId, (grouped.get(item.productId) ?? 0) + item.quantity);
    }
    const items = [...grouped].map(([productId, quantity]) => ({ productId, quantity }));
    if (items.some((item) => item.quantity > 20)) {
      return res.status(400).json({ error: 'La cantidad solicitada supera el límite por producto.' });
    }

    const existing = await prisma.order.findUnique({
      where: { userId_idempotencyKey: { userId: req.session.user.id, idempotencyKey: input.idempotencyKey } },
      include: { items: true, payment: true },
    });
    if (existing?.payment?.providerSessionId) {
      const session = await stripe.checkout.sessions.retrieve(existing.payment.providerSessionId);
      return res.json({ order: orderView({ ...existing, payment: { ...existing.payment, checkoutUrl: session.url } }) });
    }
    if (existing) return res.status(409).json({ error: 'Este intento de compra ya está siendo procesado.' });

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((item) => item.productId) }, active: true },
      });
      if (products.length !== items.length) {
        const error = new Error('Uno o más productos ya no están disponibles.');
        error.status = 409;
        throw error;
      }
      const byId = new Map(products.map((product) => [product.id, product]));
      const snapshots = items.map((item) => {
        const product = byId.get(item.productId);
        if (product.stock < item.quantity) {
          const error = new Error(`No hay suficientes unidades de ${product.name}.`);
          error.status = 409;
          throw error;
        }
        return {
          product,
          quantity: item.quantity,
          unitPriceCents: product.priceCents,
        };
      });
      for (const item of snapshots) {
        const result = await tx.product.updateMany({
          where: { id: item.product.id, active: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count !== 1) {
          const error = new Error(`El stock de ${item.product.name} acaba de cambiar.`);
          error.status = 409;
          throw error;
        }
      }
      const subtotalCents = calculateSubtotal(snapshots);
      const shippingCents = subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
      return tx.order.create({
        data: {
          userId: req.session.user.id,
          idempotencyKey: input.idempotencyKey,
          currency: config.STORE_CURRENCY,
          subtotalCents,
          shippingCents,
          totalCents: subtotalCents + shippingCents,
          shippingData: JSON.stringify(input.address),
          items: {
            create: snapshots.map(({ product, quantity, unitPriceCents }) => ({
              productId: product.id,
              productName: product.name,
              productImageUrl: product.imageUrl,
              unitPriceCents,
              quantity,
            })),
          },
          payment: { create: { status: 'pending' } },
        },
        include: { items: true },
      });
    }, { isolationLevel: 'Serializable' });

    try {
      const checkout = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: order.currency,
            unit_amount: item.unitPriceCents,
            product_data: { name: item.productName, images: [item.productImageUrl] },
          },
        })).concat(order.shippingCents ? [{
          quantity: 1,
          price_data: {
            currency: order.currency,
            unit_amount: order.shippingCents,
            product_data: { name: 'Envío' },
          },
        }] : []),
        success_url: `${config.CLIENT_ORIGIN}/pedido/exito?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.CLIENT_ORIGIN}/pedido/cancelado`,
        client_reference_id: order.id,
        metadata: { orderId: order.id },
      }, { idempotencyKey: `checkout-${order.id}` });
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { providerSessionId: checkout.id },
      });
      res.status(201).json({ order: { ...orderView({ ...order, payment: null }), checkoutUrl: checkout.url } });
    } catch (error) {
      await prisma.$transaction(async (tx) => {
        await tx.order.updateMany({ where: { id: order.id, status: 'PENDING' }, data: { status: 'CANCELLED' } });
        for (const item of order.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
        await tx.payment.update({ where: { orderId: order.id }, data: { status: 'failed' } });
      });
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

router.get('/api/admin/products', requireAdmin, async (_req, res) => {
  const products = await prisma.product.findMany({
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products.map(productView));
});

router.post('/api/admin/products', requireAdmin, async (req, res, next) => {
  try {
    const input = parse(productMutationSchema, req.body);
    const product = await prisma.product.create({
      data: { ...input, currency: config.STORE_CURRENCY },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    res.status(201).json(productView(product));
  } catch (error) {
    next(error);
  }
});

router.put('/api/admin/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const input = parse(productMutationSchema, req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: input,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    res.json(productView(product));
  } catch (error) {
    next(error);
  }
});

router.get('/api/admin/categories', requireAdmin, async (_req, res) => {
  res.json(await prisma.category.findMany({ orderBy: { name: 'asc' } }));
});

router.post('/api/admin/categories', requireAdmin, async (req, res, next) => {
  try {
    const input = parse(categorySchema, req.body);
    res.status(201).json(await prisma.category.create({ data: input }));
  } catch (error) {
    next(error);
  }
});

router.get('/api/admin/orders', requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true, name: true } }, items: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders.map((order) => ({ ...orderView(order), customer: order.user })));
});

router.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = parse(
      z.object({ status: z.enum(['PROCESSING', 'SHIPPED', 'COMPLETED']) }),
      req.body,
    );
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    const allowed = {
      PAID: ['PROCESSING'],
      PROCESSING: ['SHIPPED'],
      SHIPPED: ['COMPLETED'],
    };
    if (!order || !allowed[order.status]?.includes(status)) {
      return res.status(409).json({ error: 'La transición de estado no está permitida.' });
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status },
      include: { items: true, payment: true },
    });
    res.json(orderView(updated));
  } catch (error) {
    next(error);
  }
});

router.get('/api/admin/summary', requireAdmin, async (_req, res) => {
  const [paidOrders, productCount, lowStock] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] } },
      select: { totalCents: true },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
  ]);
  res.json({
    salesCents: paidOrders.reduce((sum, order) => sum + order.totalCents, 0),
    paidOrderCount: paidOrders.length,
    productCount,
    lowStockCount: lowStock,
  });
});

router.post('/api/payments/webhook', async (req, res, next) => {
  if (!stripe || !config.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'El webhook de pagos no está configurado.' });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'), config.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({ error: 'La firma del webhook no es válida.' });
  }
  try {
    await prisma.$transaction(async (tx) => {
      const seen = await tx.webhookEvent.findUnique({ where: { id: event.id } });
      if (seen) return;
      const supportedEvents = [
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded',
        'checkout.session.expired',
        'checkout.session.async_payment_failed',
      ];
      if (!supportedEvents.includes(event.type)) {
        await tx.webhookEvent.create({ data: { id: event.id, type: event.type } });
        return;
      }
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        const error = new Error('El evento de Stripe no contiene un pedido asociado.');
        error.status = 400;
        throw error;
      }
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order) {
        const error = new Error('El pedido del evento no existe.');
        error.status = 404;
        throw error;
      }
      const payment = await tx.payment.findUnique({ where: { orderId } });
      if (!payment || payment.providerSessionId !== session.id) {
        const error = new Error('La sesión de pago no corresponde al pedido indicado.');
        error.status = 400;
        throw error;
      }
      if (
        ['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)
        && (event.type === 'checkout.session.async_payment_succeeded' || session.payment_status === 'paid')
      ) {
        const updated = await tx.order.updateMany({
          where: { id: order.id, status: 'PENDING' },
          data: { status: 'PAID' },
        });
        if (updated.count) {
        await tx.payment.update({
          where: { orderId },
          data: { status: 'paid', providerPaymentIntent: session.payment_intent ?? null },
        });
        }
      } else if (['checkout.session.expired', 'checkout.session.async_payment_failed'].includes(event.type)) {
        const result = await tx.order.updateMany({
          where: { id: order.id, status: 'PENDING' },
          data: { status: 'CANCELLED' },
        });
        if (result.count) {
          for (const item of order.items) {
            await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
          }
          await tx.payment.update({ where: { orderId }, data: { status: 'failed' } });
        }
      }
      await tx.webhookEvent.create({ data: { id: event.id, type: event.type } });
    });
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});
