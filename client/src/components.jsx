import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { api } from './api.js';
import { useCart } from './CartContext.jsx';

export function Header({ user, onUserChange }) {
  const { count } = useCart();
  const navigate = useNavigate();

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST' });
      onUserChange(null);
      navigate('/');
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <header className="site-header">
      <Link className="wordmark" to="/catalogo" aria-label="Volver al portfolio">Tienda de ejemplo</Link>
      <nav className="main-nav" aria-label="Navegación principal">
        <NavLink to="/tienda">Productos</NavLink>
        <Link to="/">Portfolio</Link>
      </nav>
      <div className="header-actions">
        {user ? (
          <>
            {user.role === 'ADMIN' && <Link className="admin-link" to="/admin">Admin</Link>}
            <Link className="account-link" to="/cuenta">{user.name.split(' ')[0]}</Link>
            <button className="plain-button logout-button" onClick={logout}>Salir</button>
          </>
        ) : <Link className="account-link" to="/acceso">Entrar</Link>}
        <Link className="cart-link" to="/carrito" aria-label={`Carrito, ${count} artículos`}>
          <ShoppingBag size={18} strokeWidth={1.6} />
          <span>Bolsa</span><span className="cart-count">{count}</span>
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <Link className="wordmark footer-mark" to="/catalogo">Tienda de ejemplo</Link>
      <p>Demostración de catálogo, producto y carrito.</p>
      <span>Productos e imágenes de muestra</span>
    </footer>
  );
}

export function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <Link className="product-photo" to={`/producto/${product.slug}`}>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.stock < 1 && <span className="sold-out">Agotado</span>}
        <span className="product-arrow"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="product-info">
        <div><Link to={`/producto/${product.slug}`} className="product-name">{product.name}</Link><p>{product.category?.name}</p></div>
        <span className="product-price">{money(product.priceCents)}</span>
      </div>
      <button className="quick-add" disabled={product.stock < 1} onClick={() => onAdd(product)}>
        {product.stock < 1 ? 'Agotado' : 'Añadir a la bolsa'} <ArrowRight size={15} />
      </button>
    </article>
  );
}

export function QuantityControl({ value, onChange, maximum = 20 }) {
  return (
    <div className="quantity-control">
      <button aria-label="Reducir cantidad" onClick={() => onChange(value - 1)}><Minus size={13} /></button>
      <span>{value}</span>
      <button aria-label="Aumentar cantidad" disabled={value >= maximum} onClick={() => onChange(value + 1)}><Plus size={13} /></button>
    </div>
  );
}

export function CartPage({ user, demo = false }) {
  const cart = useCart();
  const navigate = useNavigate();
  const shipping = cart.subtotalCents >= 5000 ? 0 : 500;

  return (
    <main className="page-shell cart-page">
      <div className="eyebrow">TU SELECCIÓN</div>
      <h1>Tu bolsa<span className="heading-dot">.</span></h1>
      {!cart.items.length ? (
        <div className="empty-state"><ShoppingBag size={28} /><h2>Tu bolsa está esperando</h2><p>Encuentra algo que te acompañe cada día.</p><Link className="button button-dark" to="/tienda">Descubrir la tienda</Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cart.items.map((item) => (
              <article className="cart-line" key={item.id}>
                <Link to={`/producto/${item.slug}`}><img src={item.imageUrl} alt="" /></Link>
                <div className="cart-line-info">
                  <Link className="product-name" to={`/producto/${item.slug}`}>{item.name}</Link>
                  <span>{money(item.priceCents)}</span>
                  <QuantityControl value={item.quantity} maximum={Math.min(item.stock, 20)} onChange={(value) => cart.setQuantity(item.id, value)} />
                </div>
                <div className="cart-line-end"><strong>{money(item.priceCents * item.quantity)}</strong><button className="icon-button" aria-label={`Eliminar ${item.name}`} onClick={() => cart.remove(item.id)}><Trash2 size={17} /></button></div>
              </article>
            ))}
          </div>
          <aside className="summary-card">
            <h2>Resumen</h2>
            <div><span>Subtotal</span><span>{money(cart.subtotalCents)}</span></div>
            <div><span>{demo ? 'Envío de muestra' : 'Envío'}</span><span>{shipping ? money(shipping) : 'Gratis'}</span></div>
            <p className="shipping-note">{demo ? 'Importes solo demostrativos' : <><ArrowDown size={14} /> Envío gratis desde 50 €</>}</p>
            <div className="summary-total"><strong>{demo ? 'Total de muestra' : 'Total'}</strong><strong>{money(cart.subtotalCents + shipping)}</strong></div>
            <button className="button button-dark full-width" onClick={() => navigate(demo ? '/checkout' : user ? '/checkout' : '/acceso?redirect=/checkout')}>{demo ? 'Ver pasarela de muestra' : 'Continuar al pago'} <ArrowRight size={16} /></button>
            <p className="secure-note">{demo ? 'Demostración: no se realizan compras ni pagos.' : 'El precio final y la disponibilidad se verifican de nuevo al confirmar el pedido.'}</p>
          </aside>
        </div>
      )}
    </main>
  );
}

export function money(cents, currency = 'eur') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}
