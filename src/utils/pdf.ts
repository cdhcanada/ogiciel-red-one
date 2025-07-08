import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../types';
import { format } from 'date-fns';

// إضافة خط عربي مدمج
const addArabicFont = (doc: jsPDF) => {
  // استخدام خط افتراضي يدعم العربية
  doc.addFont('https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.woff2', 'Amiri', 'normal');
};

export const generateInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    // إنشاء عنصر HTML للفاتورة
    const invoiceElement = createInvoiceHTML(invoice);
    document.body.appendChild(invoiceElement);

    // تحويل HTML إلى صورة
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // إزالة العنصر من DOM
    document.body.removeChild(invoiceElement);

    // إنشاء PDF
    const doc = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // حفظ الملف
    doc.save(`فاتورة-${invoice.id.slice(-8)}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // استخدام الطريقة البديلة
    generateSimplePDF(invoice);
  }
};

const createInvoiceHTML = (invoice: Invoice): HTMLElement => {
  const storeInfo = JSON.parse(localStorage.getItem('storeInfo') || '{}');
  
  const div = document.createElement('div');
  div.style.cssText = `
    width: 794px;
    padding: 40px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: white;
    direction: rtl;
    text-align: right;
    color: #000;
  `;

  div.innerHTML = `
    <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="color: #3b82f6; font-size: 28px; margin: 0; font-weight: bold;">
        ${storeInfo.name || 'محل الإكسسوارات والإلكترونيات'}
      </h1>
      <p style="color: #6b7280; font-size: 16px; margin: 5px 0;">
        ${storeInfo.nameEn || 'Electronics & Accessories Store'}
      </p>
      <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
        ${storeInfo.address || 'الجزائر العاصمة، الجزائر'}
      </p>
      <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
        هاتف: ${storeInfo.phone || '+213 XXX XXX XXX'} | 
        بريد: ${storeInfo.email || 'info@store.dz'}
      </p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div>
        <h2 style="color: #dc2626; font-size: 24px; margin: 0;">فاتورة بيع</h2>
        <p style="color: #374151; margin: 5px 0;">رقم الفاتورة: #${invoice.id.slice(-8)}</p>
        <p style="color: #374151; margin: 5px 0;">التاريخ: ${format(invoice.createdAt, 'dd/MM/yyyy HH:mm')}</p>
        ${invoice.customerName ? `<p style="color: #374151; margin: 5px 0;">العميل: ${invoice.customerName}</p>` : ''}
        ${invoice.customerPhone ? `<p style="color: #374151; margin: 5px 0;">الهاتف: ${invoice.customerPhone}</p>` : ''}
      </div>
      <div style="text-align: left;">
        <div style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px;">طريقة الدفع</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold;">
            ${invoice.paymentMethod === 'cash' ? 'نقداً' : 
              invoice.paymentMethod === 'card' ? 'بطاقة' : 'تحويل'}
          </p>
        </div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">المنتج</th>
          <th style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">الكمية</th>
          <th style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">السعر</th>
          <th style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">المجموع</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item, index) => `
          <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
            <td style="padding: 12px; border: 1px solid #d1d5db;">
              <div style="font-weight: bold;">${item.product.name}</div>
              <div style="color: #6b7280; font-size: 12px;">${item.product.category}</div>
            </td>
            <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">${item.price.toLocaleString()} د.ج</td>
            <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center; font-weight: bold;">${item.total.toLocaleString()} د.ج</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>المجموع الفرعي:</span>
            <span style="font-weight: bold;">${invoice.subtotal.toLocaleString()} د.ج</span>
          </div>
          ${invoice.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #dc2626;">
              <span>الخصم:</span>
              <span style="font-weight: bold;">-${invoice.discount.toLocaleString()} د.ج</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding: 15px; background: #22c55e; color: white; border-radius: 8px; font-size: 18px; font-weight: bold;">
            <span>الإجمالي:</span>
            <span>${invoice.total.toLocaleString()} د.ج</span>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top: 40px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">شكراً لتعاملكم معنا</p>
      <p style="margin: 5px 0; font-size: 14px;">Thank you for your business</p>
      <p style="margin: 15px 0; font-size: 12px;">هذه الفاتورة مُنشأة إلكترونياً - تاريخ الإنشاء: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
    </div>
  `;

  return div;
};

const generateSimplePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();
  
  // إعداد الخط للعربية
  doc.setFont('helvetica');
  
  const storeInfo = JSON.parse(localStorage.getItem('storeInfo') || '{}');
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text(storeInfo.name || 'محل الإكسسوارات والإلكترونيات', 20, 25);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(storeInfo.nameEn || 'Electronics & Accessories Store', 20, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text(storeInfo.address || 'الجزائر العاصمة، الجزائر', 20, 45);
  
  // Invoice details
  doc.setFontSize(16);
  doc.setTextColor(220, 53, 69);
  doc.text('Invoice / فاتورة بيع', 20, 60);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #: ${invoice.id.slice(-8)}`, 20, 75);
  doc.text(`Date: ${format(invoice.createdAt, 'dd/MM/yyyy HH:mm')}`, 20, 85);
  
  if (invoice.customerName) {
    doc.text(`Customer: ${invoice.customerName}`, 20, 95);
  }
  
  // Items table
  let yPos = 110;
  doc.setFontSize(10);
  
  // Table header
  doc.setFillColor(59, 130, 246);
  doc.rect(20, yPos - 5, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Product', 25, yPos);
  doc.text('Qty', 90, yPos);
  doc.text('Price', 120, yPos);
  doc.text('Total', 150, yPos);
  
  yPos += 15;
  doc.setTextColor(0, 0, 0);
  
  // Items
  invoice.items.forEach((item) => {
    doc.text(item.product.name, 25, yPos);
    doc.text(item.quantity.toString(), 90, yPos);
    doc.text(`${item.price.toLocaleString()} DZD`, 120, yPos);
    doc.text(`${item.total.toLocaleString()} DZD`, 150, yPos);
    yPos += 10;
  });
  
  // Totals
  yPos += 10;
  doc.text(`Subtotal: ${invoice.subtotal.toLocaleString()} DZD`, 120, yPos);
  
  if (invoice.discount > 0) {
    yPos += 10;
    doc.text(`Discount: ${invoice.discount.toLocaleString()} DZD`, 120, yPos);
  }
  
  yPos += 15;
  doc.setFontSize(14);
  doc.setTextColor(34, 197, 94);
  doc.text(`Total: ${invoice.total.toLocaleString()} DZD`, 120, yPos);
  
  // Footer
  yPos += 30;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Thank you for your business', 20, yPos);
  
  doc.save(`invoice-${invoice.id.slice(-8)}.pdf`);
};