import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search,
  ShoppingCart,
  Calculator,
  CreditCard,
  Banknote,
  Phone,
  User,
  Printer,
  Scan,
  Smartphone,
  Headphones,
  Battery,
  Cable,
  Package
} from 'lucide-react';
import { database } from '../utils/database';
import { barcodeScanner } from '../utils/barcode';
import { generateInvoicePDF } from '../utils/pdf';
import { Product, InvoiceItem, Invoice } from '../types';

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'إكسسوارات الهواتف',
    'سماعات',
    'بطاريات',
    'كابلات',
    'شواحن',
    'حافظات',
    'شاشات حماية',
    'مكبرات صوت',
    'ذواكر',
    'أخرى'
  ];

  const categoryIcons = {
    'إكسسوارات الهواتف': Smartphone,
    'سماعات': Headphones,
    'بطاريات': Battery,
    'كابلات': Cable,
    'default': Package
  };

  useEffect(() => {
    loadProducts();
    setupBarcodeScanner();
    return () => {
      barcodeScanner.removeBarcodeListener(handleBarcodeScanned);
    };
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await database.getAllProducts();
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const setupBarcodeScanner = () => {
    barcodeScanner.onBarcodeScanned(handleBarcodeScanned);
  };

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      const product = await database.getProductByBarcode(barcode);
      if (product) {
        addToCart(product);
        setSearchTerm('');
      } else {
        alert(`المنتج بالباركود ${barcode} غير موجود`);
      }
    } catch (error) {
      console.error('Error finding product by barcode:', error);
      alert('خطأ في البحث عن المنتج');
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      alert('هذا المنتج غير متوفر في المخزون');
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        alert('الكمية المطلوبة أكبر من المتوفر في المخزون');
        return;
      }
      updateCartQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: InvoiceItem = {
        productId: product.id,
        product,
        quantity: 1,
        price: product.salePrice,
        total: product.salePrice
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.quantity) {
      alert('الكمية المطلوبة أكبر من المتوفر في المخزون');
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة');
      return;
    }

    setIsCheckingOut(true);
    try {
      const invoice: Invoice = {
        id: Date.now().toString(),
        items: cart,
        subtotal: calculateSubtotal(),
        discount,
        total: calculateTotal(),
        paymentMethod,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        createdAt: new Date()
      };

      // Save invoice
      await database.addInvoice(invoice);

      // Update product quantities
      for (const item of cart) {
        const newQuantity = item.product.quantity - item.quantity;
        await database.updateProductQuantity(item.productId, newQuantity);
      }

      // Generate PDF
      generateInvoicePDF(invoice);

      // Reset form
      setCart([]);
      setDiscount(0);
      setCustomerName('');
      setCustomerPhone('');
      setSearchTerm('');
      
      // Reload products to update quantities
      await loadProducts();
      
      alert('تم إنشاء الفاتورة بنجاح!');
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('خطأ في إنشاء الفاتورة');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen">
      {/* Products Section */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="h-7 w-7 mr-3 text-blue-600" />
            المنتجات
          </h2>
          <button
            onClick={() => setBarcodeMode(!barcodeMode)}
            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
              barcodeMode 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Scan className="h-5 w-5" />
            <span>وضع المسح</span>
          </button>
        </div>

        {/* Search and Category Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن منتج أو مسح الباركود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedCategory === '' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              جميع الفئات
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  selectedCategory === category 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => {
            const IconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || categoryIcons.default;
            return (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    product.quantity > 10 
                      ? 'bg-green-100 text-green-800' 
                      : product.quantity > 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.quantity}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-blue-600">{product.salePrice.toLocaleString()} د.ج</p>
                  <p className="text-xs text-gray-400">الباركود: {product.barcode}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="h-7 w-7 mr-3 text-green-600" />
            السلة
          </h2>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {cart.length} منتج
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">السلة فارغة</p>
              <p className="text-sm">أضف منتجات لبدء البيع</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.price.toLocaleString()} د.ج × {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-bold text-green-600">{item.total.toLocaleString()} د.ج</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="اسم العميل (اختياري)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              placeholder="رقم الهاتف (اختياري)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Discount */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الخصم (د.ج)
          </label>
          <div className="relative">
            <Calculator className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            طريقة الدفع
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-3 rounded-xl text-sm flex flex-col items-center space-y-1 transition-all ${
                paymentMethod === 'cash' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Banknote className="h-5 w-5" />
              <span>نقداً</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-xl text-sm flex flex-col items-center space-y-1 transition-all ${
                paymentMethod === 'card' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>بطاقة</span>
            </button>
            <button
              onClick={() => setPaymentMethod('transfer')}
              className={`p-3 rounded-xl text-sm flex flex-col items-center space-y-1 transition-all ${
                paymentMethod === 'transfer' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Phone className="h-5 w-5" />
              <span>تحويل</span>
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>المجموع الفرعي:</span>
              <span className="font-medium">{calculateSubtotal().toLocaleString()} د.ج</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>الخصم:</span>
                <span className="font-medium">-{discount.toLocaleString()} د.ج</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl border-t pt-2">
              <span>المجموع:</span>
              <span className="text-green-600">{calculateTotal().toLocaleString()} د.ج</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || isCheckingOut}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          {isCheckingOut ? (
            <span>جار المعالجة...</span>
          ) : (
            <>
              <Printer className="h-6 w-6" />
              <span>إنشاء الفاتورة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default POS;