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
  Cable
} from 'lucide-react';
import { database } from '../utils/database';
import { Invoice, Product } from '../types';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

const Reports: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const categoryIcons = {
    'إكسسوارات الهواتف': Smartphone,
    'سماعات': Headphones,
    'بطاريات': Battery,
    'كابلات': Cable,
    'default': Package
  };

  useEffect(() => {
    loadData();
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

  const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter(invoice => {
    const invoiceDate = new Date(invoice.createdAt);
    const startDate = startOfDay(new Date(dateRange.start));
    const endDate = endOfDay(new Date(dateRange.end));
    return invoiceDate >= startDate && invoiceDate <= endDate;
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

    return {
      totalSales,
      totalInvoices,
      avgInvoiceValue,
      totalDiscount,
      totalProfit
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

  const stats = calculateStats();
  const topProducts = getTopProducts();
  const categorySales = getCategorySales();
  const dailySales = getDailySales();
  const lowStockProducts = getLowStockProducts();

  const exportReport = () => {
    const reportData = {
      period: `${dateRange.start} إلى ${dateRange.end}`,
      stats,
      topProducts,
      categorySales,
      dailySales,
      lowStockProducts,
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `تقرير-المبيعات-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <p className="text-gray-600 mt-1">تحليل شامل لأداء المبيعات والمخزون</p>
        </div>
        <button
          onClick={exportReport}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 flex items-center space-x-2 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Download className="h-5 w-5" />
          <span>تصدير التقرير</span>
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center space-x-4">
          <Calendar className="h-6 w-6 text-blue-500" />
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">من:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
      </div>

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