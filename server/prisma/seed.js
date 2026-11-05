import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const categories = [
  { name: 'Cocina', slug: 'cocina' },
  { name: 'Hogar', slug: 'hogar' },
  { name: 'Accesorios', slug: 'accesorios' },
];

const products = [
  {
    name: 'Jarra de cerámica Serena',
    slug: 'jarra-ceramica-serena',
    description: 'Jarra artesanal de cerámica esmaltada, hecha para acompañar las comidas de cada día.',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1100&q=85',
    priceCents: 3200,
    stock: 12,
    featured: true,
    categorySlug: 'cocina',
  },
  {
    name: 'Cuenco de madera Roble',
    slug: 'cuenco-madera-roble',
    description: 'Cuenco de madera con acabado natural. Cada pieza conserva el carácter único de su veta.',
    imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=1100&q=85',
    priceCents: 2450,
    stock: 18,
    featured: true,
    categorySlug: 'cocina',
  },
  {
    name: 'Vela botánica Alba',
    slug: 'vela-botanica-alba',
    description: 'Vela vegetal con notas suaves de cítricos y hierbas para crear un ambiente tranquilo.',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1100&q=85',
    priceCents: 1800,
    stock: 24,
    featured: true,
    categorySlug: 'hogar',
  },
  {
    name: 'Bolso de lona Brisa',
    slug: 'bolso-lona-brisa',
    description: 'Bolso amplio de lona de algodón, resistente y cómodo para acompañarte a todas partes.',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1100&q=85',
    priceCents: 3900,
    stock: 9,
    featured: false,
    categorySlug: 'accesorios',
  },
];

try {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
  for (const { categorySlug, ...product } of products) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, categoryId: category.id },
      create: { ...product, categoryId: category.id },
    });
  }
  console.log(`Catálogo de demostración cargado: ${products.length} productos ficticios.`);
} finally {
  await prisma.$disconnect();
}
