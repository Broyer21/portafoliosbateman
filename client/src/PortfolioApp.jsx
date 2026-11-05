import { BrowserRouter } from 'react-router-dom';
import { PortfolioBubbles, PortfolioFooter, PortfolioHeader, PortfolioOnePage } from './Portfolio.jsx';

function PortfolioApp() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PortfolioBubbles />
      <PortfolioHeader />
      <PortfolioOnePage />
      <PortfolioFooter />
    </BrowserRouter>
  );
}

export default PortfolioApp;
