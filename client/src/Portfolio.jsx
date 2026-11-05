import { ArrowDownRight, ArrowRight, Code2, Layers3, MoveUpRight, PackageOpen, ShoppingBag, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const localArtwork = '/images/portfolio-background.jpg';
const localProjectArtwork = '/images/portfolio-project.jpg';

const bubbles = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 10 + ((i * 17) % 38),
  duration: 22 + ((i * 7) % 20),
  delay: -((i * 5) % 40),
  drift: ((i * 13) % 60) - 30,
}));

export function PortfolioBubbles() {
  return (
    <div className="portfolio-bubbles" aria-hidden="true">
      {bubbles.map((bubble, index) => (
        <span key={index} style={{ left: `${bubble.left}%`, width: bubble.size, height: bubble.size, animationDuration: `${bubble.duration}s`, animationDelay: `${bubble.delay}s`, '--drift': `${bubble.drift}px` }} />
      ))}
    </div>
  );
}

const sections = [
  { id: 'presentacion', path: '/', label: 'Presentación' },
  { id: 'catalogo', path: '/catalogo', label: 'Catálogo' },
  { id: 'servicios', path: '/servicios', label: 'Contrata nuestros servicios' },
];

function scrollToSection(id, path, behavior = 'smooth') {
  const element = document.getElementById(id);
  if (!element) return false;
  if (id === 'presentacion') window.scrollTo({ top: 0, behavior });
  else element.scrollIntoView({ behavior, block: 'start' });
  if (path) window.history.replaceState(window.history.state, '', path);
  return true;
}

export function goToSection(event, id, path) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button) return;
  if (scrollToSection(id, path)) event.preventDefault();
}

