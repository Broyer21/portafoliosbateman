import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bot, Cloud, Code2, Github, Instagram,
  Linkedin, Repeat2, ShieldCheck, ShoppingBag, Workflow,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const socialLinks = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/juan-esteban-bateman-a970a3300/', Icon: Linkedin },
  { name: 'GitHub', url: 'https://github.com/Broyer21', Icon: Github },
  { name: 'Instagram', url: 'https://www.instagram.com/batemanius0/', Icon: Instagram },
];

const services = [
  {
    name: 'Tarjetas de presentación digitales',
    description: 'Diseño y desarrollo de tarjetas digitales para presentar tu negocio y facilitar el acceso a tus servicios y redes.',
    Icon: Code2,
  },
  {
    name: 'Desarrollo web e interfaces',
    description: 'Experiencias web e interfaces a medida, con atención a los componentes reutilizables.',
    Icon: Code2,
  },
  {
    name: 'Integración de APIs',
    description: 'Conexión de APIs para integrar servicios y datos en aplicaciones.',
    Icon: Workflow,
  },
  {
    name: 'Automatización de procesos',
    description: 'Arquitectura de agentes de IA y automatización BPA con n8n y Microsoft Copilot Studio.',
    Icon: Bot,
  },
  {
    name: 'Despliegue en la nube',
    description: 'Experiencia práctica desplegando aplicaciones en Render y Railway.',
    Icon: Cloud,
  },
  {
    name: 'Ciberseguridad web preventiva',
    description: 'Revisión de aspectos básicos y recomendaciones de buenas prácticas. Formación completada en Coremsa Formaciones; no incluye auditorías avanzadas ni pruebas de intrusión.',
    Icon: ShieldCheck,
  },
];

function SocialLinks() {
  return (
    <div className="business-card-socials" aria-label="Redes sociales">
      {socialLinks.map(({ name, url, Icon }) => (
        <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={`Visitar perfil de ${name}`}>
          <Icon size={18} aria-hidden="true" />
          <span>{name}</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

export default function BusinessCardDemo() {
  const [flipped, setFlipped] = useState(false);

  return (
    <main className="portfolio-inner-page business-card-demo-page">
      <section className="portfolio-page-heading">
        <p className="portfolio-eyebrow"><span /> DEMO INTERACTIVA · TARJETA DIGITAL</p>
        <h1>Una presentación<br />con <em>intención.</em></h1>
        <p>Esta tarjeta es una muestra del servicio de diseño y desarrollo de tarjetas digitales para emprendedores, profesionales y negocios.</p>
        <Link className="business-card-back-link" to="/proyectos"><ArrowLeft size={15} /> Volver a proyectos</Link>
      </section>

      <section className="business-card-showcase" aria-label="Tarjeta de presentación digital de muestra">
        <div className={`business-card-stage${flipped ? ' is-flipped' : ''}`}>
          <div className="business-card-inner">
            <article className="business-card-face business-card-front" aria-hidden={flipped} inert={flipped}>
              <div className="business-card-topline">
                <span className="business-card-mark">eb</span>
                <span className="business-card-kicker">TARJETA DIGITAL · MUESTRA</span>
                <span className="business-card-index">01 / 02</span>
              </div>

              <div className="business-card-intro">
                <p className="business-card-discipline">DESARROLLO WEB · COMPONENTES · IDEAS</p>
                <h2>Juan Esteban{' '}<br /><em>Bateman.</em></h2>
                <p className="business-card-role">Desarrollador · Base técnica en Ingeniería de Sistemas</p>
                <p className="business-card-manifesto">Ideas claras. Código cuidado. Experiencias que conectan.</p>
              </div>

              <div className="business-card-front-bottom">
                <div className="business-card-focus">
                  <span>ENFOQUE</span>
                  <p>Interfaces web, automatización e integración de servicios digitales.</p>
                </div>
                <SocialLinks />
              </div>
              <button className="business-card-flip" type="button" onClick={() => setFlipped(true)} aria-label="Ver el reverso de la tarjeta">
                Ver servicios <Repeat2 size={16} />
              </button>
            </article>

            <article className="business-card-face business-card-back" aria-hidden={!flipped} inert={!flipped}>
              <div className="business-card-topline">
                <span className="business-card-mark">eb</span>
                <span className="business-card-kicker">SERVICIOS Y MUESTRAS</span>
                <span className="business-card-index">02 / 02</span>
              </div>

              <div className="business-card-services-heading">
                <p className="business-card-discipline">IDEAS QUE TOMAN FORMA</p>
                <h2>Lo que puedo{' '}<br /><em>construir contigo.</em></h2>
              </div>

              <div className="business-card-services">
                {services.map(({ name, description, Icon }, index) => (
                  <article className="business-card-service" key={name}>
                    <span className="business-card-service-icon"><Icon size={17} aria-hidden="true" /></span>
                    <div><h3>{name}</h3><p>{description}</p></div>
                    <span className="business-card-service-number">0{index + 1}</span>
                  </article>
                ))}
              </div>

              <div className="business-card-demos">
                <span>PROYECTOS DE MUESTRA</span>
                <Link to="/tienda"><ShoppingBag size={15} /> Tienda interactiva <ArrowUpRight size={14} /></Link>
                <Link to="/demo-tarjeta"><Code2 size={15} /> Esta tarjeta <ArrowUpRight size={14} /></Link>
              </div>
              <button className="business-card-flip" type="button" onClick={() => setFlipped(false)} aria-label="Volver al frente de la tarjeta">
                <ArrowLeft size={15} /> Volver al frente
              </button>
            </article>
          </div>
        </div>
        <p className="business-card-demo-note">Demo conceptual para mostrar el servicio. El contenido y la identidad visual de cada tarjeta se adaptarían a cada negocio.</p>
      </section>

      <div className="business-card-cta">
        <span>UN SERVICIO PARA TU NEGOCIO</span>
        <p>Una tarjeta digital puede reunir en un solo lugar quién eres, qué ofreces y dónde encontrarte.</p>
        <Link to="/contacto">Hablemos de tu idea <ArrowRight size={16} /></Link>
      </div>
    </main>
  );
}
