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