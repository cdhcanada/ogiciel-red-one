import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Package, 
  DollarSign,
  FileText,
  Download,
  BarChart3,
  PieChart,
  Smartphone,
  Headphones,
  Battery,
  Cable,
  Save,
  FolderOpen,
  HardDrive,
  Cloud,
  Filter,
  Eye,
  Trash2
} from 'lucide-react';
import { database } from '../utils/database';
import { Invoice, Product } from '../types';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

interface SalesRecord {
  id: string;
  invoice: Invoice;
  savedAt: Date;
  storageLocation: 'local' | 'download' | 'cloud';
}

const Reports: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [storageLocation, setStorageLocation] = useState<'local' | 'download' | 'cloud'>('local');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [showSalesHistory, setShowSalesHistory] = useState(false);

  const categoryIcons = {
    'إكسسوارات الهواتف': Smartphone,
    'سماعات': Headphones,
    'بطاريات': Battery,
    'كابلات': Cable,
    'default': Package
  };

  useEffect(() => {
    loadData();
    loadSalesRecords();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesData, productsData] = await Promise.all([
        database.getAllInvoices(),
        database.getAllProducts()
      ]);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setInvoices([]);
      setProducts([]);
    }
  };

  const loadSalesRecords = () => {
    const saved = localStorage.getItem('salesRecords');
    if (saved) {
      setSalesRecords(JSON.parse(saved));
    }
  };

  const saveSalesRecord = (invoice: Invoice) => {
    const record: SalesRecord = {
      id: Date.now().toString(),
      invoice,
      savedAt: new Date(),
      storageLocation
    };

    const updatedRecords = [...salesRecords, record];
    setSalesRecords(updatedRecords);
    localStorage.setItem('salesRecords', JSON.stringify(updatedRecords));

    if (storageLocation === 'download') {
      downloadSalesRecord(record);
    }
  };

  const downloadSalesRecord = (record: SalesRecord) => {
    const dataStr = JSON.stringify(record, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `مبيعة-${record.invoice.id.slice(-8)}-${format(record.savedAt, 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter(invoice => {
    const invoiceDate = new Date(invoice.createdAt);
    const startDate = startOfDay(new Date(dateRange.start));
    const endDate = endOfDay(new Date(dateRange.end));
    const dateMatch = invoiceDate >= startDate && invoiceDate <= endDate;
    
    const categoryMatch = selectedCategory === '' || 
      invoice.items.some(item => item.product.category === selectedCategory);
    
    const paymentMatch = paymentMethodFilter === '' || 
      invoice.paymentMethod === paymentMethodFilter;
    
    return dateMatch && categoryMatch && paymentMatch;
  });

  const calculateStats = () => {
    const totalSales = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalInvoices = filteredInvoices.length;
    const avgInvoiceValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;
    const totalDiscount = filteredInvoices.reduce((sum, invoice) => sum + invoice.discount, 0);
    const totalProfit = filteredInvoices.reduce((sum, invoice) => {
      const profit = invoice.items.reduce((itemSum, item) => {
        return itemSum + ((item.price - item.product.purchasePrice) * item.quantity);
      }, 0);
      return sum + profit;
    }, 0);

    // إحصائيات طرق الدفع
    const paymentStats = {
      cash: filteredInvoices.filter(inv => inv.paymentMethod === 'cash').length,
      card: filteredInvoices.filter(inv => inv.paymentMethod === 'card').length,
      transfer: filteredInvoices.filter(inv => inv.paymentMethod === 'transfer').length
    };

    return {
      totalSales,
      totalInvoices,
      avgInvoiceValue,
      totalDiscount,
      totalProfit,
      paymentStats
    };
  };

  const getTopProducts = () => {
    const productSales: { [key: string]: { product: Product; quantity: number; revenue: number } } = {};

    filteredInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (productSales[item.productId]) {
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.total;
        } else {
          productSales[item.productId] = {
            product: item.product,
            quantity: item.quantity,
            revenue: item.total
          };
        }
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const getCategorySales = () => {
    const categorySales: { [key: string]: { sales: number; quantity: number } } = {};

    filteredInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const category = item.product.category;
        if (categorySales[category]) {
          categorySales[category].sales += item.total;
          categorySales[category].quantity += item.quantity;
        } else {
          categorySales[category] = {
            sales: item.total,
            quantity: item.quantity
          };
        }
      });
    });

    return Object.entries(categorySales)
      .map(([category, data]) => ({
        category,
        ...data
      }))
      .sort((a, b) => b.sales - a.sales);
  };

  const getDailySales = () => {
    const dailySales: { [key: string]: { sales: number; invoices: number } } = {};

    filteredInvoices.forEach(invoice => {
      const date = format(new Date(invoice.createdAt), 'yyyy-MM-dd');
      if (dailySales[date]) {
        dailySales[date].sales += invoice.total;
        dailySales[date].invoices += 1;
      } else {
        dailySales[date] = {
          sales: invoice.total,
          invoices: 1
        };
      }
    });

    return Object.entries(dailySales)
      .map(([date, data]) => ({
        date,
        ...data
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getLowStockProducts = () => {
    return (Array.isArray(products) ? products : []).filter(product => product.quantity <= 5);
  };

  const exportReport = () => {
    const reportData = {
      period: `${dateRange.start} إلى ${dateRange.end}`,
      filters: {
        category: selectedCategory || 'جميع الفئات',
        paymentMethod: paymentMethodFilter || 'جميع طرق الدفع'
      },
      stats: calculateStats(),
      topProducts: getTopProducts(),
      categorySales: getCategorySales(),
      dailySales: getDailySales(),
      lowStockProducts: getLowStockProducts(),
      detailedInvoices: filteredInvoices,
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `تقرير-شامل-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportExcelFormat = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    
    // Headers
    csvContent += "رقم الفاتورة,التاريخ,العميل,طريقة الدفع,المجموع الفرعي,الخصم,الإجمالي,المنتجات\n";
    
    // Data
    filteredInvoices.forEach(invoice => {
      const products = invoice.items.map(item => `${item.product.name} (${item.quantity})`).join('; ');
      csvContent += `${invoice.id.slice(-8)},${format(invoice.createdAt, 'dd/MM/yyyy HH:mm')},${invoice.customerName || 'غير محدد'},${invoice.paymentMethod === 'cash' ? 'نقداً' : invoice.paymentMethod === 'card' ? 'بطاقة' : 'تحويل'},${invoice.subtotal},${invoice.discount},${invoice.total},"${products}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير-المبيعات-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSalesRecord = (recordId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      const updatedRecords = salesRecords.filter(record => record.id !== recordId);
      setSalesRecords(updatedRecords);
      localStorage.setItem('salesRecords', JSON.stringify(updatedRecords));
    }
  };

  const stats = calculateStats();
  const topProducts = getTopProducts();
  const categorySales = getCategorySales();
  const dailySales = getDailySales();
  const lowStockProducts = getLowStockProducts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير والإحصائيات المتقدمة</h1>
          <p className="text-gray-600 mt-1">تحليل شامل ومتقدم لأداء المبيعات والمخزون</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSalesHistory(!showSalesHistory)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 flex items-center space-x-2 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <Eye className="h-5 w-5" />
            <span>سجل المبيعات</span>
          </button>
          <button
            onClick={exportExcelFormat}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center space-x-2 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <FileText className="h-5 w-5" />
            <span>تصدير Excel</span>
          </button>
          <button
            onClick={exportReport}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 flex items-center space-x-2 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <Download className="h-5 w-5" />
            <span>تصدير شامل</span>
          </button>
        </div>
      </div>

      {/* Storage Location Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center mb-4">
          <HardDrive className="h-6 w-6 text-blue-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">إعدادات حفظ المبيعات</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setStorageLocation('local')}
            className={`p-4 rounded-xl border-2 transition-all ${
              storageLocation === 'local' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <HardDrive className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="font-semibold">التخزين المحلي</p>
            <p className="text-sm text-gray-600">حفظ في المتصفح</p>
          </button>
          <button
            onClick={() => setStorageLocation('download')}
            className={`p-4 rounded-xl border-2 transition-all ${
              storageLocation === 'download' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Download className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="font-semibold">التحميل التلقائي</p>
            <p className="text-sm text-gray-600">تحميل ملف لكل مبيعة</p>
          </button>
          <button
            onClick={() => setStorageLocation('cloud')}
            className={`p-4 rounded-xl border-2 transition-all ${
              storageLocation === 'cloud' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Cloud className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="font-semibold">التخزين السحابي</p>
            <p className="text-sm text-gray-600">قريباً</p>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center mb-4">
          <Filter className="h-6 w-6 text-blue-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">فلاتر متقدمة</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">من:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">إلى:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">جميع الفئات</option>
            {Array.from(new Set(products.map(p => p.category))).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">جميع طرق الدفع</option>
            <option value="cash">نقداً</option>
            <option value="card">بطاقة</option>
            <option value="transfer">تحويل</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <span>النتائج: {filteredInvoices.length} فاتورة</span>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-green-800">{stats.totalSales.toLocaleString()} د.ج</p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">عدد الفواتير</p>
              <p className="text-2xl font-bold text-blue-800">{stats.totalInvoices}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">متوسط الفاتورة</p>
              <p className="text-2xl font-bold text-purple-800">{stats.avgInvoiceValue.toLocaleString()} د.ج</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl shadow-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">إجمالي الأرباح</p>
              <p className="text-2xl font-bold text-orange-800">{stats.totalProfit.toLocaleString()} د.ج</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">إجمالي الخصومات</p>
              <p className="text-2xl font-bold text-red-800">{stats.totalDiscount.toLocaleString()} د.ج</p>
            </div>
            <div className="p-3 bg-red-500 rounded-xl">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl shadow-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">طرق الدفع</p>
              <div className="text-sm text-indigo-800">
                <div>نقداً: {stats.paymentStats.cash}</div>
                <div>بطاقة: {stats.paymentStats.card}</div>
                <div>تحويل: {stats.paymentStats.transfer}</div>
              </div>
            </div>
            <div className="p-3 bg-indigo-500 rounded-xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales History Modal */}
      {showSalesHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">سجل المبيعات المحفوظة</h2>
              <button
                onClick={() => setShowSalesHistory(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {salesRecords.length > 0 ? (
                salesRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          فاتورة #{record.invoice.id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          حُفظت في: {format(new Date(record.savedAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                        <p className="text-sm text-gray-500">
                          المكان: {record.storageLocation === 'local' ? 'محلي' : 
                                   record.storageLocation === 'download' ? 'تحميل' : 'سحابي'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">
                          {record.invoice.total.toLocaleString()} د.ج
                        </span>
                        <button
                          onClick={() => downloadSalesRecord(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteSalesRecord(record.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Save className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد مبيعات محفوظة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rest of the existing components... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="h-6 w-6 mr-3" />
              أكثر المنتجات مبيعاً
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topProducts.length > 0 ? (
              topProducts.map((item, index) => {
                const IconComponent = categoryIcons[item.product.category as keyof typeof categoryIcons] || categoryIcons.default;
                return (
                  <div key={item.product.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-500">{item.product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{item.revenue.toLocaleString()} د.ج</p>
                        <p className="text-sm text-gray-500">{item.quantity} قطعة</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد مبيعات في هذه الفترة</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Sales */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <PieChart className="h-6 w-6 mr-3" />
              مبيعات حسب الفئة
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {categorySales.length > 0 ? (
              categorySales.map((item) => {
                const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || categoryIcons.default;
                return (
                  <div key={item.category} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg mr-3">
                          <IconComponent className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.category}</p>
                          <p className="text-sm text-gray-500">{item.quantity} قطعة مباعة</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">{item.sales.toLocaleString()} د.ج</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد مبيعات في هذه الفترة</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Sales Chart */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <BarChart3 className="h-6 w-6 mr-3" />
            المبيعات اليومية
          </h2>
        </div>
        <div className="p-6">
          {dailySales.length > 0 ? (
            <div className="space-y-4">
              {dailySales.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {format(new Date(day.date), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">{day.invoices} فاتورة</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{day.sales.toLocaleString()} د.ج</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد مبيعات في هذه الفترة</p>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Package className="h-6 w-6 mr-3" />
              المنتجات بكمية منخفضة
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockProducts.map((product) => {
              const IconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons.default;
              return (
                <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <IconComponent className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        product.quantity <= 2 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {product.quantity} متبقي
                      </p>
                      <p className="text-sm text-gray-500">{product.salePrice.toLocaleString()} د.ج</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;