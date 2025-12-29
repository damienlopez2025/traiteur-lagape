import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChefHat, Menu, X, Home as HomeIcon, PlusCircle, Calendar, BarChart3, Package } from 'lucide-react';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navItems = [
    { path: '/', label: 'Accueil', icon: HomeIcon },
    { path: '/nouveau', label: 'Nouveau', icon: PlusCircle },
    { path: '/mois', label: 'Mois', icon: Calendar },
    { path: '/annee', label: 'Année', icon: BarChart3 },
    { path: '/produits', label: 'Produits', icon: Package },
  ];

  return (
    <div className="layout">
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--color-border)',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <ChefHat size={28} />
            <span className="hidden-mobile">TRAITEUR L'AGAPE</span>
            <span className="visible-mobile" style={{ display: 'none' }}>L'AGAPE</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            style={{ display: 'none', padding: '8px' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 99,
          padding: 'var(--spacing-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)'
        }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--color-text-main)',
                border: '1px solid var(--color-border)',
                fontSize: '1.1rem',
                fontWeight: 500
              }}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <main className="container mt-lg" style={{ paddingBottom: 'var(--spacing-xl)' }}>
        {children}
      </main>

      <style>{`
        .nav-link {
          color: var(--color-text-light);
          text-decoration: none;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }
        .nav-link:hover {
          background-color: #f5f8fa;
          color: var(--color-primary);
        }
        .nav-link.active {
          color: var(--color-primary);
          background-color: #fff0eb;
        }

        .mobile-nav-link.active {
          background-color: #fff0eb;
          color: var(--color-primary);
          border-color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-toggle { display: block !important; }
          .hidden-mobile { display: none !important; }
          .visible-mobile { display: inline !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
