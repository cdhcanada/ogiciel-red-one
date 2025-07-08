import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search,
  Save,
  X,
  MapPin,
  User,
  Phone,
  Calendar,
  FileText,
  Check,
  XCircle,
  Clock
} from 'lucide-react';
import { database } from '../utils/database';
import { Invoice, DeliveryReceipt } from '../types';
import { format } from 'date-fns';

const DeliveryReceipts: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deliveryReceipts, setDeliveryReceipts] = useState<DeliveryReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveredBy: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesData, receiptsData] = await Promise.all([
        database.getAllInvoices(),
        database.getAllDeliveryReceipts()
      ]);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setDeliveryReceipts(Array.isArray(receiptsData) ? receiptsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.includes(searchTerm) ||
    (invoice.customerName && invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const receipt: DeliveryReceipt = {
        id: Date.now().toString(),
        invoiceId: selectedInvoice.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        deliveryDate: new Date(),
        deliveredBy: formData.deliveredBy,
        status: 'pending',
        notes: formData.notes
      };

      await database.addDeliveryReceipt(receipt);

      resetForm();
      setIsModalOpen(false);
      loadData();
      alert('تم إنشاء وصل التسليم بنجاح');
    } catch (error) {
      console.error('Error creating delivery receipt:', error);
      alert('خطأ في إنشاء وصل التسليم');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      deliveredBy: '',
      notes: ''
    });
    setSelectedInvoice(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'delivered': return 'تم التسليم';
      case 'failed': return 'فشل التسليم';
      default: return 'غير محدد';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'delivered': return Check;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const printDeliveryReceipt = (receipt: DeliveryReceipt) => {
    const invoice = invoices.find(inv => inv.id === receipt.invoiceId);
    if (!invoice) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const storeInfo = JSON.parse(localStorage.getItem('storeInfo') || '{}');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>وصل التسليم - ${receipt.id.slice(-8)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .info-section { margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-box { border: 1px solid #333; padding: 20px; width: 200px; text-align: center; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${storeInfo.name || 'محل الإكسسوارات والإلكترونيات'}</h1>
          <h2>وصل التسليم</h2>
          <p>رقم الوصل: ${receipt.id.slice(-8)}</p>
        </div>
        
        <div class="info-section">
          <h3>معلومات الفاتورة:</h3>
          <div class="info-row">
            <span>رقم الفاتورة: ${invoice.id.slice(-8)}</span>
            <span>تاريخ الفاتورة: ${format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</span>
          </div>
          <div class="info-row">
            <span>إجمالي الفاتورة: ${invoice.total.toLocaleString()} د.ج</span>
            <span>عدد المنتجات: ${invoice.items.length}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>معلومات التسليم:</h3>
          <div class="info-row">
            <span>اسم العميل: ${receipt.customerName}</span>
            <span>رقم الهاتف: ${receipt.customerPhone}</span>
          </div>
          <div class="info-row">
            <span>عنوان التسليم: ${receipt.deliveryAddress}</span>
          </div>
          <div class="info-row">
            <span>تاريخ التسليم: ${format(new Date(receipt.deliveryDate), 'dd/MM/yyyy HH:mm')}</span>
            <span>المسلم بواسطة: ${receipt.deliveredBy}</span>
          </div>
          ${receipt.notes ? `<div class="info-row"><span>ملاحظات: ${receipt.notes}</span></div>` : ''}
        </div>

        <div class="info-section">
          <h3>تفاصيل المنتجات:</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #333;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="border: 1px solid #333; padding: 8px;">المنتج</th>
                <th style="border: 1px solid #333; padding: 8px;">الكمية</th>
                <th style="border: 1px solid #333; padding: 8px;">السعر</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td style="border: 1px solid #333; padding: 8px;">${item.product.name}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center;">${item.total.toLocaleString()} د.ج</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <p>توقيع العميل</p>
            <br><br><br>
            <p>التاريخ: ___________</p>
          </div>
          <div class="signature-box">
            <p>توقيع المسلم</p>
            <br><br><br>
            <p>التاريخ: ___________</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
          <p>شكراً لتعاملكم معنا</p>
          <p>${storeInfo.address || ''} | ${storeInfo.phone || ''}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">وصولات التسليم</h1>
          <p className="text-gray-600 mt-1">إدارة وصولات تسليم الطلبات للعملاء</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 flex items-center space-x-2 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>إنشاء وصل تسليم</span>
        </button>
      </div>

      {/* Delivery Receipts List */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Truck className="h-6 w-6 mr-3" />
            قائمة وصولات التسليم
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">رقم الوصل</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">رقم الفاتورة</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">العميل</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">العنوان</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">المسلم بواسطة</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">تاريخ التسليم</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الحالة</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveryReceipts.map((receipt) => {
                const StatusIcon = getStatusIcon(receipt.status);
                return (
                  <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      #{receipt.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      #{receipt.invoiceId.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{receipt.customerName}</div>
                        <div className="text-sm text-gray-500">{receipt.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                      {receipt.deliveryAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.deliveredBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(receipt.deliveryDate), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusText(receipt.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => printDeliveryReceipt(receipt)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Delivery Receipt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">إنشاء وصل تسليم جديد</h2>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {!selectedInvoice ? (
              <div>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="البحث برقم الفاتورة أو اسم العميل..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setFormData({
                          ...formData,
                          customerName: invoice.customerName || '',
                          customerPhone: invoice.customerPhone || ''
                        });
                      }}
                      className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">فاتورة #{invoice.id.slice(-8)}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm')}
                          </p>
                          {invoice.customerName && (
                            <p className="text-sm text-blue-600">العميل: {invoice.customerName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{invoice.total.toLocaleString()} د.ج</p>
                          <p className="text-sm text-gray-500">{invoice.items.length} منتج</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">الفاتورة المحددة:</h3>
                  <p className="text-gray-700">فاتورة #{selectedInvoice.id.slice(-8)}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(selectedInvoice.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                  <p className="text-sm text-green-600">المبلغ: {selectedInvoice.total.toLocaleString()} د.ج</p>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    تغيير الفاتورة
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      اسم العميل
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    عنوان التسليم
                  </label>
                  <textarea
                    required
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                    placeholder="أدخل العنوان الكامل للتسليم..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    المسلم بواسطة
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.deliveredBy}
                    onChange={(e) => setFormData({ ...formData, deliveredBy: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="اسم المسؤول عن التسليم"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={2}
                    placeholder="أي ملاحظات إضافية..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 flex items-center justify-center space-x-2 font-semibold transition-all duration-200"
                  >
                    <Save className="h-5 w-5" />
                    <span>إنشاء الوصل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-400 font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryReceipts;