import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Table from '../components/Table';

const Products = () => {
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'providers'
    const [providers, setProviders] = useState([]);
    const [products, setProducts] = useState([]);

    // Form States
    const [newProviderName, setNewProviderName] = useState('');
    const [productForm, setProductForm] = useState({
        name: '',
        providerId: '',
        priceTtc: '',
        costHt: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await storage.getProviders();
        setProviders(p);
        const pr = await storage.getProducts();
        setProducts(pr);
    };

    // --- Providers Logic ---
    const handleAddProvider = async (e) => {
        e.preventDefault();
        if (!newProviderName.trim()) return;
        await storage.addProvider(newProviderName);
        setNewProviderName('');
        loadData();
    };

    // --- Products Logic ---
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.providerId || !productForm.priceTtc || !productForm.costHt) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        await storage.addProduct({
            ...productForm,
            priceTtc: parseFloat(productForm.priceTtc),
            costHt: parseFloat(productForm.costHt),
        });
        setProductForm({ name: '', providerId: '', priceTtc: '', costHt: '' });
        loadData();
    };

    const toggleProductActive = async (id, currentStatus) => {
        await storage.updateProduct(id, { active: !currentStatus });
        loadData();
    };

    const getProviderName = (id) => providers.find(p => p.id === id)?.name || 'Inconnu';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Gestion des Produits & Prestataires</h1>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <Button
                        variant={activeTab === 'products' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('products')}
                    >
                        Produits
                    </Button>
                    <Button
                        variant={activeTab === 'providers' ? 'secondary' : 'secondary'}
                        className={activeTab === 'providers' ? 'btn-primary' : ''} // Quick styling hack or fix variant logic
                        style={activeTab === 'providers' ? { backgroundColor: 'var(--color-secondary)', color: 'white', borderColor: 'var(--color-secondary)' } : {}}
                        onClick={() => setActiveTab('providers')}
                    >
                        Prestataires
                    </Button>
                </div>
            </div>

            {activeTab === 'providers' && (
                <div className="grid-1-2">
                    <Card title="Ajouter un prestataire">
                        <form onSubmit={handleAddProvider}>
                            <Input
                                label="Nom du prestataire"
                                id="providerName"
                                value={newProviderName}
                                onChange={e => setNewProviderName(e.target.value)}
                                placeholder="Ex: Boulangerie Ducoin"
                            />
                            <Button type="submit" variant="primary" style={{ width: '100%' }}>
                                <Plus size={18} style={{ marginRight: '8px' }} />
                                Ajouter
                            </Button>
                        </form>
                    </Card>

                    <Card title="Liste des prestataires">
                        <Table headers={['Nom', 'ID']}>
                            {providers.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>{p.id}</td>
                                </tr>
                            ))}
                            {providers.length === 0 && (
                                <tr><td colSpan="2" className="text-center">Aucun prestataire.</td></tr>
                            )}
                        </Table>
                    </Card>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="grid-aside-main">
                    <Card title="Nouveau Produit" style={{ height: 'fit-content' }}>
                        <form onSubmit={handleAddProduct}>
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-light)' }}>
                                    Prestataire
                                </label>
                                <select
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                                    value={productForm.providerId}
                                    onChange={e => setProductForm({ ...productForm, providerId: e.target.value })}
                                    required
                                >
                                    <option value="">Choisir...</option>
                                    {providers.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Nom du produit"
                                id="prodName"
                                value={productForm.name}
                                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                placeholder="Ex: Baguette tradition"
                                required
                            />

                            <Input
                                label="Prix Vente TTC (CHF)"
                                id="prodPrice"
                                type="number"
                                step="0.05"
                                value={productForm.priceTtc}
                                onChange={e => setProductForm({ ...productForm, priceTtc: e.target.value })}
                                required
                            />

                            <Input
                                label="Coût HT (CHF)"
                                id="prodCost"
                                type="number"
                                step="0.05"
                                value={productForm.costHt}
                                onChange={e => setProductForm({ ...productForm, costHt: e.target.value })}
                                required
                            />

                            <Button type="submit" variant="primary" style={{ width: '100%' }}>
                                <Plus size={18} style={{ marginRight: '8px' }} />
                                Enregistrer
                            </Button>
                        </form>
                    </Card>

                    <Card title="Catalogue Produits">
                        <Table headers={['Produit', 'Prestataire', 'Prix TTC', 'Coût HT', 'Statut', 'Actions']}>
                            {products.map(p => (
                                <tr key={p.id} style={{ opacity: p.active ? 1 : 0.6 }}>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td>{getProviderName(p.providerId)}</td>
                                    <td>{p.priceTtc?.toFixed(2)}</td>
                                    <td>{p.costHt?.toFixed(2)}</td>
                                    <td>
                                        {p.active ?
                                            <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Actif</span> :
                                            <span style={{ color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={14} /> Inactif</span>
                                        }
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleProductActive(p.id, p.active)}
                                            className="btn-secondary"
                                            style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        >
                                            {p.active ? 'Désactiver' : 'Activer'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan="6" className="text-center">Aucun produit. Commencez par ajouter un prestataire puis un produit.</td></tr>
                            )}
                        </Table>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Products;
