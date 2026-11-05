import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Heart, ChevronDown, Gem, Home, LayoutGrid, LockKeyhole, Tag, UtensilsCrossed, PackageCheck, Search, Truck } from 'lucide-react';
import { demoResponse } from './demoData.js';
import { api, clearCsrfToken, jsonRequest } from './api.js';
import { useCart } from './CartContext.jsx';
import { CartPage, Footer, Header, money, ProductCard } from './components.jsx';
import { CartDrawer, ProductSkeletons, QuickView, ShopCard, useWishlist } from './ShopExtras.jsx';
import { PortfolioBubbles, PortfolioFooter, PortfolioHeader, PortfolioOnePage } from './Portfolio.jsx';

function useLoad(path, dependencies = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const dependencyKey = dependencies.join('|');
  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(path).catch((error) => {
      const sample = demoResponse(path);
      if (sample === undefined) throw error;
      return sample;
    }).then((data) => {
      if (active) setState({ data, loading: false, error: '' });
    }).catch((error) => {
      if (active) setState({ data: null, loading: false, error: error.message });
    });
    return () => { active = false; };
  }, [path, dependencyKey]);
  return state;
}

function Loading() {
  return <div className="loading-state"><span className="loader" />Cargando tienda</div>;
}

function ErrorMessage({ children }) {
  return <div className="notice notice-error" role="alert">{children}</div>;
}

const categoryIcons = { cocina: UtensilsCrossed, hogar: Home, accesorios: Gem };

function CategoryPicker({ categories, value, onChange }) {
  if (!categories?.length) return null;
  const tiles = [{ id: 'all', slug: '', name: 'Todo', Icon: LayoutGrid }, ...categories.map((item) => ({ ...item, Icon: categoryIcons[item.slug] || Tag }))];
  return (
    <nav className="category-picker" aria-label="Categorías">
      {tiles.map(({ id, slug, name, Icon }, index) => (
        <button key={id} type="button" className={`category-tile ${value === slug ? 'is-active' : ''}`} aria-pressed={value === slug} style={{ animationDelay: `${index * 70}ms` }} onClick={() => onChange(slug)}>
          <span className="category-icon"><Icon size={24} /></span>
          <span className="category-name">{name}</span>
        </button>
      ))}
    </nav>
  );
}

