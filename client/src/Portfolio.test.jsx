import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PortfolioCatalog, PortfolioHeader, PortfolioHome, PortfolioServices } from './Portfolio.jsx';

afterEach(cleanup);

describe('portfolio pages', () => {
  it('shows the presentation and navigation to catalog and services', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PortfolioHeader />
        <PortfolioHome />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /diseño y desarrollo\s*web con intención/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/catalogo');
    expect(screen.getByRole('link', { name: 'Contrata nuestros servicios' })).toHaveAttribute('href', '/servicios');
  });

  it('lists the existing store as an example visitors can open', () => {
    render(<MemoryRouter><PortfolioCatalog /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Tienda de ejemplo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Visitar la tienda' })).toHaveAttribute('href', '/tienda');
  });

  it('offers preventive cybersecurity work and identifies the completed training', () => {
    render(<MemoryRouter><PortfolioCatalog /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Ciberseguridad web.' })).toBeInTheDocument();
    expect(screen.getByText(/ofrezco una revisión preventiva de aspectos básicos de seguridad web/i)).toBeInTheDocument();
    expect(screen.getByText(/formación en ciberseguridad completada en Coremsa Formaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/no incluye auditorías avanzadas ni pruebas de intrusión/i)).toBeInTheDocument();
  });

  it('provides a starter services and contact section', () => {
    render(<MemoryRouter><PortfolioServices /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: /contrata nuestros\s*servicios/i })).toBeInTheDocument();
    expect(screen.getByText('Web components')).toBeInTheDocument();
    expect(screen.getByText('[Añade aquí tu correo o enlace de contacto]')).toBeInTheDocument();
  });
});
