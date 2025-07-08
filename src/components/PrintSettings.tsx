import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Settings as SettingsIcon,
  Save,
  FileText,
  Image,
  BarChart3,
  User,
  Package,
  DollarSign,
  MessageSquare,
  Copy,
  Eye
} from 'lucide-react';
import { PrinterSettings } from '../types';

const PrintSettings: React.FC = () => {
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>({
    printerName: 'Default Printer',
    paperSize: 'A4',
    printLogo: true,
    printBarcode: true,
    printCustomerInfo: true,
    printItemDetails: true,
    printTotals: true,
    printFooter: true,
    copies: 1,
    autoprint: false
  });

  const [availablePrinters, setAvailablePrinters] = useState<string[]>([
    'Default Printer',
    'Thermal Printer 80mm',
    'Thermal Printer 58mm',
    'HP LaserJet',
    'Canon PIXMA',
    'Epson L3150'
  ]);

  useEffect(() => {
    loadPrinterSettings();
    detectPrinters();
  }, []);

  const loadPrinterSettings = () => {
    const saved = localStorage.getItem('printerSettings');
    if (saved) {
      setPrinterSettings(JSON.parse(saved));
    }
  };

  const detectPrinters = async () => {
    // في بيئة حقيقية، يمكن استخدام Web Print API أو تقنيات أخرى
    // هنا نستخدم قائمة افتراضية
    try {
      // محاولة الحصول على الطابعات المتاحة
      if ('navigator' in window && 'mediaDevices' in navigator) {
        // يمكن إضافة منطق للكشف عن الطابعات هنا
      }
    } catch (error) {
      console.log('Could not detect printers:', error);
    }
  };

  const handleSave = () => {
    localStorage.setItem('printerSettings', JSON.stringify(printerSettings));
    alert('تم حفظ إعدادات الطباعة بنجاح');
  };

  const handleTestPrint = () => {
    const testContent = generateTestPrint();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(testContent);
    printWindow.document.close();
    
    if (printerSettings.autoprint) {
      printWindow.print();
    }
  };

  const generateTestPrint = (): string => {
    const storeInfo = JSON.parse(localStorage.getItem('storeInfo') || '{}');
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>اختبار الطباعة</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            direction: rtl;
            ${printerSettings.paperSize === '80mm' ? 'width: 80mm;' : ''}
            ${printerSettings.paperSize === '58mm' ? 'width: 58mm; font-size: 12px;' : ''}
          }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
          .section { margin-bottom: 15px; }
          .item-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total-section { border-top: 2px solid #333; padding-top: 10px; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${printerSettings.printLogo ? `
          <div class="header">
            <h2>${storeInfo.name || 'محل الإكسسوارات والإلكترونيات'}</h2>
            <p>${storeInfo.address || 'الجزائر العاصمة، الجزائر'}</p>
            <p>هاتف: ${storeInfo.phone || '+213 XXX XXX XXX'}</p>
          </div>
        ` : ''}
        
        <div class="section">
          <h3>فاتورة اختبار</h3>
          <p>رقم الفاتورة: TEST-001</p>
          <p>التاريخ: ${new Date().toLocaleDateString('ar-DZ')}</p>
          <p>الوقت: ${new Date().toLocaleTimeString('ar-DZ')}</p>
        </div>

        ${printerSettings.printCustomerInfo ? `
          <div class="section">
            <h4>معلومات العميل:</h4>
            <p>الاسم: عميل تجريبي</p>
            <p>الهاتف: +213 XXX XXX XXX</p>
          </div>
        ` : ''}

        ${printerSettings.printItemDetails ? `
          <div class="section">
            <h4>تفاصيل المنتجات:</h4>
            <div class="item-row">
              <span>سماعات بلوتوث</span>
              <span>2 × 2500 = 5000 د.ج</span>
            </div>
            <div class="item-row">
              <span>كابل USB</span>
              <span>1 × 800 = 800 د.ج</span>
            </div>
          </div>
        ` : ''}

        ${printerSettings.printTotals ? `
          <div class="total-section">
            <div class="item-row">
              <span>المجموع الفرعي:</span>
              <span>5800 د.ج</span>
            </div>
            <div class="item-row">
              <span>الخصم:</span>
              <span>300 د.ج</span>
            </div>
            <div class="item-row" style="font-weight: bold; font-size: 18px;">
              <span>الإجمالي:</span>
              <span>5500 د.ج</span>
            </div>
          </div>
        ` : ''}

        ${printerSettings.printBarcode ? `
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-family: monospace; font-size: 24px; letter-spacing: 2px;">
              ||||| |||| ||||| |||| |||||
            </div>
            <p style="font-size: 12px;">TEST-001</p>
          </div>
        ` : ''}

        ${printerSettings.printFooter ? `
          <div class="footer">
            <p>شكراً لتعاملكم معنا</p>
            <p>Thank you for your business</p>
            <p>تم الطباعة في: ${new Date().toLocaleString('ar-DZ')}</p>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إعدادات الطباعة</h1>
          <p className="text-gray-600 mt-1">تخصيص إعدادات الطباعة وأنواع الطابعات</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleTestPrint}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center space-x-2 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <Eye className="h-5 w-5" />
            <span>اختبار الطباعة</span>
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 flex items-center space-x-2 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <Save className="h-5 w-5" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>

      {/* Printer Configuration */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-100 rounded-xl mr-4">
            <Printer className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">إعدادات الطابعة</h2>
            <p className="text-gray-600">تكوين الطابعة وحجم الورق</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              اختيار الطابعة
            </label>
            <select
              value={printerSettings.printerName}
              onChange={(e) => setPrinterSettings({ ...printerSettings, printerName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availablePrinters.map(printer => (
                <option key={printer} value={printer}>{printer}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              حجم الورق
            </label>
            <select
              value={printerSettings.paperSize}
              onChange={(e) => setPrinterSettings({ ...printerSettings, paperSize: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="A4">A4 (210 × 297 مم)</option>
              <option value="80mm">حراري 80 مم</option>
              <option value="58mm">حراري 58 مم</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              عدد النسخ
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={printerSettings.copies}
              onChange={(e) => setPrinterSettings({ ...printerSettings, copies: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoprint"
              checked={printerSettings.autoprint}
              onChange={(e) => setPrinterSettings({ ...printerSettings, autoprint: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoprint" className="mr-3 text-sm font-medium text-gray-700">
              طباعة تلقائية بعد إنشاء الفاتورة
            </label>
          </div>
        </div>
      </div>

      {/* Print Content Settings */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-green-100 rounded-xl mr-4">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">محتوى الطباعة</h2>
            <p className="text-gray-600">اختيار العناصر التي تريد طباعتها في الفاتورة</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Image className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-semibold text-gray-900">شعار المحل</span>
              </div>
              <input
                type="checkbox"
                checked={printerSettings.printLogo}
                onChange={(e) => setPrinterSettings({ ...printerSettings, printLogo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <p className="text-sm text-gray-600">طباعة اسم المحل والعنوان في أعلى الفاتورة</p>
          </div>

          <div className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-semibold text-gray-900">الباركود</span>
              </div>
              <input
                type="checkbox"
                checked={printerSettings.printBarcode}
                onChange={(e) => setPrinterSettings({ ...printerSettings, printBarcode: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <p className="text-sm text-gray-600">طباعة باركود رقم الفاتورة</p>
          </div>

          <div className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-purple-500 mr-2" />
                <span className="font-semibold text-gray-900">معلومات العميل</span>
              </div>
              <input
                type="checkbox"
                checked={printerSettings.printCustomerInfo}
                onChange={(e) => setPrinterSettings({ ...printerSettings, printCustomerInfo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <p className="text-sm text-gray-600">طباعة اسم العميل ورقم الهاتف</p>
          </div>

          <div className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-orange-500 mr-2" />
                <span className="font-semibold text-gray-900">تفاصيل المنتجات</span>
              </div>
              <input
                type="checkbox"
                checked={printerSettings.printItemDetails}
                onChange={(e) => setPrinterSettings({ ...printerSettings, printItemDetails: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <p className="text-sm text-gray-600">طباعة قائمة المنتجات والكميات</p>
          </div>

          <div className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-semibold text-gray-900">المجاميع</span>
              </div>
              <input
                type="checkbox"
                checked={printerSettings.printTotals}
                onChange={(e) => setPrinterSettings({ ...printerSettings, printTotals: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <p className="text-sm text-gray-600">طباعة المجموع الفرعي والخصم والإجمالي</p>
          </div>

          <div className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-semibold text-gray-900">التذييل</span>
              </div>
              <input
                type="checkbox"
                checked={printerSettings.printFooter}
                onChange={(e) => setPrinterSettings({ ...printerSettings, printFooter: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <p className="text-sm text-gray-600">طباعة رسالة الشكر وتاريخ الطباعة</p>
          </div>
        </div>
      </div>

      {/* Printer Types Guide */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-purple-100 rounded-xl mr-4">
            <SettingsIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">دليل أنواع الطابعات</h2>
            <p className="text-gray-600">معلومات حول أنواع الطابعات المختلفة</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">طابعة A4 عادية</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• مناسبة للفواتير التفصيلية</li>
              <li>• جودة طباعة عالية</li>
              <li>• تدعم الألوان والصور</li>
              <li>• حجم ورق قياسي 210×297 مم</li>
            </ul>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h3 className="font-bold text-green-900 mb-3">طابعة حرارية 80 مم</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• سريعة وصامتة</li>
              <li>• مناسبة لنقاط البيع</li>
              <li>• لا تحتاج حبر</li>
              <li>• عرض 80 مم مناسب للفواتير</li>
            </ul>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <h3 className="font-bold text-orange-900 mb-3">طابعة حرارية 58 مم</h3>
            <ul className="text-sm text-orange-800 space-y-2">
              <li>• صغيرة ومحمولة</li>
              <li>• مناسبة للفواتير المبسطة</li>
              <li>• استهلاك طاقة منخفض</li>
              <li>• عرض 58 مم للمساحات الضيقة</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print Preview */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gray-100 rounded-xl mr-4">
            <Eye className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">معاينة الطباعة</h2>
            <p className="text-gray-600">شاهد كيف ستبدو الفاتورة عند الطباعة</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
          <div 
            className={`bg-white p-6 shadow-lg mx-auto ${
              printerSettings.paperSize === 'A4' ? 'max-w-2xl' : 
              printerSettings.paperSize === '80mm' ? 'max-w-xs' : 'max-w-48'
            }`}
            style={{ 
              fontFamily: 'Arial, sans-serif',
              fontSize: printerSettings.paperSize === '58mm' ? '12px' : '14px'
            }}
          >
            {printerSettings.printLogo && (
              <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
                <h3 className="font-bold text-lg">محل الإكسسوارات والإلكترونيات</h3>
                <p className="text-sm text-gray-600">الجزائر العاصمة، الجزائر</p>
              </div>
            )}
            
            <div className="mb-4">
              <h4 className="font-bold">فاتورة رقم: TEST-001</h4>
              <p className="text-sm">التاريخ: {new Date().toLocaleDateString('ar-DZ')}</p>
            </div>

            {printerSettings.printCustomerInfo && (
              <div className="mb-4">
                <p className="text-sm"><strong>العميل:</strong> عميل تجريبي</p>
                <p className="text-sm"><strong>الهاتف:</strong> +213 XXX XXX XXX</p>
              </div>
            )}

            {printerSettings.printItemDetails && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>سماعات بلوتوث</span>
                  <span>2500 د.ج</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>كابل USB</span>
                  <span>800 د.ج</span>
                </div>
              </div>
            )}

            {printerSettings.printTotals && (
              <div className="border-t-2 border-gray-300 pt-2 mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>المجموع:</span>
                  <span>3300 د.ج</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>الإجمالي:</span>
                  <span>3300 د.ج</span>
                </div>
              </div>
            )}

            {printerSettings.printBarcode && (
              <div className="text-center mt-4">
                <div className="font-mono text-lg">||||| |||| |||||</div>
                <p className="text-xs">TEST-001</p>
              </div>
            )}

            {printerSettings.printFooter && (
              <div className="text-center mt-4 text-xs text-gray-600">
                <p>شكراً لتعاملكم معنا</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSettings;