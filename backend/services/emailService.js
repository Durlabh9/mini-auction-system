
import sgMail from '@sendgrid/mail';
import 'dotenv/config';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendConfirmationEmails = async (seller, buyer, auction, invoiceBuffer) => {
  const attachment = {
    content: invoiceBuffer.toString('base64'),
    filename: `invoice-${auction.id}.pdf`,
    type: 'application/pdf',
    disposition: 'attachment',
  };

  const sellerMsg = {
    to: seller.email,
    from: 'durlabh.khandelwal@gmail.com', 
    subject: `Congratulations! Your item "${auction.itemName}" has been sold.`,
    text: `Your item, ${auction.itemName}, was sold for $${auction.currentPrice} to ${buyer.username}. An invoice is attached.`,
    attachments: [attachment],
  };

  const buyerMsg = {
    to: buyer.email,
    from: 'durlabh.khandelwal@gmail.com', 
    subject: `Congratulations! You won the auction for "${auction.itemName}".`,
    text: `You have successfully won the auction for ${auction.itemName} with a bid of $${auction.currentPrice}. An invoice is attached.`,
    attachments: [attachment],
  };

  try {
    await sgMail.send(sellerMsg);
    await sgMail.send(buyerMsg);
    console.log('✅ Confirmation emails sent successfully.');
  } catch (error) {
    console.error('❌ Error sending emails:', error.response?.body);
  }
};