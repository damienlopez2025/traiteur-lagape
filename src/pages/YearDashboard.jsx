import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Filter } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateInvoice, generateCostSheet } from '../utils/pdfGenerator';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Table from '../components/Table';

const YearDashboard = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [providers, setProviders] = useState([]);
    const [products, setProducts] = useState([]);

    // Filters
    const [currentYear] = useState(new Date().getFullYear());
    const [filterMonth, setFilterMonth] = useState('');
    const [filterProvider, setFilterProvider] = useState('');
    const [filterClient, setFilterClient] = useState('');

    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    useEffect(() => {
        const loadData = async () => {
            const p = await storage.getProviders();
            setProviders(p);

            const prod = await storage.getProducts();
            setProducts(prod);

            // Load invoices
            const all = await storage.getInvoices();
            // Filter by year first
            const yearInvoices = all.filter(inv => new Date(inv.date).getFullYear() === currentYear);
            setInvoices(yearInvoices);
        };
        loadData();
    }, [currentYear]);

    // Derived filtered list
    const filteredInvoices = invoices.filter(inv => {
        const d = new Date(inv.date);
        // Month Filter
        if (filterMonth !== '') {
            if (d.getMonth() !== parseInt(filterMonth)) return false;
        }
        // Provider Filter
        if (filterProvider !== '') {
            if (inv.providerId !== filterProvider) return false;
        }
        // Client Filter
        if (filterClient !== '') {
            if (!inv.clientName.toLowerCase().includes(filterClient.toLowerCase())) return false;
        }
        return true;
    });

    const annualStats = invoices.reduce((acc, inv) => {
        const t = inv.totals || { totalTtc: 0, totalHt: 0, totalCostHt: 0, netProfit: 0, bonus: 0, tva26: 0, tva81: 0 };
        return {
            caTtc: acc.caTtc + t.totalTtc,
            caHt: acc.caHt + t.totalHt,
            costsHt: acc.costsHt + t.totalCostHt,
            netProfit: acc.netProfit + t.netProfit,
            bonus: acc.bonus + t.bonus,
            tva26: acc.tva26 + t.tva26,
            tva81: acc.tva81 + t.tva81,
        };
    }, { caTtc: 0, caHt: 0, costsHt: 0, netProfit: 0, bonus: 0, tva26: 0, tva81: 0 });

    const formatPrice = (p) => (p || 0).toFixed(2);

    const handleExport = (id, type) => {
        const inv = invoices.find(i => i.id === id);
        if (!inv) return;

        if (type === 'facture') {
            generateInvoice(inv, products);
        } else {
            generateCostSheet(inv, products);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Bilan Année {currentYear}</h1>
                <Button onClick={() => navigate('/nouveau')}>+ Nouveau Traiteur</Button>
            </div>

            {/* DASHBOARD STATS (Fixed for Year) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <Card title="CA TTC Annuel">
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatPrice(annualStats.caTtc)}</div>
                </Card>
                <Card title="Bénéfice Net Annuel">
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{formatPrice(annualStats.netProfit)}</div>
                </Card>
                <Card title="Total Prime Jérém Annuel" style={{ backgroundColor: '#fff7ed' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c' }}>{formatPrice(annualStats.bonus)}</div>
                </Card>
                <Card title="Total TVA (2.6% / 8.1%)">
                    <div style={{ fontSize: '1rem' }}>
                        <div>Food: {formatPrice(annualStats.tva26)}</div>
                        <div>Livr: {formatPrice(annualStats.tva81)}</div>
                    </div>
                </Card>
            </div>

            {/* FILTERS */}
            <Card className="mb-md" style={{ backgroundColor: '#f5f8fa' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <label>Mois</label>
                        <select style={{ width: '100%', padding: '8px' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                            <option value="">Tous les mois</option>
                            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Prestataire</label>
                        <select style={{ width: '100%', padding: '8px' }} value={filterProvider} onChange={e => setFilterProvider(e.target.value)}>
                            <option value="">Tous</option>
                            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Client</label>
                        <input
                            style={{ width: '100%', padding: '8px' }}
                            placeholder="Recherche nom..."
                            value={filterClient}
                            onChange={e => setFilterClient(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* LIST */}
            <Card title={`Factures (${filteredInvoices.length})`}>
                <Table headers={['Date', 'Client', 'Prestataire', 'Total TTC', 'Bénéfice', 'Prime', 'Actions']}>
                    {filteredInvoices.map(inv => {
                        const pName = providers.find(p => p.id === inv.providerId)?.name || 'Inconnu';
                        return (
                            <tr key={inv.id}>
                                <td>{inv.date}</td>
                                <td style={{ fontWeight: 500 }}>{inv.clientName}</td>
                                <td>{pName}</td>
                                <td>{formatPrice(inv.totals?.totalTtc)}</td>
                                <td style={{ color: 'var(--color-success)' }}>{formatPrice(inv.totals?.netProfit)}</td>
                                <td style={{ color: '#ea580c' }}>{formatPrice(inv.totals?.bonus)}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleExport(inv.id, 'facture')} title="Facture PDF" style={{ color: 'var(--color-text-light)' }}>
                                            <FileText size={18} />
                                        </button>
                                        <button onClick={() => handleExport(inv.id, 'couts')} title="Fiche Coûts" style={{ color: 'var(--color-text-light)' }}>
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredInvoices.length === 0 && (
                        <tr><td colSpan="7" className="text-center">Aucune facture trouvée pour ces filtres.</td></tr>
                    )}
                </Table>
            </Card>
        </div>
    );
};

export default YearDashboard;
