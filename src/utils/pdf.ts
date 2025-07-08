import jsPDF from 'jspdf';
import { Invoice } from '../types';
import { format } from 'date-fns';

export const generateInvoicePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();
  
  // Header with store info
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('محل الإكسسوارات والإلكترونيات', 20, 25);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('إكسسوارات الهواتف - سماعات - بطاريات - كابلات', 20, 35);
  
  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128);
  doc.text('الجزائر - Algeria', 20, 45);
  
  // Invoice title
  doc.setFontSize(20);
  doc.setTextColor(220, 53, 69);
  doc.text('فاتورة بيع / Invoice', 20, 60);
  
  // Invoice details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`رقم الفاتورة: ${invoice.id}`, 20, 75);
  doc.text(`التاريخ: ${format(invoice.createdAt, 'dd/MM/yyyy HH:mm')}`, 20, 85);
  
  if (invoice.customerName) {
    doc.text(`العميل: ${invoice.customerName}`, 20, 95);
  }
  if (invoice.customerPhone) {
    doc.text(`الهاتف: ${invoice.customerPhone}`, 20, 105);
  }
  
  // Payment method
  const paymentMethods = {
    cash: 'نقداً',
    card: 'بطاقة',
    transfer: 'تحويل'
  };
  doc.text(`طريقة الدفع: ${paymentMethods[invoice.paymentMethod]}`, 20, invoice.customerName || invoice.customerPhone ? 115 : 105);
  
  // Table header
  const startY = invoice.customerName || invoice.customerPhone ? 130 : 120;
  doc.setFontSize(11);
  doc.setFillColor(59, 130, 246);
  doc.rect(20, startY - 5, 170, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.text('المنتج', 25, startY);
  doc.text('الكمية', 90, startY);
  doc.text('السعر', 120, startY);
  doc.text('المجموع', 150, startY);
  
  // Items
  let currentY = startY + 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  
  invoice.items.forEach((item, index) => {
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, currentY - 8, 170, 12, 'F');
    }
    
    doc.text(item.product.name, 25, currentY);
    doc.text(item.quantity.toString(), 95, currentY);
    doc.text(`${item.price.toLocaleString()} د.ج`, 120, currentY);
    doc.text(`${item.total.toLocaleString()} د.ج`, 150, currentY);
    currentY += 12;
  });
  
  // Totals section
  currentY += 10;
  doc.setDrawColor(59, 130, 246);
  doc.line(20, currentY, 190, currentY);
  currentY += 15;
  
  doc.setFontSize(11);
  doc.text(`المجموع الفرعي: ${invoice.subtotal.toLocaleString()} د.ج`, 120, currentY);
  currentY += 10;
  
  if (invoice.discount > 0) {
    doc.setTextColor(220, 53, 69);
    doc.text(`الخصم: ${invoice.discount.toLocaleString()} د.ج`, 120, currentY);
    currentY += 10;
  }
  
  // Total
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(34, 197, 94);
  doc.rect(115, currentY - 5, 75, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(`الإجمالي: ${invoice.total.toLocaleString()} د.ج`, 120, currentY + 5);
  
  // Footer
  currentY += 30;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('شكراً لتعاملكم معنا', 20, currentY);
  doc.text('Thank you for your business', 20, currentY + 10);
  
  doc.setFontSize(8);
  doc.text('هذه الفاتورة مُنشأة إلكترونياً ولا تحتاج إلى توقيع', 20, currentY + 25);
  doc.text('This invoice is electronically generated', 20, currentY + 35);
  
  // Save the PDF
  doc.save(`فاتورة-${invoice.id}.pdf`);
};