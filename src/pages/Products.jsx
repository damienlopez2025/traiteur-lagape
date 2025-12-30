import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { storage } from '../utils/storage';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Table from '../components/Table';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [productForm, setProductForm] = useState({
        name: '',
        priceTtc: '',
        costHt: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const pr = await storage.getProducts();
        setProducts(pr);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.priceTtc || !productForm.costHt) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        await storage.addProduct({
            ...productForm,
            priceTtc: parseFloat(productForm.priceTtc),
            costHt: parseFloat(productForm.costHt),
        });
        setProductForm({ name: '', priceTtc: '', costHt: '' });
        loadData();
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
            await storage.deleteProduct(id);
            loadData();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Gestion des Produits</h1>
            </div>

            <div className="grid-aside-main">
                <Card title="Nouveau Produit" style={{ height: 'fit-content' }}>
                    <form onSubmit={handleAddProduct}>
                        <Input
                            label="Nom du produit"
                            id="prodName"
                            value={productForm.name}
                            onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="Ex: Tournedos Rossini"
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
                    <Table headers={['Produit', 'Prix TTC', 'Coût HT', 'Action']}>
                        {products.map(p => (
                            <tr key={p.id} style={{ opacity: 1 }}>
                                <td style={{ fontWeight: 500 }}>{p.name}</td>
                                <td>{p.priceTtc?.toFixed(2)}</td>
                                <td>{p.costHt?.toFixed(2)}</td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteProduct(p.id)}
                                        className="btn-danger"
                                        style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--color-error)', color: 'var(--color-error)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Trash2 size={14} /> Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr><td colSpan="5" className="text-center">Aucun produit.</td></tr>
                        )}
                    </Table>
                </Card>
            </div>
        </div>
    );
};

export default Products;
