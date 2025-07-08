export interface Product {
  id: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  category: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  createdAt: Date;
  customerName?: string;
  customerPhone?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface SalesReport {
  totalSales: number;
  totalInvoices: number;
  topProducts: Array<{
    product: Product;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  dailySales: Array<{
    date: string;
    sales: number;
    invoices: number;
  }>;
}

export interface DamagedProduct {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  reason: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ReturnItem {
  id: string;
  originalInvoiceId: string;
  productId: string;
  product: Product;
  quantity: number;
  reason: string;
  returnDate: Date;
  refundAmount: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DeliveryReceipt {
  id: string;
  invoiceId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate: Date;
  deliveredBy: string;
  status: 'pending' | 'delivered' | 'failed';
  notes?: string;
}

export interface PrinterSettings {
  printerName: string;
  paperSize: 'A4' | '80mm' | '58mm';
  printLogo: boolean;
  printBarcode: boolean;
  printCustomerInfo: boolean;
  printItemDetails: boolean;
  printTotals: boolean;
  printFooter: boolean;
  copies: number;
  autoprint: boolean;
}

export interface StockAlert {
  id: string;
  productId: string;
  product: Product;
  alertType: 'low_stock' | 'out_of_stock' | 'expiry_warning';
  threshold: number;
  currentQuantity: number;
  createdAt: Date;
  acknowledged: boolean;
}