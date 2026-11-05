import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PortfolioContact, PortfolioHeader, PortfolioHome, PortfolioProjects } from './Portfolio.jsx';
import { CartProvider } from './CartContext.jsx';
import { ButtonSoundControl, PortfolioRoutes } from './PortfolioApp.jsx';
import { demoResponse } from './demoData.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.removeItem('mama-huevo-cart');
  localStorage.removeItem('portfolio-button-sounds-muted');
});

describe('portfolio pages', () => {
  it('shows the presentation and navigation to projects and contact', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PortfolioHeader />
        <PortfolioHome />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /diseño y desarrollo\s*web con intención/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '/proyectos');
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto');
    expect(screen.queryByRole('link', { name: 'Contrata nuestros servicios' })).not.toBeInTheDocument();
  });

  it('opens the interactive store demo by clicking its project image', () => {
    render(<MemoryRouter><PortfolioProjects /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Tienda de ejemplo' })).toBeInTheDocument();
    expect(screen.getByText(/no se procesa ningún pago ni pedido real/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir la tienda de ejemplo' })).toHaveAttribute('href', '/tienda');
  });

  it('offers preventive cybersecurity work and identifies the completed training', () => {
    render(<MemoryRouter><PortfolioProjects /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Ciberseguridad web.' })).toBeInTheDocument();
    expect(screen.getByText(/ofrezco una revisión preventiva de aspectos básicos de seguridad web/i)).toBeInTheDocument();
    expect(screen.getByText(/formación en ciberseguridad completada en Coremsa Formaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/no incluye auditorías avanzadas ni pruebas de intrusión/i)).toBeInTheDocument();
  });

  it('shows social icons and links to the supplied profiles', () => {
    const { container } = render(<MemoryRouter><PortfolioContact /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Conectemos.' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Enlaces a redes sociales' })).toBeInTheDocument();
    const profiles = [
      ['LinkedIn', 'https://www.linkedin.com/in/juan-esteban-bateman-a970a3300/'],
      ['GitHub', 'https://github.com/Broyer21'],
      ['Instagram', 'https://www.instagram.com/batemanius0/'],
    ];
    for (const [name, url] of profiles) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: `Visitar perfil de ${name}` })).toHaveAttribute('href', url);
      expect(screen.getByRole('link', { name: `Visitar perfil de ${name}` })).toHaveAttribute('target', '_blank');
    }
    expect(container.querySelectorAll('svg.portfolio-social-icon')).toHaveLength(3);
  });

  it('lets visitors mute button sounds and remembers the preference', async () => {
    render(<MemoryRouter><ButtonSoundControl /></MemoryRouter>);
    const muteButton = screen.getByRole('button', { name: 'Silenciar sonidos' });

    muteButton.click();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Activar sonidos' })).toHaveAttribute('aria-pressed', 'true'));
    expect(localStorage.getItem('portfolio-button-sounds-muted')).toBe('true');
  });

  it('plays the bubble sound when a portfolio call-to-action link is clicked', () => {
    const oscillator = {
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const gain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const context = {
      currentTime: 1,
      state: 'running',
      destination: {},
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain),
    };
    vi.stubGlobal('AudioContext', vi.fn(() => context));

    render(
      <MemoryRouter>
        <PortfolioHome />
        <ButtonSoundControl />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole('link', { name: /ver proyectos/i })[0]);
    expect(context.createOscillator).toHaveBeenCalledOnce();
    expect(oscillator.start).toHaveBeenCalledOnce();
  });

  it('opens the payment gateway mock without enabling real payments', () => {
    const [product] = demoResponse('/api/products?sort=featured');
    localStorage.setItem('mama-huevo-cart', JSON.stringify([{ ...product, quantity: 1 }]));

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <CartProvider><PortfolioRoutes /></CartProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Pasarela de pago.' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Pasarela de pago de muestra' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pago deshabilitado en esta demo/i })).toBeDisabled();
    expect(screen.getByText('No introduzcas datos personales ni bancarios.')).toBeInTheDocument();
  });

  it('lets visitors enter the demo shop and browse its sample products', async () => {
    render(
      <MemoryRouter initialEntries={['/tienda']}>
        <CartProvider><PortfolioRoutes /></CartProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /objetos hechos para quedarse/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole('link', { name: 'Jarra de cerámica Serena' })).toHaveLength(2));
    expect(screen.getAllByRole('link', { name: 'Portfolio' }).some((link) => link.getAttribute('href') === '/proyectos')).toBe(true);
  });
});
