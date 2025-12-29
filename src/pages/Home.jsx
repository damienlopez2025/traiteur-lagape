import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, BarChart3, Settings } from 'lucide-react';
import Card from '../components/Card';

const Home = () => {
    const navigate = useNavigate();

    const ActionCard = ({ title, icon: Icon, path, color }) => (
        <div
            onClick={() => navigate(path)}
            className="card"
            style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-xl)',
                height: '240px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                borderTop: `4px solid ${color}`
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
        >
            <div style={{ color: color, marginBottom: 'var(--spacing-md)' }}>
                <Icon size={48} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginTop: 0, fontWeight: 600 }}>{title}</h2>
        </div>
    );

    return (
        <div style={{ padding: 'var(--spacing-xxl) 0' }}>
            <div className="text-center" style={{ marginBottom: 'var(--spacing-xxl)' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--color-secondary)' }}>Bienvenue sur L'AGAPE</h1>
                <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem' }}>Gestion simplifiée des factures et des primes</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xxl)'
            }}>
                <ActionCard
                    title="Nouveau traiteur"
                    icon={PlusCircle}
                    path="/nouveau"
                    color="var(--color-primary)"
                />
                <ActionCard
                    title="Mois en cours"
                    icon={Calendar}
                    path="/mois"
                    color="var(--color-success)"
                />
                <ActionCard
                    title="Année en cours"
                    icon={BarChart3}
                    path="/annee"
                    color="var(--color-secondary)"
                />
            </div>

            <div className="text-center">
                <button
                    onClick={() => navigate('/produits')}
                    className="btn btn-secondary"
                    style={{ gap: '8px', padding: '12px 24px', fontSize: '1rem' }}
                >
                    <Settings size={20} />
                    Produits traiteur & Stock
                </button>
            </div>
        </div>
    );
};

export default Home;
