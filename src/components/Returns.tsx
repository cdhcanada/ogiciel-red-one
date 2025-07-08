import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Plus, 
  Search,
  Package,
  Save,
  X,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';
import { database } from '../utils/database';
import { Invoice, ReturnItem } from '../types';
import { format } from 'date-fns';

const Returns: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    quantity: '',
    reason: '',
    refundAmount: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesData, returnsData] = await Promise.all([
        database.getAllInvoices(),
        database.getAllReturns()
      ]);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setReturns(Array.isArray(returnsData) ? returnsData : []);
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
    if (!selectedInvoice || !selectedItem) return;

    try {
      const returnItem: ReturnItem = {
        id: Date.now().toString(),
        originalInvoiceId: selectedInvoice.id,
        productId: selectedItem.productId,
        product: selectedItem.product,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        returnDate: new Date(),
        refundAmount: parseFloat(formData.refundAmount),
        status: 'pending'
      };

      await database.addReturn(returnItem);
      
      // Update product quantity (add back to stock)
      const newQuantity = selectedItem.product.quantity + returnItem.quantity;
      await database.updateProductQuantity(selectedItem.productId, newQuantity);

      resetForm();
      setIsModalOpen(false);
      loadData();
      alert('تم تسجيل المرتجع بنجاح');
    } catch (error) {
      console.error('Error processing return:', error);
      alert('خطأ في تسجيل المرتجع');
    }
  };

  const resetForm = () => {
    setFormData({
      quantity: '',
      reason: '',
      refundAmount: ''
    });
    setSelectedInvoice(null);
    setSelectedItem(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المرتجعات</h1>
          <p className="text-gray-600 mt-1">معالجة مرتجعات العملاء واسترداد الأموال</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center space-x-2 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة مرتجع</span>
        </button>
      </div>

      {/* Returns List */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <RotateCcw className="h-6 w-6 mr-3" />
            قائمة المرتجعات
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">رقم الفاتورة</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">المنتج</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الكمية</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">السبب</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">مبلغ الاسترداد</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">التاريخ</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الحالة</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returns.map((returnItem) => (
                <tr key={returnItem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    #{returnItem.originalInvoiceId.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{returnItem.product.name}</div>
                        <div className="text-sm text-gray-500">{returnItem.product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{returnItem.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{returnItem.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {returnItem.refundAmount.toLocaleString()} د.ج
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(returnItem.returnDate), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnItem.status)}`}>
                      {getStatusText(returnItem.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Return Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">إضافة مرتجع جديد</h2>
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      onClick={() => setSelectedInvoice(invoice)}
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
            ) : !selectedItem ? (
              <div>
                <div className="p-4 bg-gray-50 rounded-xl mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">الفاتورة المحددة:</h3>
                  <p className="text-gray-700">فاتورة #{selectedInvoice.id.slice(-8)}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(selectedInvoice.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    تغيير الفاتورة
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 mb-4">اختر المنتج للإرجاع:</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedInvoice.items.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedItem(item)}
                      className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-500">{item.product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">الكمية: {item.quantity}</p>
                          <p className="text-sm text-green-600">{item.total.toLocaleString()} د.ج</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">تفاصيل الإرجاع:</h3>
                  <p className="text-gray-700">المنتج: {selectedItem.product.name}</p>
                  <p className="text-sm text-gray-500">الكمية الأصلية: {selectedItem.quantity}</p>
                  <p className="text-sm text-gray-500">السعر: {selectedItem.price.toLocaleString()} د.ج</p>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    تغيير المنتج
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الكمية المرتجعة
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedItem.quantity}
                    value={formData.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value) || 0;
                      const refund = qty * selectedItem.price;
                      setFormData({ 
                        ...formData, 
                        quantity: e.target.value,
                        refundAmount: refund.toString()
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    سبب الإرجاع
                  </label>
                  <textarea
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="اكتب سبب الإرجاع..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    مبلغ الاسترداد (د.ج)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.refundAmount}
                    onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center justify-center space-x-2 font-semibold transition-all duration-200"
                  >
                    <Save className="h-5 w-5" />
                    <span>تسجيل المرتجع</span>
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

export default Returns;