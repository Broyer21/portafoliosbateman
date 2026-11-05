import { ArrowLeft, ArrowRight, LockKeyhole, ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { CartProvider, useCart } from './CartContext.jsx';
import { CartPage, money } from './components.jsx';
import { ProductPage, ShopPage } from './App.jsx';
import BusinessCardDemo from './BusinessCardDemo.jsx';
import { PortfolioBubbles, PortfolioFooter, PortfolioHeader, PortfolioOnePage } from './Portfolio.jsx';

function PortfolioPage() {
  return (
    <>
      <PortfolioBubbles />
      <PortfolioHeader />
      <PortfolioOnePage />
      <PortfolioFooter />
    </>
  );
}

function BusinessCardDemoPage() {
  return (
    <>
      <PortfolioBubbles />
      <PortfolioHeader />
      <BusinessCardDemo />
      <PortfolioFooter />
    </>
  );
}

function ShopDemoShell({ children }) {
  const cart = useCart();
  return (
    <>
      <header className="site-header shop-demo-header">
        <Link className="wordmark" to="/tienda">Tienda de ejemplo</Link>
        <nav className="main-nav" aria-label="Navegación de la tienda de ejemplo">
          <Link to="/tienda">Productos</Link>
          <Link to="/proyectos">Portfolio</Link>
        </nav>
        <div className="header-actions">
          <Link className="cart-link" to="/carrito" aria-label={`Bolsa de demostración, ${cart.count} artículos`}>
            <ShoppingBag size={18} strokeWidth={1.6} />
            <span>Bolsa</span><span className="cart-count">{cart.count}</span>
          </Link>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <Link className="wordmark footer-mark" to="/proyectos">Portfolio</Link>
        <p>Maqueta de tienda para mostrar una interfaz de ejemplo.</p>
        <span>No se realizan compras ni pagos.</span>
      </footer>
    </>
  );
}

function DemoProductsPage() {
  const cart = useCart();
  return <ShopPage onAdd={cart.add} />;
}

function DemoProductPage() {
  const cart = useCart();
  return <ProductPage onAdd={cart.add} />;
}

function DemoCheckoutPage() {
  const cart = useCart();
  const shipping = cart.subtotalCents >= 5000 ? 0 : 500;

  if (!cart.items.length) return <Navigate to="/carrito" replace />;
  return (
    <main className="page-shell checkout-page demo-checkout">
      <Link className="demo-checkout-back" to="/carrito"><ArrowLeft size={16} /> Volver a la bolsa</Link>
      <p className="eyebrow">VISTA PREVIA · SIN PAGOS</p>
      <h1>Pasarela de pago<span className="heading-dot">.</span></h1>
      <p className="demo-checkout-intro">Este esqueleto muestra cómo podría verse el último paso. No solicita datos reales, no crea pedidos y no procesa pagos.</p>
      <div className="checkout-layout">
        <section className="demo-payment-preview" aria-label="Pasarela de pago de muestra">
          <div className="demo-payment-heading">
            <span className="demo-payment-mark"><LockKeyhole size={17} /></span>
            <div><strong>Pasarela de muestra</strong><span>Vista de demostración</span></div>
            <span className="demo-payment-brand">VISTA PREVIA</span>
          </div>
          <div className="demo-payment-fields" aria-hidden="true">
            <span className="demo-field-label">Datos de pago</span>
            <div className="demo-field-skeleton demo-card-number" />
            <div className="demo-card-details"><div className="demo-field-skeleton" /><div className="demo-field-skeleton" /></div>
            <div className="demo-field-label demo-billing-label">Datos de facturación</div>
            <div className="demo-field-skeleton" />
            <div className="demo-field-skeleton demo-address-skeleton" />
          </div>
          <button className="button button-dark full-width demo-pay-disabled" type="button" disabled>
            Pago deshabilitado en esta demo <LockKeyhole size={15} />
          </button>
          <p className="demo-payment-disclaimer">No introduzcas datos personales ni bancarios.</p>
        </section>
        <aside className="summary-card checkout-summary">
          <h2>Resumen de muestra</h2>
          {cart.items.map((item) => <div className="checkout-item" key={item.id}><span>{item.name} × {item.quantity}</span><span>{money(item.priceCents * item.quantity)}</span></div>)}
          <div><span>Subtotal</span><span>{money(cart.subtotalCents)}</span></div>
          <div><span>Envío de muestra</span><span>{shipping ? money(shipping) : 'Gratis'}</span></div>
          <div className="summary-total"><strong>Total de muestra</strong><strong>{money(cart.subtotalCents + shipping)}</strong></div>
          <Link className="demo-return-link" to="/tienda">Seguir explorando <ArrowRight size={15} /></Link>
        </aside>
      </div>
    </main>
  );
}

function DemoCartPage() {
  return <CartPage demo />;
}

export function ButtonSoundControl() {
  const [muted, setMuted] = useState(() => localStorage.getItem('portfolio-button-sounds-muted') === 'true');
  const audioContext = useRef(null);

  useEffect(() => {
    function playBubbleSound(event) {
      const control = event.target.closest('button, a[href], [role="button"]');
      if (!control || control.disabled || muted) return;

      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;

      try {
        const context = audioContext.current ?? new AudioContextClass();
        audioContext.current = context;
        const play = () => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const now = context.currentTime;
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(520, now);
          oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.12);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.22, now + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.14);
        };

        if (context.state === 'suspended') {
          context.resume().then(play).catch((error) => globalThis.console.error('No se pudo reproducir el sonido del botón.', error));
        } else {
          play();
        }
      } catch (error) {
        globalThis.console.error('No se pudo reproducir el sonido del botón.', error);
      }
    }

    document.addEventListener('click', playBubbleSound, true);
    return () => document.removeEventListener('click', playBubbleSound, true);
  }, [muted]);

  function toggleMuted() {
    setMuted((current) => {
      const next = !current;
      try {
        localStorage.setItem('portfolio-button-sounds-muted', String(next));
      } catch (error) {
        globalThis.console.error('No se pudo guardar la preferencia de sonido.', error);
      }
      return next;
    });
  }

  return (
    <button
      className="button-sound-control"
      type="button"
      onClick={toggleMuted}
      aria-label={muted ? 'Activar sonidos' : 'Silenciar sonidos'}
      aria-pressed={muted}
      title={muted ? 'Activar sonidos' : 'Silenciar sonidos'}
    >
      {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
    </button>
  );
}

export function PortfolioRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/proyectos" element={<PortfolioPage />} />
      <Route path="/catalogo" element={<PortfolioPage />} />
      <Route path="/contacto" element={<PortfolioPage />} />
      <Route path="/servicios" element={<PortfolioPage />} />
      <Route path="/demo-tarjeta" element={<BusinessCardDemoPage />} />
      <Route path="/tienda" element={<ShopDemoShell><DemoProductsPage /></ShopDemoShell>} />
      <Route path="/producto/:slug" element={<ShopDemoShell><DemoProductPage /></ShopDemoShell>} />
      <Route path="/carrito" element={<ShopDemoShell><DemoCartPage /></ShopDemoShell>} />
      <Route path="/checkout" element={<ShopDemoShell><DemoCheckoutPage /></ShopDemoShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function PortfolioApp() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CartProvider>
        <PortfolioRoutes />
        <ButtonSoundControl />
      </CartProvider>
    </BrowserRouter>
  );
}

export default PortfolioApp;
