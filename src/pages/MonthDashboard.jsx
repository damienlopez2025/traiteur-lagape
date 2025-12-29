import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateInvoice, generateCostSheet } from '../utils/pdfGenerator';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';

const MonthDashboard = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [providers, setProviders] = useState([]);
    const [stats, setStats] = useState({
        caTtc: 0, caHt: 0, costsHt: 0, netProfit: 0, bonus: 0, tva26: 0, tva81: 0
    });

    // Current Month Logic (Simple: Local time)
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();

    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    useEffect(() => {
        const loadData = async () => {
            const allInvoices = await storage.getInvoices();
            const allProducts = await storage.getProducts(); // Used for export

            setProducts(allProducts);

            // Filter for current month
            const filtered = allInvoices.filter(inv => {
                const d = new Date(inv.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            setInvoices(filtered);

            // Compute stats
            const newStats = filtered.reduce((acc, inv) => {
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

            setStats(newStats);
        };
        loadData();
    }, []);

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
                <h1 style={{ fontSize: '1.8rem' }}>Mois : {monthNames[currentMonth]} {currentYear}</h1>
                <Button onClick={() => navigate('/nouveau')}>+ Nouveau Traiteur</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <Card>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>CA TTC</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatPrice(stats.caTtc)}</div>
                </Card>
                <Card>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>CA HT</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatPrice(stats.caHt)}</div>
                </Card>
                <Card>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Coûts HT</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-danger)' }}>{formatPrice(stats.costsHt)}</div>
                </Card>
                <Card>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Bénéfice Net</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{formatPrice(stats.netProfit)}</div>
                </Card>
                <Card style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>
                    <div style={{ fontSize: '0.9rem', color: '#9a3412' }}>Prime Jéjé (30%)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c' }}>{formatPrice(stats.bonus)}</div>
                </Card>
            </div>

            <Card title="Devis & Factures du mois">
                <Table headers={['Date', 'Client', 'Prestataire', 'Total TTC', 'Bénéfice', 'Prime', 'Actions']}>
                    {invoices.map(inv => {
                        // Quick lookup from providers list
                        const pName = providers.find(p => p.id === inv.providerId)?.name || 'Inconnu';

                        return (
                            <tr key={inv.id}>
                                <td>{inv.date}</td>
                                <td style={{ fontWeight: 500 }}>{inv.clientName}</td>
                                <td>{pName}</td>
                                <td>{formatPrice(inv.totals?.totalTtc)}</td>
                                <td style={{ color: 'var(--color-success)' }}>{formatPrice(inv.totals?.netProfit)}</td>
                                <td style={{ color: '#ea580c', fontWeight: 500 }}>{formatPrice(inv.totals?.bonus)}</td>
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
                    {invoices.length === 0 && (
                        <tr><td colSpan="7" className="text-center" style={{ padding: '32px' }}>Aucune facture ce mois-ci.</td></tr>
                    )}
                </Table>
            </Card>

            <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                Total TVA 2.6% : <strong>{formatPrice(stats.tva26)}</strong> | Total TVA 8.1% : <strong>{formatPrice(stats.tva81)}</strong>
            </div>
        </div>
    );
};

export default MonthDashboard;
