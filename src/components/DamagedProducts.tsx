import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Search,
  Package,
  Save,
  X,
  Check,
  XCircle,
  Calendar,
  User
} from 'lucide-react';
import { database } from '../utils/database';
import { Product, DamagedProduct } from '../types';
import { format } from 'date-fns';

const DamagedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    quantity: '',
    reason: '',
    reportedBy: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, damagedData] = await Promise.all([
        database.getAllProducts(),
        database.getAllDamagedProducts()
      ]);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setDamagedProducts(Array.isArray(damagedData) ? damagedData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const damaged: DamagedProduct = {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        product: selectedProduct,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        reportedBy: formData.reportedBy,
        reportedAt: new Date(),
        status: 'pending'
      };

      await database.addDamagedProduct(damaged);
      
      // Update product quantity
      const newQuantity = selectedProduct.quantity - damaged.quantity;
      await database.updateProductQuantity(selectedProduct.id, Math.max(0, newQuantity));

      resetForm();
      setIsModalOpen(false);
      loadData();
      alert('تم تسجيل المنتج التالف بنجاح');
    } catch (error) {
      console.error('Error reporting damaged product:', error);
      alert('خطأ في تسجيل المنتج التالف');
    }
  };

  const resetForm = () => {
    setFormData({
      quantity: '',
      reason: '',
      reportedBy: ''
    });
    setSelectedProduct(null);
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
          <h1 className="text-3xl font-bold text-gray-900">إدارة المنتجات التالفة</h1>
          <p className="text-gray-600 mt-1">تسجيل ومتابعة المنتجات التالفة والمعطوبة</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 flex items-center space-x-2 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>تسجيل منتج تالف</span>
        </button>
      </div>

      {/* Damaged Products List */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3" />
            قائمة المنتجات التالفة
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">المنتج</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الكمية</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">السبب</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">المُبلغ</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">التاريخ</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الحالة</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {damagedProducts.map((damaged) => (
                <tr key={damaged.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <Package className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{damaged.product.name}</div>
                        <div className="text-sm text-gray-500">{damaged.product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{damaged.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{damaged.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{damaged.reportedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(damaged.reportedAt), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(damaged.status)}`}>
                      {getStatusText(damaged.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Damaged Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">تسجيل منتج تالف</h2>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {!selectedProduct ? (
              <div>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="البحث عن منتج..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">الكمية: {product.quantity}</p>
                          <p className="text-sm text-gray-500">{product.salePrice.toLocaleString()} د.ج</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">المنتج المحدد:</h3>
                  <p className="text-gray-700">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">الكمية المتاحة: {selectedProduct.quantity}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    تغيير المنتج
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الكمية التالفة
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedProduct.quantity}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    سبب التلف
                  </label>
                  <textarea
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="اكتب سبب التلف..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المُبلغ بواسطة
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="اسم الموظف أو المسؤول"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 flex items-center justify-center space-x-2 font-semibold transition-all duration-200"
                  >
                    <Save className="h-5 w-5" />
                    <span>تسجيل</span>
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

export default DamagedProducts;