function ShopPage({ onAdd }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('featured');
  const [onlyLiked, setOnlyLiked] = useState(false);
  const [quick, setQuick] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const wishlist = useWishlist();
  const cart = useCart();
  const query = new URLSearchParams({ sort });
  if (search.trim()) query.set('search', search.trim());
  if (category) query.set('category', category);
  const { data: products, loading, error } = useLoad(`/api/products?${query}`, [search, category, sort]);
  const { data: categories } = useLoad('/api/categories');
  const visible = onlyLiked ? products?.filter((product) => wishlist.ids.includes(product.id)) : products;
  const addAndOpen = (product) => { onAdd(product); setDrawer(true); };

  return (
    <main className="page-shell shop-page">
      <section className="shop-hero">
        <div className="shop-hero-copy">
          <p className="eyebrow">COLECCIÓN OTOÑO · 2026</p>
          <h1>Objetos hechos para <em>quedarse</em><span className="heading-dot">.</span></h1>
          <p>Una colección consciente de cerámica, madera y textiles, pensada para durar más allá de una temporada.</p>
          <a className="button button-dark" href="#coleccion" onClick={(event) => { event.preventDefault(); document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' }); }}>Explorar la colección <ArrowRight size={16} /></a>
        </div>
        <div className="shop-hero-art" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1100&q=85" alt="" />
          <span className="hero-chip chip-a">Hecho a mano</span>
          <span className="hero-chip chip-b">Envío gratis desde 50 €</span>
        </div>
      </section>
      <div className="marquee" aria-hidden="true"><div className="marquee-track">{[0, 1].map((n) => <div key={n}><span>Envío gratis desde 50 €</span><span>Devoluciones en 30 días</span><span>Pago seguro con Stripe</span><span>Piezas de edición limitada</span><span>Embalaje sin plástico</span></div>)}</div></div>
      <div id="coleccion" className="shop-anchor" />
      <CategoryPicker categories={categories} value={category} onChange={setCategory} />
      <div className="shop-toolbar">
        <label className="search-box"><Search size={17} /><input aria-label="Buscar productos" placeholder="Buscar un objeto..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="shop-selects">
          <button type="button" className={`filter-chip ${onlyLiked ? 'is-active' : ''}`} aria-pressed={onlyLiked} onClick={() => setOnlyLiked(!onlyLiked)}><Heart size={15} /> Favoritos{wishlist.ids.length > 0 && <span>{wishlist.ids.length}</span>}</button>
          <button type="button" className="filter-chip" onClick={() => setDrawer(true)}>Bolsa{cart.count > 0 && <span>{cart.count}</span>}</button>
          <label><span className="visually-hidden">Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Destacados</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="name">Nombre</option></select><ChevronDown size={14} /></label>
        </div>
      </div>
      {loading ? <ProductSkeletons /> : error ? <ErrorMessage>{error}</ErrorMessage> : visible?.length ? (
        <><p className="results-count">{visible.length} {visible.length === 1 ? 'objeto' : 'objetos'}</p><div className="product-grid">{visible.map((product, index) => <ShopCard key={product.id} index={index} product={product} onAdd={addAndOpen} onQuickView={setQuick} liked={wishlist.ids.includes(product.id)} onLike={wishlist.toggle} />)}</div></>
      ) : <div className="empty-state shop-empty"><Search size={25} /><h2>No encontramos ese objeto</h2><p>Prueba otra búsqueda o cambia los filtros.</p></div>}
      <QuickView product={quick} onClose={() => setQuick(null)} onAdd={addAndOpen} liked={quick ? wishlist.ids.includes(quick.id) : false} onLike={wishlist.toggle} />
      <CartDrawer open={drawer} onClose={() => setDrawer(false)} />
    </main>
  );
}

function ProductPage({ onAdd }) {
  const { slug } = useParams();
  const { data: product, loading, error } = useLoad(`/api/products/${encodeURIComponent(slug)}`, [slug]);
  if (loading) return <Loading />;
  if (error) return <main className="page-shell"><ErrorMessage>{error}</ErrorMessage><Link to="/tienda">Volver a la tienda</Link></main>;
  return (
    <main className="page-shell product-detail">
      <div className="breadcrumb"><Link to="/">Inicio</Link><span>/</span><Link to="/tienda">Tienda</Link><span>/</span><span>{product.name}</span></div>
      <div className="product-detail-grid"><div className="detail-image"><img src={product.imageUrl} alt={product.name} /></div><div className="detail-copy">
        <p className="eyebrow">{product.category?.name}</p><h1>{product.name}<span className="heading-dot">.</span></h1><p className="detail-price">{money(product.priceCents, product.currency)}</p><p className="detail-description">{product.description}</p>
        <p className={`stock-message ${product.stock < 1 ? 'out-of-stock' : ''}`}>{product.stock < 1 ? 'Agotado temporalmente' : product.stock <= 5 ? `Solo quedan ${product.stock} unidades` : 'Disponible para envío'}</p>
        <button className="button button-dark full-width" disabled={product.stock < 1} onClick={() => onAdd(product)}>{product.stock < 1 ? 'Agotado' : 'Añadir a la bolsa'} <ArrowRight size={16} /></button>
        <div className="product-promises"><div><Truck size={17} /><span>Envío gratis desde 50 €</span></div><div><LockKeyhole size={17} /><span>Pago protegido con Stripe</span></div></div>
      </div></div>
    </main>
  );
}

function AccessPage({ onUserChange }) {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const redirect = searchParams.get('redirect');
  const destination = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/cuenta';

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await api(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, jsonRequest('POST', form));
      clearCsrfToken();
      if (response.csrfToken) {
        const csrf = await api('/api/csrf');
        if (!csrf.csrfToken) throw new Error('No se pudo actualizar la sesión segura.');
      }
      onUserChange(response.user);
      navigate(destination);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="access-page">
      <section className="access-card">
        <p className="eyebrow">{mode === 'login' ? 'QUÉ BUENO VERTE' : 'EMPECEMOS POR AQUÍ'}</p>
        <h1>{mode === 'login' ? 'Hola de nuevo' : 'Crear una cuenta'}<span className="heading-dot">.</span></h1>
        <p className="access-lead">{mode === 'login' ? 'Accede a tu cuenta para consultar tus pedidos.' : 'Guarda tus direcciones y sigue tus pedidos fácilmente.'}</p>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form className="form-stack" onSubmit={submit}>
          {mode === 'register' && <Field label="Nombre" name="name" value={form.name} onChange={setForm} required minLength={2} />}
          <Field label="Correo electrónico" name="email" type="email" value={form.email} onChange={setForm} required />
          <Field label="Contraseña" name="password" type="password" value={form.password} onChange={setForm} required minLength={mode === 'register' ? 10 : 1} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          {mode === 'register' && <p className="field-hint">Usa al menos 10 caracteres.</p>}
          <button className="button button-dark full-width" disabled={busy}>{busy ? 'Un momento…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} <ArrowRight size={16} /></button>
        </form>
        <p className="switch-auth">{mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Regístrate' : 'Inicia sesión'}</button></p>
        <p className="password-note">La recuperación de contraseña estará disponible cuando se configure el envío de correo.</p>
      </section>
    </main>
  );
}

function Field({ label, name, value, onChange, type = 'text', ...props }) {
  return <label className="form-field"><span>{label}</span><input name={name} type={type} value={value} onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))} {...props} /></label>;
}

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ recipient: '', line1: '', line2: '', city: '', postalCode: '', country: 'ES', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const shipping = cart.subtotalCents >= 5000 ? 0 : 500;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await api('/api/checkout', jsonRequest('POST', {
        idempotencyKey: crypto.randomUUID(),
        items: cart.items.map(({ id, quantity }) => ({ productId: id, quantity })),
        address: form,
      }));
      if (!result.order.checkoutUrl) throw new Error('Stripe no devolvió una URL de pago.');
      window.location.assign(result.order.checkoutUrl);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  }

  if (!cart.items.length) return <Navigate to="/carrito" replace />;
  return (
    <main className="page-shell checkout-page">
      <p className="eyebrow">ÚLTIMO PASO</p><h1>Detalles de envío<span className="heading-dot">.</span></h1>
      <div className="checkout-layout">
        <form className="form-stack checkout-form" onSubmit={submit}>
          <h2>¿A dónde lo enviamos?</h2>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <div className="form-grid"><Field label="Nombre completo" name="recipient" value={form.recipient} onChange={setForm} required /><Field label="Teléfono (opcional)" name="phone" value={form.phone} onChange={setForm} /></div>
          <Field label="Dirección" name="line1" value={form.line1} onChange={setForm} required />
          <Field label="Piso, puerta (opcional)" name="line2" value={form.line2} onChange={setForm} />
          <div className="form-grid"><Field label="Ciudad" name="city" value={form.city} onChange={setForm} required /><Field label="Código postal" name="postalCode" value={form.postalCode} onChange={setForm} required /></div>
          <label className="form-field"><span>País</span><select name="country" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}><option value="ES">España</option><option value="FR">Francia</option><option value="PT">Portugal</option><option value="DE">Alemania</option></select></label>
          <button className="button button-dark full-width" disabled={busy}>{busy ? 'Preparando pago…' : 'Ir al pago seguro'} <LockKeyhole size={16} /></button>
          <p className="secure-note">El pago se completa en Stripe. Tu tarjeta no pasa ni se almacena en la Tienda de ejemplo.</p>
        </form>
        <aside className="summary-card checkout-summary"><h2>Tu pedido</h2>{cart.items.map((item) => <div className="checkout-item" key={item.id}><span>{item.name} × {item.quantity}</span><span>{money(item.priceCents * item.quantity)}</span></div>)}<div><span>Subtotal</span><span>{money(cart.subtotalCents)}</span></div><div><span>Envío</span><span>{shipping ? money(shipping) : 'Gratis'}</span></div><div className="summary-total"><strong>Total estimado</strong><strong>{money(cart.subtotalCents + shipping)}</strong></div></aside>
      </div>
    </main>
  );
}

