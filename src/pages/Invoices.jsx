import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye } from 'lucide-react';
import { storage } from '../utils/storage';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';

const Invoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setLoading(true);
        const data = await storage.getInvoices();
        setInvoices(data);
        setLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-CH');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(price);
    };

    // Calculate total from invoice object (stored in 'totals' usually)
    const getInvoiceTotal = (invoice) => {
        if (invoice.totals && invoice.totals.totalTtc) {
            return invoice.totals.totalTtc;
        }
        return 0;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Mes Factures</h1>
            </div>

            <Card>
                {loading ? (
                    <div className="text-center p-4">Chargement...</div>
                ) : (
                    <Table headers={['Date', 'Numéro', 'Client', 'Montant TTC', 'Actions']}>
                        {invoices.map(invoice => (
                            <tr key={invoice.id}>
                                <td>{formatDate(invoice.date)}</td>
                                <td style={{ fontWeight: 500 }}>{invoice.invoiceNumber}</td>
                                <td>{invoice.clientName}</td>
                                <td>{formatPrice(getInvoiceTotal(invoice))}</td>
                                <td>
                                    {/* Placeholder for future "View/Edit" action. 
                                        For now, maybe just show we can't do much yet or link to a details page if it existed.
                                        But user didn't ask for details page yet, just list. 
                                        I'll add a dummy button or link to create page if editable? 
                                        Actually, InvoiceCreate is for NEW.
                                        Let's just show the row. */}
                                    <Button
                                        variant="secondary"
                                        onClick={() => console.log('View invoice', invoice.id)}
                                        style={{ padding: '4px 8px' }}
                                    >
                                        <Eye size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr><td colSpan="5" className="text-center">Aucune facture trouvée.</td></tr>
                        )}
                    </Table>
                )}
            </Card>
        </div>
    );
};

export default Invoices;
