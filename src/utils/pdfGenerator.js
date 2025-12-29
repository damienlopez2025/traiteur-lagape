import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Formatter for currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(value);
};

// Formatter for date
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
};

/**
 * Generates and downloads a Client Invoice PDF
 * @param {Object} invoice - The full invoice object
 */
export const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    const primaryColor = [46, 71, 93]; // #2e475d

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("TRAITEUR L'AGAPE", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Service Traiteur Professionnel", 20, 26);

    // Invoice Info (Right aligned)
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Facture N°: ${invoice.invoiceNumber}`, 200, 20, { align: 'right' });
    doc.text(`Date: ${formatDate(invoice.createdAt)}`, 200, 25, { align: 'right' });

    // --- Client & Event Info ---
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("Facturé à :", 20, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, 52);
    if (invoice.clientAddress) doc.text(invoice.clientAddress, 20, 58);
    if (invoice.contact) doc.text(`Contact: ${invoice.contact}`, 20, 64);

    doc.setFont('helvetica', 'bold');
    doc.text("Détails de l'événement :", 110, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${formatDate(invoice.date)}`, 110, 52);
    if (invoice.deliveryAddress) {
        doc.text(`Lieu: ${invoice.deliveryAddress}`, 110, 58);
    } else {
        doc.text(`Lieu: adresse client`, 110, 58);
    }

    // --- Table Content ---
    const tableBody = invoice.lines.map(line => {
        // Find product name is tricky if we only have ID, but we saved the snapshot invoice usually?
        // Wait, in InvoiceCreate we only save IDs in 'lines'.
        // We need the product name. 
        // In the 'lines' state of InvoiceCreate, we don't strictly have the name unless we enriched it.
        // HOWEVER, we are passing the 'invoice' object which was saved.
        // Check InvoiceCreate save logic: It saves `...formData, lines, totals`. 
        // Logic gap: The saved `lines` only have IDs. We need to enrich them before PDF generation or save them enriched.
        // DECISION: I will assume the caller enriches the lines or I'll handle it if passed.
        // Better: Expect the passed invoice to have sufficient data.
        // Actually, looking at InvoiceCreate line 80-86, we only update price/cost. The name is not in the line object.
        // I should probably fetch products or expect them to be passed/looked up.
        // To be safe/clean, I will pass `products` list to this function too, or rely on caller to pass enriched lines.
        // Let's rely on the caller passing the full list of products so we can look 'em up.
        return [
            // We will fix this in logic below by passing 'products' map
            line.productId, // Placeholder, will fix
            line.quantity,
            formatCurrency(line.priceTtc),
            formatCurrency(line.quantity * line.priceTtc)
        ];
    });

    // NOTE: This function needs access to product names.
    // I'll export a wrapper or change signature to (invoice, products).
};


// Re-writing with proper signature and logic
// We need to look up product names.

export const generateInvoice = (invoice, products) => {
    const doc = new jsPDF();
    const primaryColor = [46, 71, 93];

    // Header
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("TRAITEUR L'AGAPE", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Service Traiteur & Événementiel", 15, 26);

    // Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Facture: ${invoice.invoiceNumber || 'BROUILLON'}`, 195, 20, { align: 'right' });
    doc.text(`Date: ${formatDate(invoice.createdAt || new Date())}`, 195, 25, { align: 'right' });

    // Addresses
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Client", 15, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName || 'Client inconnu', 15, 46);
    doc.text(invoice.clientAddress || '', 15, 51);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Événement", 110, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date : ${formatDate(invoice.date)}`, 110, 46);

    const productLookup = products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

    const tableRows = invoice.lines.map(line => {
        const product = productLookup[line.productId];
        const name = product ? product.name : 'Produit inconnu';
        const totalLine = line.quantity * line.priceTtc;
        return [
            name,
            line.quantity,
            formatCurrency(line.priceTtc),
            formatCurrency(totalLine)
        ];
    });

    // Add Delivery if exists
    if (invoice.hasDelivery) {
        tableRows.push([
            "Livraison",
            "1",
            formatCurrency(invoice.deliveryTtc),
            formatCurrency(invoice.deliveryTtc)
        ]);
    }

    doc.autoTable({
        startY: 65,
        head: [['Désignation', 'Qté', 'Prix Unit. TTC', 'Total TTC']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Designation
            1: { cellWidth: 20, halign: 'center' }, // Qty
            2: { cellWidth: 30, halign: 'right' }, // Price
            3: { cellWidth: 30, halign: 'right' } // Total
        }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);

    // Helper to print total line
    const printTotal = (label, value, y, isBold = false) => {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(label, 140, y);
        doc.text(formatCurrency(value), 195, y, { align: 'right' });
    };

    printTotal('Total HT :', invoice.totals.totalHt, finalY);
    printTotal('TVA (2.6% / 8.1%) :', (invoice.totals.tva26 + invoice.totals.tva81), finalY + 6);
    printTotal('Total TTC :', invoice.totals.totalTtc, finalY + 14, true);

    doc.save(`Facture_${invoice.clientName.replace(/\s+/g, '_')}_${invoice.date}.pdf`);
};

export const generateCostSheet = (invoice, products) => {
    const doc = new jsPDF();
    const primaryColor = [200, 50, 50]; // Reddish for internal

    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.text("FICHE DE COÛT (INTERNE)", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Evénement: ${invoice.clientName}`, 15, 30);
    doc.text(`Date: ${formatDate(invoice.date)}`, 15, 35);
    doc.text(`Ref: ${invoice.invoiceNumber}`, 195, 30, { align: 'right' });

    const productLookup = products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

    const tableRows = invoice.lines.map(line => {
        const product = productLookup[line.productId];
        const name = product ? product.name : 'Produit inconnu';
        const totalCost = line.quantity * line.costHt;
        return [
            name,
            line.quantity,
            formatCurrency(line.costHt),
            formatCurrency(totalCost)
        ];
    });

    if (invoice.hasDelivery) {
        tableRows.push([
            "Coût Livraison (Prestataire)",
            "1",
            formatCurrency(invoice.deliveryCostHt),
            formatCurrency(invoice.deliveryCostHt)
        ]);
    }

    doc.autoTable({
        startY: 45,
        head: [['Produit', 'Qté', 'Coût Unit. HT', 'Total Coût HT']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'right' }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Profitability Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Rentabilité", 15, finalY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const rentabData = [
        ['Chiffre d\'Affaires (HT)', formatCurrency(invoice.totals.totalHt)],
        ['Coût Total (HT)', formatCurrency(invoice.totals.totalCostHt)],
        ['Marge Brute', formatCurrency(invoice.totals.netProfit)],
        ['Marge %', `${((invoice.totals.netProfit / invoice.totals.totalHt) * 100).toFixed(1)}%`],
        ['Prime (30%)', formatCurrency(invoice.totals.bonus)]
    ];

    doc.autoTable({
        startY: finalY + 5,
        body: rentabData,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 },
            1: { halign: 'right' }
        }
    });

    doc.save(`Couts_${invoice.clientName.replace(/\s+/g, '_')}_${invoice.date}.pdf`);
};
