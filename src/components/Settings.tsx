import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Download,
  Upload,
  Trash2,
  Store,
  Save,
  Smartphone,
  MapPin,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { database } from '../utils/database';

const Settings: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState({
    name: 'محل الإكسسوارات والإلكترونيات',
    nameEn: 'Electronics & Accessories Store',
    address: 'الجزائر العاصمة، الجزائر',
    phone: '+213 XXX XXX XXX',
    email: 'info@store.dz',
    taxNumber: '',
    description: 'متخصصون في بيع إكسسوارات الهواتف والإلكترونيات'
  });

  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const savedStoreInfo = localStorage.getItem('storeInfo');
    if (savedStoreInfo) {
      setStoreInfo(JSON.parse(savedStoreInfo));
    }
  }, []);

  const handleSaveStoreInfo = () => {
    localStorage.setItem('storeInfo', JSON.stringify(storeInfo));
    alert('تم حفظ معلومات المحل بنجاح');
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      const [products, invoices, categories] = await Promise.all([
        database.getAllProducts(),
        database.getAllInvoices(),
        database.getAllCategories()
      ]);

      const exportData = {
        timestamp: new Date().toISOString(),
        storeInfo,
        products: Array.isArray(products) ? products : [],
        invoices: Array.isArray(invoices) ? invoices : [],
        categories: Array.isArray(categories) ? categories : [],
        version: '1.0.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `نسخة-احتياطية-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert('تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('خطأ في تصدير البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        if (window.confirm('هل أنت متأكد من استيراد البيانات؟ سيتم استبدال جميع البيانات الحالية.')) {
          setIsLoading(true);
          
          // Clear existing data
          await clearAllData();
          
          // Import new data
          const products = Array.isArray(importData.products) ? importData.products : [];
          const invoices = Array.isArray(importData.invoices) ? importData.invoices : [];
          const categories = Array.isArray(importData.categories) ? importData.categories : [];
          
          for (const product of products) {
            await database.addProduct(product);
          }
          
          for (const invoice of invoices) {
            await database.addInvoice(invoice);
          }
          
          for (const category of categories) {
            await database.addCategory(category);
          }
          
          if (importData.storeInfo) {
            setStoreInfo(importData.storeInfo);
            localStorage.setItem('storeInfo', JSON.stringify(importData.storeInfo));
          }
          
          alert('تم استيراد البيانات بنجاح');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('خطأ في استيراد البيانات - تأكد من صحة الملف');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        const dbRequest = indexedDB.deleteDatabase('RedOnePOS');
        await new Promise((resolve, reject) => {
          dbRequest.onsuccess = () => resolve(null);
          dbRequest.onerror = () => reject(dbRequest.error);
        });
        
        await database.init();
        localStorage.removeItem('storeInfo');
        
        alert('تم حذف جميع البيانات بنجاح');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('خطأ في حذف البيانات');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-600 mt-1">إدارة إعدادات المحل والنظام</p>
        </div>
        <SettingsIcon className="h-8 w-8 text-gray-400" />
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-100 rounded-xl mr-4">
            <Store className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">معلومات المحل</h2>
            <p className="text-gray-600">تحديث بيانات المحل التي تظهر في الفواتير</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Store className="h-4 w-4 mr-2" />
              اسم المحل (بالعربية)
            </label>
            <input
              type="text"
              value={storeInfo.name}
              onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Store className="h-4 w-4 mr-2" />
              اسم المحل (بالإنجليزية)
            </label>
            <input
              type="text"
              value={storeInfo.nameEn}
              onChange={(e) => setStoreInfo({ ...storeInfo, nameEn: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              العنوان
            </label>
            <input
              type="text"
              value={storeInfo.address}
              onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={storeInfo.phone}
              onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={storeInfo.email}
              onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              الرقم الضريبي
            </label>
            <input
              type="text"
              value={storeInfo.taxNumber}
              onChange={(e) => setStoreInfo({ ...storeInfo, taxNumber: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وصف المحل
            </label>
            <textarea
              value={storeInfo.description}
              onChange={(e) => setStoreInfo({ ...storeInfo, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={handleSaveStoreInfo}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center space-x-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Save className="h-5 w-5" />
            <span>حفظ المعلومات</span>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-green-100 rounded-xl mr-4">
            <Database className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">إدارة البيانات</h2>
            <p className="text-gray-600">نسخ احتياطي واستيراد البيانات</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">نسخ احتياطي للبيانات</h3>
                <p className="text-sm text-green-700">تصدير جميع البيانات لحفظها كنسخة احتياطية</p>
              </div>
            </div>
            <button
              onClick={handleExportData}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 flex items-center space-x-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Download className="h-5 w-5" />
              <span>تصدير البيانات</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">استيراد البيانات</h3>
                <p className="text-sm text-blue-700">استيراد البيانات من نسخة احتياطية</p>
              </div>
            </div>
            <label className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 cursor-pointer flex items-center space-x-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
              <Upload className="h-5 w-5" />
              <span>استيراد البيانات</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg mr-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">حذف جميع البيانات</h3>
                <p className="text-sm text-red-700">حذف جميع البيانات من النظام (لا يمكن التراجع)</p>
              </div>
            </div>
            <button
              onClick={clearAllData}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 flex items-center space-x-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Trash2 className="h-5 w-5" />
              <span>حذف البيانات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Installation Guide */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-orange-100 rounded-xl mr-4">
            <Smartphone className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">تشغيل النظام على الهاتف</h2>
            <p className="text-gray-600">خطوات تشغيل النظام على الهاتف المحمول</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">للأندرويد (Android)</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. افتح متصفح Chrome</li>
              <li>2. ادخل على الرابط</li>
              <li>3. اضغط على القائمة (⋮)</li>
              <li>4. اختر "إضافة إلى الشاشة الرئيسية"</li>
              <li>5. اضغط "إضافة"</li>
            </ol>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h3 className="font-bold text-green-900 mb-3">للآيفون (iPhone)</h3>
            <ol className="text-sm text-green-800 space-y-2">
              <li>1. افتح متصفح Safari</li>
              <li>2. ادخل على الرابط</li>
              <li>3. اضغط على زر المشاركة (□↗)</li>
              <li>4. اختر "إضافة إلى الشاشة الرئيسية"</li>
              <li>5. اضغط "إضافة"</li>
            </ol>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 text-sm">
            <strong>ملاحظة:</strong> بعد إضافة النظام للشاشة الرئيسية، سيعمل مثل تطبيق عادي ولن تحتاج للإنترنت للاستخدام.
          </p>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-purple-100 rounded-xl mr-4">
            <Smartphone className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">معلومات النظام</h2>
            <p className="text-gray-600">تفاصيل النظام والإصدار</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">اسم النظام</p>
            <p className="font-bold text-blue-900">نظام نقطة البيع</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-600 font-medium">الإصدار</p>
            <p className="font-bold text-green-900">1.0.0</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">نوع التخزين</p>
            <p className="font-bold text-purple-900">IndexedDB (محلي)</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-600 font-medium">حالة الاتصال</p>
            <p className="font-bold text-orange-900 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              يعمل بدون إنترنت
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;