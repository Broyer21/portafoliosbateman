import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Eye, Heart, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { useCart } from './CartContext.jsx';
import { money, QuantityControl } from './components.jsx';

export const FREE_SHIPPING_CENTS = 5000;
const WISHLIST_KEY = 'tienda-ejemplo-favoritos';

export function useWishlist() {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
  });
  function toggle(id) {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      return next;
    });
  }
  return { ids, toggle };
}

function useEscape(onClose, active) {
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, active]);
}

export function ProductSkeletons() {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="skeleton-card" key={index}><div className="skeleton-photo" /><div className="skeleton-line" /><div className="skeleton-line short" /></div>
      ))}
    </div>
  );
}

function StockBadge({ stock }) {
  if (stock < 1) return <span className="sold-out">Agotado</span>;
  if (stock <= 5) return <span className="stock-badge">Últimas {stock}</span>;
  return null;
}

export function ShopCard({ product, onAdd, onQuickView, liked, onLike, index }) {
  function tilt(event) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    event.currentTarget.style.setProperty('--tilt-x', `${(-y * 7).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${(x * 9).toFixed(2)}deg`);
  }
  function reset(event) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  }
  return (
    <article className="product-card shop-card" style={{ animationDelay: `${index * 60}ms` }} onMouseMove={tilt} onMouseLeave={reset}>
      <div className="photo-wrap">
        <Link className="product-photo" to={`/producto/${product.slug}`}>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        <StockBadge stock={product.stock} />
        <span className="product-arrow"><ArrowUpRight size={17} /></span>
      </Link>
      <button type="button" className={`like-button ${liked ? 'is-liked' : ''}`} aria-pressed={liked} aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'} onClick={() => onLike(product.id)}><Heart size={17} /></button>
      <button type="button" className="quick-view-button" onClick={() => onQuickView(product)}><Eye size={15} /> Vista rápida</button>
      </div>
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

export function QuickView({ product, onClose, onAdd, liked, onLike }) {
  useEscape(onClose, Boolean(product));
  if (!product) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="quick-view" role="dialog" aria-modal="true" aria-label={product.name} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="overlay-close" aria-label="Cerrar" onClick={onClose}><X size={18} /></button>
        <div className="quick-view-image"><img src={product.imageUrl} alt={product.name} /></div>
        <div className="quick-view-copy">
          <p className="eyebrow">{product.category?.name}</p>
          <h2>{product.name}</h2>
          <p className="detail-price">{money(product.priceCents, product.currency)}</p>
          <p className="detail-description">{product.description}</p>
          <p className={`stock-message ${product.stock < 1 ? 'out-of-stock' : ''}`}>{product.stock < 1 ? 'Agotado temporalmente' : product.stock <= 5 ? `Solo quedan ${product.stock} unidades` : 'Disponible para envío'}</p>
          <div className="quick-view-actions">
            <button className="button button-dark" disabled={product.stock < 1} onClick={() => { onAdd(product); onClose(); }}>Añadir a la bolsa <ArrowRight size={16} /></button>
            <button type="button" className={`like-button static ${liked ? 'is-liked' : ''}`} aria-pressed={liked} aria-label="Favorito" onClick={() => onLike(product.id)}><Heart size={17} /></button>
          </div>
          <Link className="quick-view-link" to={`/producto/${product.slug}`}>Ver ficha completa</Link>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer({ open, onClose }) {
  const cart = useCart();
  useEscape(onClose, open);
  const missing = Math.max(0, FREE_SHIPPING_CENTS - cart.subtotalCents);
  const progress = Math.min(100, (cart.subtotalCents / FREE_SHIPPING_CENTS) * 100);
  return (
    <div className={`overlay drawer-overlay ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden={!open}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Tu bolsa" onClick={(event) => event.stopPropagation()}>
        <header><h2><ShoppingBag size={19} /> Tu bolsa <span>({cart.count})</span></h2><button type="button" className="overlay-close static" aria-label="Cerrar" onClick={onClose}><X size={18} /></button></header>
        <div className="shipping-progress">
          <p><Truck size={16} />{cart.count === 0 ? `Envío gratis desde ${money(FREE_SHIPPING_CENTS)}` : missing > 0 ? <>Te faltan <b>{money(missing)}</b> para el envío gratis</> : <b>¡Tienes envío gratis!</b>}</p>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>
        {cart.items.length === 0 ? (
          <div className="drawer-empty"><ShoppingBag size={30} /><p>Tu bolsa está vacía.</p></div>
        ) : (
          <ul className="drawer-items">
            {cart.items.map((item) => (
              <li key={item.id}>
                <img src={item.imageUrl} alt="" />
                <div><strong>{item.name}</strong><span>{money(item.priceCents)}</span><QuantityControl value={item.quantity} maximum={item.stock} onChange={(value) => cart.setQuantity(item.id, value)} /></div>
                <button type="button" className="drawer-remove" aria-label={`Quitar ${item.name}`} onClick={() => cart.remove(item.id)}><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        )}
        <footer>
          <div className="drawer-total"><span>Subtotal</span><strong>{money(cart.subtotalCents)}</strong></div>
          <Link className="button button-dark full-width" to="/carrito" onClick={onClose}>Ver bolsa de muestra <ArrowRight size={16} /></Link>
        </footer>
      </aside>
    </div>
  );
}