function OrdersPage({ user }) {
  const { data: orders, loading, error } = useLoad('/api/orders');
  if (!user) return <Navigate to="/acceso?redirect=/pedidos" replace />;
  const labels = { PENDING: 'Pendiente de pago', PAID: 'Pagado', PROCESSING: 'Preparando', SHIPPED: 'Enviado', COMPLETED: 'Completado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado' };
  return (
    <main className="page-shell orders-page"><p className="eyebrow">TU HISTORIAL</p><h1>Tus pedidos<span className="heading-dot">.</span></h1>
      {loading ? <Loading /> : error ? <ErrorMessage>{error}</ErrorMessage> : orders?.length ? <div className="order-list">{orders.map((order) => (
        <article className="order-card" key={order.id}><div className="order-header"><div><span className="eyebrow">PEDIDO CC-{order.id.slice(-7).toUpperCase()}</span><p>{new Date(order.createdAt).toLocaleDateString('es-ES')}</p></div><span className={`status-pill status-${order.status.toLowerCase()}`}>{labels[order.status]}</span></div><div className="order-items">{order.items.map((item) => <div key={item.id}><img src={item.productImageUrl} alt="" /><span>{item.productName} · {item.quantity} ud.</span><strong>{money(item.unitPriceCents * item.quantity, order.currency)}</strong></div>)}</div><div className="order-total"><span>Total</span><strong>{money(order.totalCents, order.currency)}</strong></div></article>
      ))}</div> : <div className="empty-state"><PackageCheck size={28} /><h2>Todavía no hay pedidos</h2><p>Cuando encuentres algo especial, podrás seguirlo desde aquí.</p><Link className="button button-dark" to="/tienda">Ver la tienda</Link></div>}
    </main>
  );
}

