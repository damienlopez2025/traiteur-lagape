import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, BarChart3, Settings, FileText, Package } from 'lucide-react';
import Card from '../components/Card';

const Home = () => {
    const navigate = useNavigate();

    const ActionCard = ({ title, icon: Icon, path, color }) => (
        <div
            onClick={() => navigate(path)}
            className="action-card"
            style={{
                borderTop: `4px solid ${color}`
            }}
        >
            <div className="action-card-icon" style={{ color: color }}>
                <Icon size={48} />
            </div>
            <h2>{title}</h2>
        </div>
    );

    return (
        <div style={{ padding: 'var(--spacing-xxl) 0' }}>
            <div className="text-center" style={{ marginBottom: 'var(--spacing-xxl)' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--color-secondary)' }}>TRAITEUR L'AGAPE</h1>
                <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem' }}>Gestion de la facturation du traiteur</p>
            </div>

            <div className="dashboard-grid">
                <ActionCard
                    title="Nouveau traiteur"
                    icon={PlusCircle}
                    path="/nouveau"
                    color="var(--color-primary)"
                />
                <ActionCard
                    title="Factures"
                    icon={FileText} // Ensure proper import
                    path="/factures"
                    color="#6366f1" // Indigo
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
                <ActionCard
                    title="Produits"
                    icon={Package} // Ensure proper import
                    path="/produits"
                    color="#f59e0b" // Amber
                />
                <ActionCard
                    title="Prestataires"
                    icon={Settings} // or ChefHat if imported
                    path="/prestataires"
                    color="#ec4899" // Pink
                />
            </div>
        </div>
    );
};

export default Home;
