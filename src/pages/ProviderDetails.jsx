import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { storage } from '../utils/storage';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const ProviderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        companyName: '',
        lastName: '',
        firstName: '',
        addressStreet: '',
        addressNumber: '',
        addressNpa: '',
        addressCity: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        if (id) {
            loadProvider();
        }
    }, [id]);

    const loadProvider = async () => {
        setLoading(true);
        const data = await storage.getProviderById(id);
        if (data) {
            setProvider(data);
            setFormData({
                companyName: data.companyName || '',
                lastName: data.lastName || '',
                firstName: data.firstName || '',
                addressStreet: data.addressStreet || '',
                addressNumber: data.addressNumber || '',
                addressNpa: data.addressNpa || '',
                addressCity: data.addressCity || '',
                phone: data.phone || '',
                email: data.email || ''
            });
        }
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const result = await storage.updateProvider(id, formData);
        if (result.success) {
            navigate('/prestataires');
        } else {
            alert('Erreur lors de la mise à jour: ' + (result.error?.message || 'Erreur inconnue'));
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Voulez-vous vraiment supprimer ce prestataire ?')) {
            await storage.deleteProvider(id);
            navigate('/produits'); // Go back to list
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Chargement...</div>;
    if (!provider) return <div style={{ padding: '2rem' }}>Prestataire introuvable.</div>;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Button variant="secondary" onClick={() => navigate('/produits')}>
                    <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                    Retour
                </Button>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Détails Prestataire</h1>
            </div>

            <div className="grid-1-2" style={{ gridTemplateColumns: 'minmax(300px, 600px)' }}> {/* Constrain width */}
                <Card title="Informations Générales">
                    <form onSubmit={handleSave}>
                        <Input
                            label="Société"
                            id="companyName"
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="Nom de la société"
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input
                                label="Nom"
                                id="lastName"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Nom de famille"
                            />
                            <Input
                                label="Prénom"
                                id="firstName"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Prénom"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
                            <Input
                                label="Rue"
                                id="street"
                                value={formData.addressStreet}
                                onChange={e => setFormData({ ...formData, addressStreet: e.target.value })}
                                placeholder="Rue de la Gare"
                            />
                            <Input
                                label="N°"
                                id="number"
                                value={formData.addressNumber}
                                onChange={e => setFormData({ ...formData, addressNumber: e.target.value })}
                                placeholder="12"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
                            <Input
                                label="NPA"
                                id="npa"
                                value={formData.addressNpa}
                                onChange={e => setFormData({ ...formData, addressNpa: e.target.value })}
                                placeholder="1200"
                            />
                            <Input
                                label="Ville"
                                id="city"
                                value={formData.addressCity}
                                onChange={e => setFormData({ ...formData, addressCity: e.target.value })}
                                placeholder="Genève"
                            />
                        </div>

                        <Input
                            label="Téléphone"
                            id="phone"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+41 22 123 45 67"
                        />

                        <Input
                            label="Email"
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="infos@societe.ch"
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                            <Button type="button" variant="secondary" onClick={handleDelete} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                                <Trash2 size={18} style={{ marginRight: '8px' }} />
                                Supprimer
                            </Button>
                            <Button type="submit" variant="primary">
                                <Save size={18} style={{ marginRight: '8px' }} />
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ProviderDetails;
