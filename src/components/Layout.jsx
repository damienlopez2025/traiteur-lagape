import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid var(--color-border)', 
        padding: '0 var(--spacing-lg)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <ChefHat size={28} />
            <span>TRAITEUR L'AGAPE</span>
          </div>
          
          <nav style={{ display: 'flex', gap: 'var(--spacing-md)', marginLeft: 'var(--spacing-xl)' }}>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Accueil
            </NavLink>
            <NavLink to="/nouveau" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Nouveau traiteur
            </NavLink>
            <NavLink to="/mois" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Mois en cours
            </NavLink>
            <NavLink to="/annee" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Année en cours
            </NavLink>
            <NavLink to="/produits" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Produits traiteur
            </NavLink>
          </nav>
        </div>
        
        {/* Placeholder for future user menu or extra actions */}
        <div></div> 
      </header>
      
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
          background-color: #fff0eb; /* Very light orange tint */
        }
      `}</style>
    </div>
  );
};

export default Layout;