function useActiveSection() {
  const [active, setActive] = useState('presentacion');
  useEffect(() => {
    function update() {
      const probe = window.innerHeight * 0.35;
      let current = sections[0].id;
      for (const { id } of sections) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= probe) current = id;
      }
      setActive(current);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return active;
}

export function PortfolioHeader() {
  const active = useActiveSection();
  return (
    <header className="portfolio-header">
      <Link className="portfolio-wordmark" to="/" aria-label="Inicio del portfolio" onClick={(event) => goToSection(event, 'presentacion', '/')}>
        <span className="brand-mark">mh</span>
        <span>web <b>studio</b></span>
      </Link>
      <nav className="portfolio-nav" aria-label="Navegación principal">
        {sections.map(({ id, path, label }) => (
          <a key={id} href={path} className={active === id ? 'active' : ''} aria-current={active === id ? 'page' : undefined} onClick={(event) => goToSection(event, id, path)}>{label}</a>
        ))}
      </nav>
      <a className="portfolio-nav-cta" href="/servicios#contacto" onClick={(event) => goToSection(event, 'contacto', '/servicios')}>Hablemos <MoveUpRight size={15} /></a>
    </header>
  );
}

function useSeamlessLoop(cloneRef) {
  useEffect(() => {
    function wrap() {
      const clone = cloneRef.current;
      if (clone && window.scrollY >= clone.offsetTop) window.scrollTo({ top: window.scrollY - clone.offsetTop, behavior: 'instant' });
    }
    window.addEventListener('scroll', wrap, { passive: true });
    return () => window.removeEventListener('scroll', wrap);
  }, [cloneRef]);
}
export function PortfolioOnePage() {
  const { pathname } = useLocation();
  const cloneRef = useRef(null);
  useSeamlessLoop(cloneRef);
  useEffect(() => {
    const target = sections.find((section) => section.path === pathname) || sections[0];
    scrollToSection(target.id, null, 'auto');
  }, [pathname]);
  return (
    <>
      <div id="presentacion" className="portfolio-section"><PortfolioHome /></div>
      <div id="catalogo" className="portfolio-section"><PortfolioCatalog /></div>
      <div id="servicios" className="portfolio-section"><PortfolioServices /></div>
      <div ref={cloneRef} className="portfolio-section" aria-hidden="true" inert><PortfolioHome /></div>
    </>
  );
}

export function PortfolioFooter() {
  return (
    <footer className="portfolio-footer">
      <Link className="portfolio-wordmark" to="/" onClick={(event) => goToSection(event, 'presentacion', '/')}>
        <span className="brand-mark">mh</span>
        <span>web <b>studio</b></span>
      </Link>
      <span>Portfolio en construcción. Más proyectos pronto.</span>
      <a href="/" onClick={(event) => goToSection(event, 'presentacion', '/')}>Volver arriba ↑</a>
    </footer>
  );
}

export function PortfolioHome() {
  return (
    <main className="portfolio-main">
      <section className="portfolio-hero">
        <div className="portfolio-hero-copy">
          <p className="portfolio-eyebrow"><span /> DESARROLLO WEB · COMPONENTES · IDEAS</p>
          <h1>Diseño y desarrollo<br />web con <em>intención.</em></h1>
          <div className="portfolio-lede-row">
          <p className="portfolio-lede">
            Desarrollador con sólida base técnica en ingeniería de sistemas
            y experiencia práctica en el despliegue de aplicaciones modernas en la nube (Render, Railway).
            Especializado en la arquitectura de agentes de IA y automatización de procesos (BPA) utilizando n8n y Microsoft Copilot Studio.
            Capaz de fusionar el desarrollo de interfaces a medida (Web Components) con flujos de trabajo autónomos
            y conexión de APIs complejas, orientando la tecnología hacia
             la optimización de procesos de negocio
          </p>
          <img className="hero-skeleton" src="/images/esqueleto.png" alt="" aria-hidden="true" />
          </div>
          <div className="portfolio-hero-actions">
            <Link className="portfolio-button portfolio-button-primary" to="/catalogo" onClick={(event) => goToSection(event, 'catalogo', '/catalogo')}>Explorar ejemplos <ArrowRight size={17} /></Link>
            <Link className="portfolio-button portfolio-button-quiet" to="/servicios" onClick={(event) => goToSection(event, 'servicios', '/servicios')}>Ver servicios <ArrowDownRight size={17} /></Link>
          </div>
          <div className="portfolio-availability"><span className="availability-dot" /> Portfolio en desarrollo <span className="availability-divider">/</span> Nuevos proyectos próximamente</div>
        </div>
        <div className="portfolio-art" style={{ '--portfolio-art': `url("${localArtwork}")` }}>
          <div className="art-grid" />
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-code-card"><span>COMPONENTE / 001</span><strong>&lt;web<span>_</span>experiences /&gt;</strong><small>Diseñado para funcionar. Hecho para crecer.</small></div>
          <span className="art-side-note">INDEPENDIENTE · DIGITAL · CREATIVO</span>
          <span className="art-index">01—03</span>
        </div>
        <div className="portfolio-hero-index">01 <span /> PRESENTACIÓN</div>
      </section>
      <section className="portfolio-intro-strip">
        <span>UNA BASE PARA LO QUE VIENE</span>
        <p>Ideas claras. Código cuidado. Experiencias que conectan.</p>
        <Code2 size={21} />
      </section>
      <section className="portfolio-teaser">
        <div>
          <p className="portfolio-eyebrow">TRABAJO SELECCIONADO · 01</p>
          <h2>De una idea<br />a una experiencia.</h2>
        </div>
        <p>Explora una primera demo interactiva. El catálogo crecerá con más ejemplos de sitios, componentes y productos digitales.</p>
        <Link className="portfolio-text-link" to="/catalogo" onClick={(event) => goToSection(event, 'catalogo', '/catalogo')}>Ir al catálogo <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}

export function PortfolioCatalog() {
  return (
    <main className="portfolio-inner-page">
      <section className="portfolio-page-heading">
        <p className="portfolio-eyebrow"><span /> UNA COLECCIÓN EN CRECIMIENTO</p>
        <h1>Catálogo<span className="portfolio-period">.</span></h1>
        <p>Aquí iré reuniendo ejemplos de páginas y experiencias digitales. Por ahora, puedes explorar la primera demo.</p>
      </section>
      <section className="portfolio-project-grid">
        <article className="portfolio-project-card">
          <div className="project-art project-art-shop" style={{ '--portfolio-art': `url("${localProjectArtwork}")` }}>
            <div className="project-browser"><span /><span /><span /><div className="project-browser-content"><ShoppingBag size={29} /><span>OBJETOS PARA CADA DÍA</span><strong>Una tienda<br />de ejemplo.</strong></div></div>
            <span className="project-number">01 / E-COMMERCE</span>
          </div>
          <div className="project-info">
            <div><p>DEMO INTERACTIVA · REACT</p><h2>Tienda de ejemplo</h2><span>Catálogo, página de producto y carrito de compras.</span></div>
            <Link className="project-open" to="/tienda" aria-label="Visitar Tienda de ejemplo"><ArrowRight size={20} /></Link>
          </div>
          <Link className="project-visit-link" to="/tienda">Visitar la tienda <MoveUpRight size={15} /></Link>
        </article>
        <article className="portfolio-coming-card">
          <div className="coming-icons"><Layers3 size={25} /><WandSparkles size={25} /></div>
          <span>PRÓXIMAMENTE</span>
          <h2>Más ideas<br />en camino.</h2>
          <p>Este catálogo está preparado para añadir nuevos ejemplos a medida que los vayamos creando.</p>
          <div className="coming-index">02—∞</div>
        </article>
      </section>
      <section className="portfolio-catalog-note"><PackageOpen size={19} /><p>La tienda está en modo demostración. Su carrito es funcional; el pago requiere configurar los servicios externos descritos en la documentación del proyecto.</p></section>
      <section className="portfolio-security-offer" aria-labelledby="catalog-security-heading">
        <div className="portfolio-security-icon" aria-hidden="true"><ShieldCheck size={23} /></div>
        <div className="portfolio-security-copy">
          <p className="portfolio-eyebrow"><span /> NUEVA LÍNEA · FORMACIÓN EN CURSO</p>
          <h2 id="catalog-security-heading">Ciberseguridad web<span className="portfolio-period">.</span></h2>
          <p>Estoy cursando ciberseguridad en Coremsa Formaciones y quiero aplicar buenas prácticas preventivas en proyectos web.</p>
          <p className="portfolio-security-scope">Enfoque inicial: revisar contigo aspectos básicos y priorizar mejoras dentro de un alcance acordado. La formación sigue en curso; no incluye auditorías avanzadas ni pruebas de intrusión.</p>
        </div>
        <span className="portfolio-security-index">03 / NUEVA LÍNEA</span>
      </section>
    </main>
  );
}

export function PortfolioServices() {
  return (
    <main className="portfolio-inner-page services-page">
      <section className="portfolio-page-heading">
        <p className="portfolio-eyebrow"><span /> COLABORACIONES</p>
        <h1>Contrata nuestros<br />servicios<span className="portfolio-period">.</span></h1>
        <p>Una sección inicial para presentar las soluciones que ofreceré. Los servicios se definirán y ampliarán contigo.</p>
      </section>
      <section className="service-cards">
        <article><span>01</span><Code2 size={23} /><h2>Web components</h2><p>Componentes reutilizables, accesibles y adaptables para construir interfaces con una base sólida.</p></article>
        <article><span>02</span><Layers3 size={23} /><h2>Desarrollo web</h2><p>Páginas y experiencias digitales diseñadas alrededor de las necesidades de cada proyecto.</p></article>
        <article><span>03</span><Sparkles size={23} /><h2>Soluciones a medida</h2><p>Una base para describir otros servicios, integraciones e ideas que iremos definiendo.</p></article>
      </section>
      <section className="portfolio-contact" id="contacto">
        <div><p className="portfolio-eyebrow">¿TIENES UNA IDEA?</p><h2>Hagámosla<br /><em>realidad.</em></h2></div>
        <div><p>Este espacio queda listo para añadir tus datos de contacto y el proceso para solicitar un presupuesto.</p><span className="contact-placeholder">[Añade aquí tu correo o enlace de contacto]</span></div>
      </section>
    </main>
  );
}
