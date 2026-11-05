import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PortfolioContact, PortfolioHeader, PortfolioHome, PortfolioProjects } from './Portfolio.jsx';

afterEach(cleanup);

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

  it('shows the store only as a visual sample with no shopping link', () => {
    render(<MemoryRouter><PortfolioProjects /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Tienda de ejemplo' })).toBeInTheDocument();
    expect(screen.getByText(/no hay compras, carrito ni pagos/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /tienda/i })).not.toBeInTheDocument();
  });

  it('offers preventive cybersecurity work and identifies the completed training', () => {
    render(<MemoryRouter><PortfolioProjects /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Ciberseguridad web.' })).toBeInTheDocument();
    expect(screen.getByText(/ofrezco una revisión preventiva de aspectos básicos de seguridad web/i)).toBeInTheDocument();
    expect(screen.getByText(/formación en ciberseguridad completada en Coremsa Formaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/no incluye auditorías avanzadas ni pruebas de intrusión/i)).toBeInTheDocument();
  });

  it('provides placeholders for the social profile links', () => {
    render(<MemoryRouter><PortfolioContact /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Conectemos.' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Enlaces a redes sociales' })).toBeInTheDocument();
    expect(screen.getAllByText('Añade aquí tu enlace')).toHaveLength(4);
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });
});
