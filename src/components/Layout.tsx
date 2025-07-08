import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Smartphone,
  Headphones,
  AlertTriangle,
  RotateCcw,
  Truck,
  Printer
} from 'lucide-react';
import { database } from '../utils/database';
import { StockAlert } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [stockAlerts, setStockAlerts] = React.useState<StockAlert[]>([]);
  const [showAlerts, setShowAlerts] = React.useState(false);

  const navigation = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'نقطة البيع', href: '/pos', icon: ShoppingCart },
    { name: 'المنتجات', href: '/products', icon: Package },
    { name: 'المنتجات التالفة', href: '/damaged', icon: AlertTriangle },
    { name: 'المرتجعات', href: '/returns', icon: RotateCcw },
    { name: 'وصولات التسليم', href: '/delivery', icon: Truck },
    { name: 'التقارير', href: '/reports', icon: BarChart3 },
    { name: 'إعدادات الطباعة', href: '/print-settings', icon: Printer },
    { name: 'الإعدادات', href: '/settings', icon: Settings },
  ];

  React.useEffect(() => {
    loadStockAlerts();
    const interval = setInterval(loadStockAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStockAlerts = async () => {
    try {
      const alerts = await database.getAllStockAlerts();
      const unacknowledged = alerts.filter(alert => !alert.acknowledged);
      setStockAlerts(unacknowledged);
    } catch (error) {
      console.error('Error loading stock alerts:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const alert = stockAlerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        await database.updateStockAlert(alert);
        setStockAlerts(stockAlerts.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0">
        <div className="flex h-20 items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Smartphone className="h-8 w-8 text-white" />
              <Headphones className="h-6 w-6 text-blue-200" />
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-white block">محل الإكسسوارات</span>
              <span className="text-sm text-blue-200">والإلكترونيات</span>
            </div>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="space-y-2 px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:scale-105'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Stock Alerts */}
        {stockAlerts.length > 0 && (
          <div className="mx-4 mt-4">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-xl flex items-center justify-between hover:from-red-600 hover:to-orange-600 transition-all duration-200"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold">تنبيهات المخزون</span>
              </div>
              <span className="bg-white text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                {stockAlerts.length}
              </span>
            </button>
            
            {showAlerts && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-red-200 max-h-64 overflow-y-auto">
                {stockAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{alert.product.name}</p>
                        <p className="text-xs text-red-600">
                          {alert.alertType === 'low_stock' ? 'مخزون منخفض' : 
                           alert.alertType === 'out_of_stock' ? 'نفد المخزون' : 'تحذير انتهاء الصلاحية'}
                        </p>
                        <p className="text-xs text-gray-500">الكمية: {alert.currentQuantity}</p>
                      </div>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        تم
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium">يعمل بدون إنترنت</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 transition-all duration-300">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;