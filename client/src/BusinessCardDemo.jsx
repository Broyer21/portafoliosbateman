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

const cardModels = [
  { id: 'studio', name: '01 · Estudio', description: 'Un diseño propio, editorial y equilibrado.' },
  { id: 'intencion', name: '02 · Intención', description: 'La tarjeta actual, con el frontal más trabajado.' },
  { id: 'perfil', name: '03 · Perfil digital', description: 'Un formato profesional inspirado en la referencia.' },
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

function CardMark({ compact = false }) {
  return <span className={`business-card-mark${compact ? ' is-compact' : ''}`}>eb</span>;
}

function CardTopline({ model, side }) {
  return (
    <div className="business-card-topline">
      <CardMark />
      <span className="business-card-kicker">{model === 'perfil' ? 'PERFIL PROFESIONAL' : 'TARJETA DIGITAL · MUESTRA'}</span>
      <span className="business-card-index">{side} / 02</span>
    </div>
  );
}

function StudioFront() {
  return (
    <>
      <div className="business-card-topline">
        <CardMark />
        <span className="business-card-kicker">TARJETA DIGITAL · MUESTRA</span>
        <span className="business-card-index">01 / 02</span>
      </div>
      <div className="business-card-studio-layout">
        <div className="business-card-studio-copy">
          <p className="business-card-discipline">DESARROLLO WEB · COMPONENTES · IDEAS</p>
          <h2 aria-label="Juan Esteban Bateman">Juan Esteban<br /><em>Bateman.</em></h2>
          <p className="business-card-role">Desarrollador · Ingeniería de Sistemas</p>
          <p className="business-card-manifesto">Tecnología con intención.<br />Ideas que encuentran su forma.</p>
        </div>
        <div className="business-card-art-panel" aria-hidden="true">
          <span className="business-card-art-orbit orbit-a" />
          <span className="business-card-art-orbit orbit-b" />
          <span className="business-card-art-cross">+</span>
          <span className="business-card-art-index">EB — 01</span>
          <span className="business-card-art-caption">DIGITAL<br />CRAFT</span>
          <Code2 size={29} strokeWidth={1.2} />
          <span className="business-card-art-bottom">WEB / SYSTEMS / IDEAS</span>
        </div>
      </div>
      <div className="business-card-studio-bottom">
        <div className="business-card-capabilities">
          <span><i /> Interfaces web</span>
          <span><i /> Automatización</span>
          <span><i /> Integraciones</span>
        </div>
        <SocialLinks />
      </div>
    </>
  );
}

function IntentionFront() {
  return (
    <>
      <div className="business-card-topline">
        <CardMark />
        <span className="business-card-kicker">PRESENTACIÓN PERSONAL</span>
        <span className="business-card-index">01 / 02</span>
      </div>
      <div className="business-card-intention-layout">
        <div className="business-card-intention-main">
          <p className="business-card-discipline">DESARROLLO WEB · COMPONENTES · IDEAS</p>
          <h2 aria-label="Juan Esteban Bateman">Juan Esteban<br /><em>Bateman.</em></h2>
          <p className="business-card-role">Desarrollador · Base técnica en Ingeniería de Sistemas</p>
          <p className="business-card-manifesto">Ideas claras. Código cuidado.<br />Experiencias que conectan.</p>
        </div>
        <div className="business-card-intention-side" aria-hidden="true">
          <span className="intention-side-label">UN PERFIL</span>
          <strong>digital<span>.</span></strong>
          <div className="intention-side-lines"><i /><i /><i /></div>
          <span className="intention-side-foot">DISEÑADO PARA CRECER</span>
        </div>
      </div>
      <div className="business-card-intention-bottom">
        <div className="business-card-focus">
          <span>ENFOQUE</span>
          <p>Interfaces web, automatización e integración de servicios digitales.</p>
        </div>
        <SocialLinks />
      </div>
    </>
  );
}

function ProfileFront() {
  return (
    <>
      <div className="business-card-profile-heading">
        <div className="business-card-profile-label"><span /> PERFIL PROFESIONAL <span className="profile-label-dot">DISPONIBLE PARA CONECTAR</span></div>
        <div className="business-card-profile-person">
          <span className="business-card-profile-monogram">EB</span>
          <div><p>INGENIERÍA DE SISTEMAS</p><h2 aria-label="Juan Esteban Bateman">Juan Esteban <em>Bateman</em></h2><span>Desarrollador · Soluciones digitales</span></div>
        </div>
      </div>
      <div className="business-card-profile-value">
        <span>PROPUESTA DE VALOR</span>
        <p>Creo soluciones digitales prácticas: desde experiencias web e integraciones hasta automatizaciones que ayudan a los proyectos a avanzar.</p>
      </div>
      <div className="business-card-profile-highlights">
        <div><Code2 size={18} /><span>Web e interfaces</span></div>
        <div><Workflow size={18} /><span>Automatización BPA e IA</span></div>
        <div><Cloud size={18} /><span>Integración y despliegue cloud</span></div>
      </div>
      <SocialLinks />
    </>
  );
}

function CardFront({ model }) {
  if (model === 'intencion') return <IntentionFront />;
  if (model === 'perfil') return <ProfileFront />;
  return <StudioFront />;
}

function CardBack({ model, onFlip }) {
  return (
    <>
      <CardTopline model={model} side="02" />
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
      <button className="business-card-flip" type="button" onClick={onFlip} aria-label="Volver al frente de la tarjeta">
        <ArrowLeft size={15} /> Volver al frente
      </button>
    </>
  );
}

export default function BusinessCardDemo() {
  const [flipped, setFlipped] = useState(false);
  const [selectedModel, setSelectedModel] = useState('studio');

  return (
    <main className="portfolio-inner-page business-card-demo-page">
      <section className="portfolio-page-heading">
        <p className="portfolio-eyebrow"><span /> DEMO INTERACTIVA · TARJETA DIGITAL</p>
        <h1>Una presentación<br />con <em>intención.</em></h1>
        <p>Esta tarjeta es una muestra del servicio de diseño y desarrollo de tarjetas digitales para emprendedores, profesionales y negocios.</p>
        <Link className="business-card-back-link" to="/proyectos"><ArrowLeft size={15} /> Volver a proyectos</Link>
      </section>

      <section className="business-card-showcase" aria-label="Modelos de tarjeta de presentación">
        <div className="business-card-model-picker" role="group" aria-label="Selecciona un modelo de tarjeta">
          {cardModels.map(({ id, name, description }) => (
            <button
              className={`business-card-model-option${selectedModel === id ? ' is-selected' : ''}`}
              type="button"
              key={id}
              aria-pressed={selectedModel === id}
              aria-label={`Usar modelo ${name.slice(5)}`}
              onClick={() => { setSelectedModel(id); setFlipped(false); }}
            >
              <span className={`business-card-model-swatch swatch-${id}`} aria-hidden="true"><i /><i /></span>
              <span className="business-card-model-copy"><strong>{name}</strong><small>{description}</small></span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className={`business-card-stage model-${selectedModel}${flipped ? ' is-flipped' : ''}`}>
          <div className="business-card-inner">
            <article className={`business-card-face business-card-front front-${selectedModel}`} aria-hidden={flipped} inert={flipped}>
              <CardFront model={selectedModel} />
              <button className="business-card-flip" type="button" onClick={() => setFlipped(true)} aria-label="Ver el reverso de la tarjeta">
                Ver servicios <Repeat2 size={16} />
              </button>
            </article>

            <article className="business-card-face business-card-back" aria-hidden={!flipped} inert={!flipped}>
              <CardBack model={selectedModel} onFlip={() => setFlipped(false)} />
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