function AccountPage({ user, onUserChange }) {
  const [refresh, setRefresh] = useState(0);
  const { data, loading, error } = useLoad('/api/auth/me', [refresh]);
  const [form, setForm] = useState({ recipient: user?.name || '', line1: '', line2: '', city: '', postalCode: '', country: 'ES', phone: '' });
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  if (!user) return <Navigate to="/acceso?redirect=/cuenta" replace />;

  async function addAddress(event) {
    event.preventDefault();
    setFormError('');
    setNotice('');
    try {
      await api('/api/addresses', jsonRequest('POST', form));
      setNotice('Dirección guardada.');
      setRefresh((value) => value + 1);
    } catch (requestError) {
      setFormError(requestError.message);
    }
  }

  async function removeAddress(id) {
    try {
      await api(`/api/addresses/${id}`, { method: 'DELETE' });
      setRefresh((value) => value + 1);
    } catch (requestError) {
      setFormError(requestError.message);
    }
  }

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST' });
      onUserChange(null);
    } catch (requestError) {
      setFormError(requestError.message);
    }
  }

  return <main className="page-shell account-page"><p className="eyebrow">TU ESPACIO</p><h1>Hola, {user.name.split(' ')[0]}<span className="heading-dot">.</span></h1>
    <div className="account-grid"><section className="account-panel"><div className="panel-heading"><div><h2>Direcciones</h2><p>Guarda tus direcciones habituales.</p></div></div>
      {loading ? <Loading /> : error ? <ErrorMessage>{error}</ErrorMessage> : <div className="address-list">{data?.addresses?.map((address) => <article key={address.id}><strong>{address.recipient}</strong><p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.postalCode} {address.city}, {address.country}</p><button className="text-button" onClick={() => removeAddress(address.id)}>Eliminar</button></article>)}</div>}
      {formError && <ErrorMessage>{formError}</ErrorMessage>}{notice && <p className="notice notice-success">{notice}</p>}
      <form className="form-stack address-form" onSubmit={addAddress}><h3>Añadir una dirección</h3><Field label="Nombre completo" name="recipient" value={form.recipient} onChange={setForm} required /><Field label="Dirección" name="line1" value={form.line1} onChange={setForm} required /><div className="form-grid"><Field label="Ciudad" name="city" value={form.city} onChange={setForm} required /><Field label="Código postal" name="postalCode" value={form.postalCode} onChange={setForm} required /></div><button className="button button-outline">Guardar dirección</button></form>
    </section><section className="account-panel account-shortcuts"><h2>Tu cuenta</h2><p>{user.email}</p><Link to="/pedidos" className="account-shortcut"><PackageCheck size={18} /> Ver mis pedidos <ArrowRight size={15} /></Link><button className="text-button signout-button" onClick={logout}>Cerrar sesión</button></section></div>
  </main>;
}

