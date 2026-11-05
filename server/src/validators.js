import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email().max(191).transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(128),
  name: z.string().trim().min(2).max(120),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(191).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export const productQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(120).optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'name']).default('featured'),
});

export const checkoutSchema = z.object({
  idempotencyKey: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().min(1).max(191),
    quantity: z.number().int().min(1).max(20),
  })).min(1).max(50),
  address: z.object({
    recipient: z.string().trim().min(2).max(120),
    line1: z.string().trim().min(3).max(180),
    line2: z.string().trim().max(180).optional(),
    city: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().min(3).max(20),
    country: z.string().trim().length(2).transform((value) => value.toUpperCase()),
    phone: z.string().trim().max(30).optional(),
  }),
});

export const addressSchema = z.object({
  recipient: z.string().trim().min(2).max(120),
  line1: z.string().trim().min(3).max(180),
  line2: z.string().trim().max(180).optional(),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  phone: z.string().trim().max(30).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const productMutationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(10000),
  imageUrl: z.string().url().max(2048),
  priceCents: z.number().int().min(1).max(100000000),
  stock: z.number().int().min(0).max(1000000),
  categoryId: z.string().min(1).max(191),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});
