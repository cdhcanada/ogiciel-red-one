import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle,
  Clock,
  Smartphone,
  Headphones,
  Battery,
  Cable
} from 'lucide-react';
import { database } from '../utils/database';
import { Product, Invoice } from '../types';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    todaySales: 0,
    todayInvoices: 0,
    totalRevenue: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const products = await database.getAllProducts();
      const invoices = await database.getAllInvoices();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayInvoices = Array.isArray(invoices) ? invoices.filter(invoice => 
        new Date(invoice.createdAt) >= today
      ) : [];
      
      const todaySales = todayInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const totalRevenue = Array.isArray(invoices) ? invoices.reduce((sum, invoice) => sum + invoice.total, 0) : 0;
      
      const lowStock = Array.isArray(products) ? products.filter(product => product.quantity <= 5) : [];
      
      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        lowStockProducts: lowStock.length,
        todaySales,
        todayInvoices: todayInvoices.length,
        totalRevenue
      });
      
      setRecentInvoices(Array.isArray(invoices) ? invoices.slice(-5).reverse() : []);
      setLowStockProducts(lowStock.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const statCards = [
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'مبيعات اليوم',
      value: `${stats.todaySales.toLocaleString()} د.ج`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'فواتير اليوم',
      value: stats.todayInvoices,
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${stats.totalRevenue.toLocaleString()} د.ج`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100'
    }
  ];

  const categoryIcons = {
    'إكسسوارات الهواتف': Smartphone,
    'سماعات': Headphones,
    'بطاريات': Battery,
    'كابلات': Cable,
    'default': Package
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">مرحباً بك في نظام إدارة محل الإكسسوارات والإلكترونيات</p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border">
          <Clock className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">{format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${card.bgColor} rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">
                تنبيه المخزون
              </h3>
              <p className="text-yellow-700">
                يوجد {stats.lowStockProducts} منتج بكمية منخفضة تحتاج إلى إعادة تموين
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <ShoppingCart className="h-6 w-6 mr-3" />
              آخر الفواتير
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => (
                <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        فاتورة #{invoice.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                      {invoice.customerName && (
                        <p className="text-xs text-blue-600 mt-1">
                          العميل: {invoice.customerName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {invoice.total.toLocaleString()} د.ج
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.items.length} منتج
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد فواتير حتى الآن</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <AlertTriangle className="h-6 w-6 mr-3" />
              منتجات بكمية منخفضة
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => {
                const IconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons.default;
                return (
                  <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          product.quantity <= 2 ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {product.quantity} متبقي
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.salePrice.toLocaleString()} د.ج
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>جميع المنتجات متوفرة بكميات كافية</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;