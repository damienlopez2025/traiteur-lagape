import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, ArrowLeft, Save, FileText } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateInvoice, generateCostSheet } from '../utils/pdfGenerator';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const InvoiceCreate = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [products, setProducts] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        clientName: '',
        clientAddress: '',
        deliveryAddress: '',
        contact: '',
        note: '',
        providerId: '',

        // Delivery
        hasDelivery: false,
        deliveryTtc: 0,
        deliveryCostHt: 0,
    });

    const [lines, setLines] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const p = await storage.getProviders();
            const pr = await storage.getProducts();
            setProviders(p);
            setProducts(pr);
        };
        loadData();
    }, []);

    const handleProviderChange = (e) => {
        const pid = e.target.value;
        const selectedProvider = providers.find(p => p.id === pid);

        // Auto-fill client address and contact with Provider's info
        let newAddress = '';
        let newContact = '';
        if (selectedProvider) {
            newAddress = `${selectedProvider.address_street || ''} ${selectedProvider.address_number || ''}, ${selectedProvider.address_npa || ''} ${selectedProvider.address_city || ''}`.trim();
            newContact = `${selectedProvider.phone || ''} ${selectedProvider.email || ''}`.trim();
        }

        setFormData(prev => ({
            ...prev,
            providerId: pid,
            clientAddress: newAddress,
            contact: newContact
        }));

        if (lines.length > 0 && confirm('Changer de prestataire effacera les lignes actuelles. Continuer ?')) {
            setLines([]);
        } else if (lines.length > 0) {
            // If cancelled, reverting logic is complex, simpler to just warn.
            // For now, let's just clear if they confuse providers.
        }
    };

    // --- Delivery Logic ---
    const handleDeliveryChange = (e) => {
        const checked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            hasDelivery: checked,

            deliveryTtc: checked ? 25.00 : 0, // Fixed price 25 CHF
            deliveryCostHt: 0 // Cost assumed 0 as per instructions
        }));
    };

    // --- Line Management ---
    const addLine = () => {
        if (!formData.providerId) {
            alert('Veuillez d\'abord sélectionner un prestataire.');
            return;
        }
        setLines([...lines, {
            id: uuidv4(),
            productId: '',
            quantity: 1,
            priceTtc: 0,
            costHt: 0
        }]);
    };

    const removeLine = (id) => {
        setLines(lines.filter(l => l.id !== id));
    };

    const updateLine = (id, field, value) => {
        setLines(lines.map(l => {
            if (l.id !== id) return l;

            const updates = { [field]: value };

            // Auto-fill price/cost if product selected
            if (field === 'productId') {
                const prod = products.find(p => p.id === value);
                if (prod) {
                    updates.priceTtc = prod.priceTtc;
                    updates.costHt = prod.costHt;
                }
            }

            return { ...l, ...updates };
        }));
    };

    // --- Calculations ---
    const calculateTotals = () => {
        // 1. Food (TVA 2.6%)
        let foodTtc = 0;
        let foodHt = 0;
        let totalCostHt = 0;

        lines.forEach(l => {
            const q = parseFloat(l.quantity) || 0;
            const pTtc = parseFloat(l.priceTtc) || 0;
            const cHt = parseFloat(l.costHt) || 0;

            const lineTtc = q * pTtc;
            const lineCost = q * cHt;

            foodTtc += lineTtc;
            foodHt += lineTtc / 1.026;
            totalCostHt += lineCost;
        });

        // 2. Delivery (TVA 8.1%)
        let deliveryTtc = 0;
        let deliveryHt = 0;
        if (formData.hasDelivery) {
            const dTtc = 25.00; // Fixed
            // deliveryCostHt is separate if we want to track it
            const dCost = parseFloat(formData.deliveryCostHt) || 0;

            deliveryTtc = dTtc;
            deliveryHt = dTtc / 1.081;
            totalCostHt += dCost;
        }

        const totalTtc = foodTtc + deliveryTtc;
        const totalHt = foodHt + deliveryHt;
        const netProfit = totalHt - totalCostHt;
        const bonus = Math.max(0, netProfit * 0.30);

        // TVA
        const tva26 = foodTtc - foodHt;
        const tva81 = deliveryTtc - deliveryHt;

        return { totalTtc, totalHt, totalCostHt, netProfit, bonus, tva26, tva81, foodTtc, deliveryTtc };
    };

    const totals = calculateTotals();

    // --- Save ---
    const handleSave = async () => {
        if (!formData.clientName || !formData.providerId || lines.length === 0) {
            alert('Veuillez remplir les champs obligatoires (Client, Prestataire, et au moins une ligne).');
            return;
        }

        const invoice = {
            id: uuidv4(),
            invoiceNumber: `LAG-${new Date().getFullYear()}-${uuidv4().slice(0, 4).toUpperCase()}`, // Simple dummy number
            createdAt: new Date().toISOString(),
            ...formData,
            lines,
            totals // Save computed totals for easier reporting later, or recompute? Saving snapshot is safer.
        };

        try {
            await storage.saveInvoice(invoice);
            alert('Facture enregistrée !');
            navigate('/mois'); // Go to Month Dashboard
        } catch (error) {
            alert('Erreur lors de l\'enregistrement de la facture. Veuillez réessayer.');
            console.error(error);
        }
    };

    const filteredProducts = products.filter(p =>
        String(p.providerId) === String(formData.providerId) &&
        p.active !== false
    );

    return (
        <div className="grid-2-1" style={{ paddingBottom: '100px' }}>

            {/* LEFT COLUMN: FORM */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                    <Button variant="secondary" onClick={() => navigate('/')} style={{ padding: '8px' }}>
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 style={{ fontSize: '1.8rem' }}>Nouveau Traiteur</h1>
                </div>

                <Card title="Infos Événement" className="mb-md">
                    <div className="flex-row-mobile-col" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ flex: 1 }}>
                            <label>Prestataire *</label>
                            <select
                                value={formData.providerId}
                                onChange={handleProviderChange}
                                style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                            >
                                <option value="">Sélectionner...</option>
                                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div style={{ flex: 1 }}>
                            <Input
                                label="Date de l'événement"
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <Input
                        label="Client / Société (Nom)"
                        placeholder="Nom du client"
                        value={formData.clientName}
                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    />

                    {/* Hidden Address/Contact fields - Removed as per user request to only have Client Name */}
                </Card>

                <Card title="Lignes Food / Boisson (TVA 2.6%)">
                    {lines.map((line, index) => (
                        <div key={line.id} className="mobile-stack" style={{ alignItems: 'flex-end', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #eee' }}>
                            <div style={{ flex: 3, width: '100%' }}>
                                <label style={{ fontSize: '0.8rem' }}>Produit</label>
                                <select
                                    value={line.productId}
                                    onChange={e => updateLine(line.id, 'productId', e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                                >
                                    <option value="">Choisir produit...</option>
                                    {filteredProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-row-mobile-col mobile-full-width" style={{ flex: 3, gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem' }}>Qté</label>
                                    <input
                                        type="number"
                                        value={line.quantity}
                                        onChange={e => updateLine(line.id, 'quantity', e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem' }}>Prix TTC</label>
                                    <input
                                        type="number" step="0.05"
                                        value={line.priceTtc}
                                        onChange={e => updateLine(line.id, 'priceTtc', e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem' }}>Coût HT</label>
                                    <input
                                        type="number" step="0.05"
                                        value={line.costHt}
                                        onChange={e => updateLine(line.id, 'costHt', e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                            </div>
                            <button onClick={() => removeLine(line.id)} style={{ padding: '8px', color: 'var(--color-danger)' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    <Button variant="secondary" onClick={addLine} style={{ marginTop: '8px', width: '100%', borderStyle: 'dashed' }}>
                        <Plus size={16} style={{ marginRight: '8px' }} /> Ajouter un produit
                    </Button>
                </Card>

                <Card title="Livraison (TVA 8.1%)" style={{ marginTop: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <input
                            type="checkbox"
                            id="hasDelivery"
                            checked={formData.hasDelivery}
                            onChange={handleDeliveryChange}
                            style={{ width: '20px', height: '20px', marginRight: '8px' }}
                        />
                        <label htmlFor="hasDelivery" style={{ fontSize: '1rem', margin: 0 }}>Ajouter une livraison (25.00 CHF TTC)</label>
                    </div>
                </Card>
            </div>

            {/* RIGHT COLUMN: PREVIEW & ACTIONS */}
            <div>
                <div style={{ position: 'sticky', top: '80px' }}>
                    <Card title="Résumé Live" style={{ backgroundColor: '#2e475d', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Ventes TTC :</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{totals.totalTtc.toFixed(2)} CHF</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', opacity: 0.8 }}>
                            <span>dont TVA 2.6% :</span>
                            <span>{totals.tva26.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', opacity: 0.8 }}>
                            <span>dont TVA 8.1% :</span>
                            <span>{totals.tva81.toFixed(2)}</span>
                        </div>

                        <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '16px 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Ventes HT :</span>
                            <span>{totals.totalHt.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span>Total Coûts HT :</span>
                            <span>{totals.totalCostHt.toFixed(2)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 'bold' }}>Bénéfice Net :</span>
                            <span style={{ fontWeight: 'bold', color: '#4ade80' }}>{totals.netProfit.toFixed(2)}</span>
                        </div>
                        {/* Prime display removed as requested */}


                        <Button
                            variant="primary"
                            onClick={handleSave}
                            style={{ width: '100%', backgroundColor: '#ff5c35', color: 'white', marginBottom: '12px' }}
                        >
                            <Save size={18} style={{ marginRight: '8px' }} />
                            Enregistrer l'événement
                        </Button>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                                variant="secondary"
                                onClick={() => generateInvoice({ ...formData, lines, totals }, products)}
                                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
                            >
                                <FileText size={16} /> Facture
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => generateCostSheet({ ...formData, lines, totals }, products)}
                                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
                            >
                                <FileText size={16} /> Coûts
                            </Button>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '8px', opacity: 0.6 }}>Exports dispos après enregistrement</p>

                    </Card>
                </div>
            </div >
        </div >
    );
};

export default InvoiceCreate;
