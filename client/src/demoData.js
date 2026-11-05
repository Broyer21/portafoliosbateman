const categories = [
  { id: 'demo-cocina', name: 'Cocina', slug: 'cocina' },
  { id: 'demo-hogar', name: 'Hogar', slug: 'hogar' },
  { id: 'demo-accesorios', name: 'Accesorios', slug: 'accesorios' },
];

const byId = Object.fromEntries(categories.map((category) => [category.slug, category]));

const products = [
  {
    id: 'demo-jarra',
    name: 'Jarra de cerámica Serena',
    slug: 'jarra-ceramica-serena',
    description: 'Jarra artesanal de cerámica esmaltada, hecha para acompañar las comidas de cada día.',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1100&q=85',
    priceCents: 3200,
    stock: 12,
    featured: true,
    category: byId.cocina,
  },
  {
    id: 'demo-cuenco',
    name: 'Cuenco de madera Roble',
    slug: 'cuenco-madera-roble',
    description: 'Cuenco de madera con acabado natural. Cada pieza conserva el carácter único de su veta.',
    imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=1100&q=85',
    priceCents: 2450,
    stock: 18,
    featured: true,
    category: byId.cocina,
  },
  {
    id: 'demo-vela',
    name: 'Vela botánica Alba',
    slug: 'vela-botanica-alba',
    description: 'Vela vegetal con notas suaves de cítricos y hierbas para crear un ambiente tranquilo.',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1100&q=85',
    priceCents: 1800,
    stock: 24,
    featured: true,
    category: byId.hogar,
  },
  {
    id: 'demo-bolso',
    name: 'Bolso de lona Brisa',
    slug: 'bolso-lona-brisa',
    description: 'Bolso amplio de lona de algodón, resistente y cómodo para acompañarte a todas partes.',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1100&q=85',
    priceCents: 3900,
    stock: 9,
    featured: false,
    category: byId.accesorios,
  },
].map((product) => ({ ...product, currency: 'eur', active: true }));

const sorters = {
  featured: (a, b) => Number(b.featured) - Number(a.featured),
  'price-asc': (a, b) => a.priceCents - b.priceCents,
  'price-desc': (a, b) => b.priceCents - a.priceCents,
  name: (a, b) => a.name.localeCompare(b.name, 'es'),
};

/* global URL */
// Responde a las rutas de catálogo con datos de muestra; devuelve undefined si la ruta no es de catálogo.
export function demoResponse(path) {
  const url = new URL(path, 'http://demo.local');
  if (url.pathname === '/api/categories') return categories;
  if (url.pathname === '/api/products') {
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const category = url.searchParams.get('category');
    const sort = sorters[url.searchParams.get('sort')] || sorters.featured;
    return products
      .filter((product) => !search || product.name.toLowerCase().includes(search))
      .filter((product) => !category || product.category.slug === category)
      .sort(sort);
  }
  const detail = url.pathname.match(/^\/api\/products\/(.+)$/);
  if (detail) {
    const product = products.find((item) => item.slug === decodeURIComponent(detail[1]));
    if (!product) throw new Error('No se encontró el producto.');
    return product;
  }
  return undefined;
}
