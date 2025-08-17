
import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (seller, buyer, auction) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });


    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Auction ID: ${auction.id}`);
    doc.text(`Item: ${auction.itemName}`);
    doc.text(`Final Price: ₹${auction.currentPrice}`);
    doc.moveDown();
    doc.text('--- Details ---');
    doc.text(`Seller: ${seller.username} (${seller.email})`);
    doc.text(`Buyer: ${buyer.username} (${buyer.email})`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.end();
  });
};