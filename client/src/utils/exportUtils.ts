import { Reagent, Order, Project } from '../types';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportReagentsToCSV = (reagents: Reagent[]) => {
  const data = reagents.map(r => ({
    Name: r.name,
    Vendor: r.vendor,
    'Catalog Number': r.catalogNumber,
    'Lot Number': r.lotNumber || '',
    Quantity: `${r.quantity} ${r.unit}`,
    'Storage Location': r.storageLocation,
    'Storage Temp': r.storageTemp || '',
    'Received Date': new Date(r.receivedDate).toLocaleDateString(),
    'Expiration Date': r.expirationDate ? new Date(r.expirationDate).toLocaleDateString() : '',
    'Low Stock': r.isLowStock ? 'Yes' : 'No',
    'Handling Notes': r.handlingNotes || '',
  }));

  exportToCSV(data, 'reagents-inventory');
};

export const exportOrdersToCSV = (orders: Order[]) => {
  const data = orders.map(o => ({
    'Order Number': o.orderNumber,
    Item: o.itemName,
    Vendor: o.vendor,
    'Catalog Number': o.catalogNumber,
    Quantity: o.quantity,
    'Unit Price': `$${o.unitPrice.toFixed(2)}`,
    'Total Price': `$${o.totalPrice.toFixed(2)}`,
    Status: o.status,
    'Requested Date': new Date(o.requestedDate).toLocaleDateString(),
    'Approved Date': o.approvedDate ? new Date(o.approvedDate).toLocaleDateString() : '',
    'Received Date': o.receivedDate ? new Date(o.receivedDate).toLocaleDateString() : '',
  }));

  exportToCSV(data, 'orders-list');
};

export const exportProjectsToCSV = (projects: Project[]) => {
  const data = projects.map(p => ({
    Name: p.name,
    Description: p.description || '',
    Progress: `${p.progress}%`,
    Status: p.status,
    Budget: p.budget ? `$${p.budget.toLocaleString()}` : '',
    'Budget Used': `$${p.budgetUsed.toLocaleString()}`,
    'Start Date': new Date(p.startDate).toLocaleDateString(),
    'Target End Date': p.targetEndDate ? new Date(p.targetEndDate).toLocaleDateString() : '',
  }));

  exportToCSV(data, 'projects-list');
};

// PDF Export using jsPDF
export const exportInventoryToPDF = async (reagents: Reagent[]) => {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Reagents Inventory Report', 14, 22);

  // Date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  // Table
  const tableData = reagents.map(r => [
    r.name,
    r.vendor,
    r.catalogNumber,
    `${r.quantity} ${r.unit}`,
    r.storageLocation,
    r.isLowStock ? 'Low Stock' : 'OK',
  ]);

  autoTable(doc, {
    head: [['Name', 'Vendor', 'Catalog #', 'Quantity', 'Location', 'Status']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [139, 92, 246] }, // Purple color
  });

  // Save
  doc.save(`reagents-inventory-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportLowStockReportPDF = async (reagents: Reagent[]) => {
  const lowStockReagents = reagents.filter(r => r.isLowStock);

  if (lowStockReagents.length === 0) {
    console.warn('No low stock items to export');
    return;
  }

  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFillColor(255, 152, 0);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('⚠️ Low Stock Alert Report', 14, 22);

  // Date
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  // Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Total Low Stock Items: ${lowStockReagents.length}`, 14, 50);

  // Table
  const tableData = lowStockReagents.map(r => [
    r.name,
    r.vendor,
    `${r.quantity} ${r.unit}`,
    `${r.lowStockThreshold} ${r.unit}`,
    r.storageLocation,
  ]);

  autoTable(doc, {
    head: [['Name', 'Vendor', 'Current Stock', 'Threshold', 'Location']],
    body: tableData,
    startY: 60,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [255, 152, 0] }, // Orange color
    alternateRowStyles: { fillColor: [255, 243, 224] },
  });

  // Save
  doc.save(`low-stock-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