function PaymentResultPage({ success }) {
  const { data: orders, loading } = useLoad('/api/orders');
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const order = orders?.find((item) => item.status === 'PAID' && sessionId);
  return <main className="result-page"><div className="result-icon">{success ? <Check size={26} /> : <ArrowRight size={24} />}</div><p className="eyebrow">{success ? 'GRACIAS POR TU PEDIDO' : 'PAGO NO COMPLETADO'}</p><h1>{success ? 'Estamos preparando algo bonito' : 'Tu bolsa te espera'}<span className="heading-dot">.</span></h1><p>{success ? loading ? 'Consultando la confirmación segura del pago…' : order ? 'Tu pago está confirmado. Gracias por visitar la Tienda de ejemplo.' : 'La página de regreso no confirma el pago. El pedido se actualizará cuando Stripe notifique el pago verificado.' : 'No se ha confirmado ningún pago. Si el checkout sigue abierto, puedes continuar desde Stripe.'}</p><div className="result-actions">{success && <Link className="button button-outline" to="/pedidos">Ver mis pedidos</Link>}<Link className="button button-dark" to="/tienda">Volver a la tienda <ArrowRight size={16} /></Link></div></main>;
}

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });

  async function load() {
    try {
      const [productData, categoryData, orderData, summaryData] = await Promise.all([
        api('/api/admin/products'), api('/api/admin/categories'), api('/api/admin/orders'), api('/api/admin/summary'),
      ]);
      setProducts(productData);
      setCategories(categoryData);
      setOrders(orderData);
      setSummary(summaryData);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveProduct(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const input = {
      ...productForm,
      priceCents: Math.round(Number(productForm.price) * 100),
      stock: Number(productForm.stock),
    };
    delete input.price;
    try {
      await api(editingId ? `/api/admin/products/${editingId}` : '/api/admin/products', jsonRequest(editingId ? 'PUT' : 'POST', input));
      setEditingId(null);
      setProductForm(emptyProduct());
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setProductForm({
      name: product.name, slug: product.slug, description: product.description,
      imageUrl: product.imageUrl, price: (product.priceCents / 100).toFixed(2),
      stock: product.stock, categoryId: product.category.id,
      active: product.active ?? true, featured: product.featured,
    });
    document.querySelector('.admin-product-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function saveCategory(event) {
    event.preventDefault();
    try {
      await api('/api/admin/categories', jsonRequest('POST', categoryForm));
      setCategoryForm({ name: '', slug: '' });
      await load();
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function updateStatus(order, status) {
    try {
      await api(`/api/admin/orders/${order.id}/status`, jsonRequest('PATCH', { status }));
      await load();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return <main className="page-shell admin-page"><p className="eyebrow">GESTIÓN INTERNA</p><h1>Administración<span className="heading-dot">.</span></h1>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {summary && <div className="admin-metrics"><div><span>Ventas confirmadas</span><strong>{money(summary.salesCents)}</strong></div><div><span>Pedidos pagados</span><strong>{summary.paidOrderCount}</strong></div><div><span>Productos activos</span><strong>{summary.productCount}</strong></div><div><span>Stock bajo</span><strong>{summary.lowStockCount}</strong></div></div>}
    <section className="admin-section"><div className="section-heading compact"><div><p className="eyebrow">CATÁLOGO</p><h2>Productos</h2></div></div>
      <form className="admin-product-form admin-form" onSubmit={saveProduct}><h3>{editingId ? 'Editar producto' : 'Añadir producto'}</h3><div className="form-grid"><Field label="Nombre" name="name" value={productForm.name} onChange={setProductForm} required /><Field label="Slug" name="slug" value={productForm.slug} onChange={setProductForm} required /></div><label className="form-field"><span>Descripción</span><textarea name="description" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} required minLength={10} /></label><div className="form-grid"><Field label="URL de imagen" name="imageUrl" type="url" value={productForm.imageUrl} onChange={setProductForm} required /><Field label="Precio (€)" name="price" type="number" value={productForm.price} onChange={setProductForm} required min="0.01" step="0.01" /></div><div className="form-grid"><Field label="Stock" name="stock" type="number" value={productForm.stock} onChange={setProductForm} required min="0" step="1" /><label className="form-field"><span>Categoría</span><select name="categoryId" value={productForm.categoryId} onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))} required><option value="">Elige una categoría</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label></div><div className="check-row"><label><input type="checkbox" checked={productForm.featured} onChange={(event) => setProductForm((current) => ({ ...current, featured: event.target.checked }))} /> Destacado</label><label><input type="checkbox" checked={productForm.active} onChange={(event) => setProductForm((current) => ({ ...current, active: event.target.checked }))} /> Activo en tienda</label></div><div className="form-actions"><button className="button button-dark" disabled={busy || !categories.length}>{busy ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear producto'}</button>{editingId && <button type="button" className="button button-outline" onClick={() => { setEditingId(null); setProductForm(emptyProduct()); }}>Cancelar</button>}</div></form>
      <div className="admin-table-wrap"><table><thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-name"><img src={product.imageUrl} alt="" /><span>{product.name}</span></div></td><td>{money(product.priceCents)}</td><td>{product.stock}</td><td><span className={`status-pill ${product.active ? 'status-paid' : 'status-cancelled'}`}>{product.active ? 'Activo' : 'Oculto'}</span></td><td><button className="text-button" onClick={() => editProduct(product)}>Editar</button></td></tr>)}</tbody></table></div>
    </section>
    <section className="admin-section"><div className="section-heading compact"><div><p className="eyebrow">ORGANIZACIÓN</p><h2>Categorías</h2></div></div><div className="category-manage"><div className="category-chips">{categories.map((category) => <span key={category.id}>{category.name}</span>)}</div><form className="category-form" onSubmit={saveCategory}><Field label="Nombre" name="name" value={categoryForm.name} onChange={setCategoryForm} required /><Field label="Slug (minúsculas y guiones)" name="slug" value={categoryForm.slug} onChange={setCategoryForm} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /><button className="button button-outline">Añadir categoría</button></form></div></section>
    <section className="admin-section"><div className="section-heading compact"><div><p className="eyebrow">OPERACIONES</p><h2>Pedidos</h2></div></div><div className="admin-table-wrap"><table><thead><tr><th>Número</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>CC-{order.id.slice(-7).toUpperCase()}</td><td>{order.customer.name}<br /><small>{order.customer.email}</small></td><td>{new Date(order.createdAt).toLocaleDateString('es-ES')}</td><td>{money(order.totalCents, order.currency)}</td><td>{order.status}</td><td>{order.status === 'PAID' && <button className="text-button" onClick={() => updateStatus(order, 'PROCESSING')}>Preparar</button>}{order.status === 'PROCESSING' && <button className="text-button" onClick={() => updateStatus(order, 'SHIPPED')}>Marcar enviado</button>}{order.status === 'SHIPPED' && <button className="text-button" onClick={() => updateStatus(order, 'COMPLETED')}>Completar</button>}</td></tr>)}</tbody></table></div></section>
  </main>;
}

function emptyProduct() {
  return { name: '', slug: '', description: '', imageUrl: '', price: '', stock: 0, categoryId: '', active: true, featured: false };
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const cart = useCart();
  const [toast, setToast] = useState('');
  const { pathname } = useLocation();
  const portfolioPaths = ['/', '/catalogo', '/servicios'];
  const isPortfolioPage = portfolioPaths.includes(pathname);

  useEffect(() => {
    if (isPortfolioPage) {
      setAuthReady(true);
      return undefined;
    }
    setAuthReady(false);
    api('/api/auth/me').then((result) => setUser(result.user)).catch(() => setUser(null)).finally(() => setAuthReady(true));
    return undefined;
  }, [isPortfolioPage]);

  function addToCart(product) {
    if (product.stock < 1) return;
    cart.add(product);
    setToast(`${product.name} añadido a la bolsa`);
    window.setTimeout(() => setToast(''), 2400);
  }

  if (!authReady) return <Loading />;
  return <>
    {isPortfolioPage ? <><PortfolioBubbles /><PortfolioHeader /></> : <Header user={user} onUserChange={setUser} />}
    <Routes>
      <Route path="/" element={<PortfolioOnePage />} />
      <Route path="/catalogo" element={<PortfolioOnePage />} />
      <Route path="/servicios" element={<PortfolioOnePage />} />
      <Route path="/tienda" element={<ShopPage onAdd={addToCart} />} />
      <Route path="/producto/:slug" element={<ProductPage onAdd={addToCart} />} />
      <Route path="/carrito" element={<CartPage user={user} />} />
      <Route path="/acceso" element={<AccessPage onUserChange={setUser} />} />
      <Route path="/checkout" element={user ? <CheckoutPage /> : <Navigate to="/acceso?redirect=/checkout" replace />} />
      <Route path="/cuenta" element={<AccountPage user={user} onUserChange={setUser} />} />
      <Route path="/pedidos" element={<OrdersPage user={user} />} />
      <Route path="/pedido/exito" element={<PaymentResultPage success />} />
      <Route path="/pedido/cancelado" element={<PaymentResultPage success={false} />} />
      <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminPage /> : user ? <main className="page-shell"><ErrorMessage>No tienes acceso a esta página.</ErrorMessage></main> : <Navigate to="/acceso?redirect=/admin" replace />} />
      <Route path="*" element={<main className="page-shell not-found"><p className="eyebrow">404 — PÁGINA NO ENCONTRADA</p><h1>Nos hemos perdido<span className="heading-dot">.</span></h1><Link className="button button-dark" to="/">Volver al inicio</Link></main>} />
    </Routes>
    {toast && <div className="toast" role="status">{toast}</div>}
    {isPortfolioPage ? <PortfolioFooter /> : <Footer />}
  </>;
}
