import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { storage } from '../utils/storage';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Table from '../components/Table';

const Providers = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [newProviderName, setNewProviderName] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await storage.getProviders();
        setProviders(p);
    };

    const handleAddProvider = async (e) => {
        e.preventDefault();
        if (!newProviderName.trim()) return;
        await storage.addProvider(newProviderName);
        setNewProviderName('');
        loadData();
    };

    const handleOpenProviderDetails = (id) => {
        navigate(`/providers/${id}`);
    };

    const handleDeleteProvider = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce prestataire ?')) {
            await storage.deleteProvider(id);
            loadData();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Gestion des Prestataires</h1>
            </div>

            <div className="grid-1-2">
                <Card title="Ajouter un prestataire">
                    <form onSubmit={handleAddProvider}>
                        <Input
                            label="Nom du prestataire"
                            id="providerName"
                            value={newProviderName}
                            onChange={e => setNewProviderName(e.target.value)}
                            placeholder="Exemple Banque Pictet"
                        />
                        <Button type="submit" variant="primary" style={{ width: '100%' }}>
                            <Plus size={18} style={{ marginRight: '8px' }} />
                            Ajouter
                        </Button>
                    </form>
                </Card>

                <Card title="Liste des prestataires">
                    <Table headers={['Société', 'Nom', 'Prénom', 'Actions']}>
                        {providers.map(p => (
                            <tr key={p.id} onClick={() => handleOpenProviderDetails(p.id)} style={{ cursor: 'pointer' }}>
                                <td style={{ fontWeight: 500 }}>{p.companyName}</td>
                                <td>{p.lastName || '-'}</td>
                                <td>{p.firstName || '-'}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleDeleteProvider(p.id)}
                                        className="btn-danger"
                                        style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--color-error)', color: 'var(--color-error)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Trash2 size={14} /> Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {providers.length === 0 && (
                            <tr><td colSpan="4" className="text-center">Aucun prestataire.</td></tr>
                        )}
                    </Table>
                </Card>
            </div>
        </div>
    );
};

export default Providers;
