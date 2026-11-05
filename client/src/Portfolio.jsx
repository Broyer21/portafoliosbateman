import { ArrowDownRight, ArrowRight, Code2, Github, Info, Instagram, Layers3, Linkedin, MoveUpRight, ShoppingBag, ShieldCheck, WandSparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;
const localArtwork = assetPath('images/portfolio-background.jpg');
const localProjectArtwork = assetPath('images/portfolio-project.jpg');
const socialLinks = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/juan-esteban-bateman-a970a3300/', Icon: Linkedin },
  { name: 'GitHub', url: 'https://github.com/Broyer21', Icon: Github },
  { name: 'Instagram', url: 'https://www.instagram.com/batemanius0/', Icon: Instagram },
];

function publicPath(path) {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
  return `${base}${path === '/' ? '/' : path}`;
}

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
  { id: 'proyectos', path: '/proyectos', label: 'Proyectos' },
  { id: 'contacto', path: '/contacto', label: 'Contacto' },
];

function scrollToSection(id, path, behavior = 'smooth') {
  const element = document.getElementById(id);
  if (!element) return false;
  if (id === 'presentacion') window.scrollTo({ top: 0, behavior });
  else element.scrollIntoView({ behavior, block: 'start' });
  if (path) window.history.replaceState(window.history.state, '', publicPath(path));
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
        <span className="brand-mark">eb</span>
        <span>esteban <b>bateman</b></span>
      </Link>
      <nav className="portfolio-nav" aria-label="Navegación principal">
        {sections.map(({ id, path, label }) => (
          <a key={id} href={publicPath(path)} className={active === id ? 'active' : ''} aria-current={active === id ? 'page' : undefined} onClick={(event) => goToSection(event, id, path)}>{label}</a>
        ))}
      </nav>
      <a className="portfolio-nav-cta" href={`${publicPath('/contacto')}#contacto`} onClick={(event) => goToSection(event, 'contacto', '/contacto')}>Mis redes <MoveUpRight size={15} /></a>
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
    const target = sections.find((section) => section.path === pathname)
      || (pathname === '/catalogo' ? sections.find((section) => section.id === 'proyectos')
        : pathname === '/servicios' ? sections.find((section) => section.id === 'contacto') : sections[0]);
    scrollToSection(target.id, null, 'auto');
  }, [pathname]);
  return (
    <>
      <div id="presentacion" className="portfolio-section"><PortfolioHome /></div>
      <div id="proyectos" className="portfolio-section"><PortfolioProjects /></div>
      <div id="contacto" className="portfolio-section"><PortfolioContact /></div>
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
      <span>Portfolio personal · Desarrollo web</span>
      <a href={publicPath('/')} onClick={(event) => goToSection(event, 'presentacion', '/')}>Volver arriba ↑</a>
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
          <img className="hero-skeleton" src={assetPath('images/esqueleto.png')} alt="" aria-hidden="true" />
          </div>
          <div className="portfolio-hero-actions">
            <Link className="portfolio-button portfolio-button-primary" to="/proyectos" onClick={(event) => goToSection(event, 'proyectos', '/proyectos')}>Ver proyectos <ArrowRight size={17} /></Link>
            <Link className="portfolio-button portfolio-button-quiet" to="/contacto" onClick={(event) => goToSection(event, 'contacto', '/contacto')}>Ver mis redes <ArrowDownRight size={17} /></Link>
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
        <p>Explora una muestra visual de una tienda de ejemplo y conoce los proyectos y áreas en los que quiero seguir creciendo.</p>
        <Link className="portfolio-text-link" to="/proyectos" onClick={(event) => goToSection(event, 'proyectos', '/proyectos')}>Ver proyectos <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}

export function PortfolioProjects() {
  return (
    <main className="portfolio-inner-page">
      <section className="portfolio-page-heading">
        <p className="portfolio-eyebrow"><span /> PROYECTOS Y MUESTRAS</p>
        <h1>Proyectos<span className="portfolio-period">.</span></h1>
        <p>Una selección de proyectos y muestras visuales de interfaces web. La tienda es solo una maqueta: no permite comprar.</p>
      </section>
      <section className="portfolio-project-grid">
        <article className="portfolio-project-card">
          <Link className="project-art-link" to="/tienda" aria-label="Abrir la tienda de ejemplo">
            <div className="project-art project-art-shop" style={{ '--portfolio-art': `url("${localProjectArtwork}")` }}>
              <div className="project-browser"><span /><span /><span /><div className="project-browser-content"><ShoppingBag size={29} /><span>PROYECTO DE MUESTRA</span><strong>Concepto<br />de tienda.</strong></div></div>
              <span className="project-number">01 / E-COMMERCE</span>
            </div>
          </Link>
          <div className="project-info">
            <div><p>DEMO INTERACTIVA · SIN PAGOS</p><h2>Tienda de ejemplo</h2><span>Explora productos, añade a la bolsa y mira el checkout de muestra.</span></div>
          </div>
        </article>
        <article className="portfolio-coming-card">
          <div className="coming-icons"><Layers3 size={25} /><WandSparkles size={25} /></div>
          <span>PRÓXIMAMENTE</span>
          <h2>Más ideas<br />en camino.</h2>
          <p>Este espacio está preparado para añadir nuevos proyectos a medida que los vayamos creando.</p>
          <div className="coming-index">02—∞</div>
        </article>
      </section>
      <section className="portfolio-catalog-note"><Info size={19} /><p>La tienda y su pasarela son una demostración visual: puedes recorrer el catálogo y el carrito, pero no se procesa ningún pago ni pedido real.</p></section>
      <section className="portfolio-security-offer" aria-labelledby="catalog-security-heading">
        <div className="portfolio-security-icon" aria-hidden="true"><ShieldCheck size={23} /></div>
        <div className="portfolio-security-copy">
          <p className="portfolio-eyebrow"><span /> SERVICIO · FORMACIÓN COMPLETADA</p>
          <h2 id="catalog-security-heading">Ciberseguridad web<span className="portfolio-period">.</span></h2>
          <p>Ofrezco una revisión preventiva de aspectos básicos de seguridad web para ayudarte a detectar mejoras y aplicar buenas prácticas en tu proyecto.</p>
          <p className="portfolio-security-scope">Formación en ciberseguridad completada en Coremsa Formaciones. El alcance se acuerda antes de empezar; no incluye auditorías avanzadas ni pruebas de intrusión.</p>
        </div>
        <span className="portfolio-security-index">03 / NUEVA LÍNEA</span>
      </section>
    </main>
  );
}

export function PortfolioContact() {
  return (
    <main className="portfolio-inner-page contact-page">
      <section className="portfolio-page-heading">
        <p className="portfolio-eyebrow"><span /> CONTACTO</p>
        <h1>Conectemos<span className="portfolio-period">.</span></h1>
        <p>Encuéntrame en mis redes y conoce más sobre mi trabajo.</p>
      </section>
      <section className="portfolio-social-links" aria-label="Enlaces a redes sociales">
        {socialLinks.map(({ name, url, Icon }, index) => (
          <article className="portfolio-social-card" key={name}>
            <span className="portfolio-social-number">0{index + 1}</span>
            <Icon className="portfolio-social-icon" size={34} aria-hidden="true" />
            <h2>{name}</h2>
            <a href={url} target="_blank" rel="noreferrer" aria-label={`Visitar perfil de ${name}`}>Visitar perfil <MoveUpRight size={15} /></a>
          </article>
        ))}
      </section>
    </main>
  );
}
