import { Product, Invoice, Category, DamagedProduct, ReturnItem, DeliveryReceipt, StockAlert } from '../types';

class Database {
  private dbName = 'RedOnePOS';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private async ensureDbConnection(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('barcode', 'barcode', { unique: true });
          productsStore.createIndex('name', 'name', { unique: false });
          productsStore.createIndex('category', 'category', { unique: false });
        }

        // Invoices store
        if (!db.objectStoreNames.contains('invoices')) {
          const invoicesStore = db.createObjectStore('invoices', { keyPath: 'id' });
          invoicesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoriesStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoriesStore.createIndex('name', 'name', { unique: true });
        }

        // Damaged products store
        if (!db.objectStoreNames.contains('damagedProducts')) {
          const damagedStore = db.createObjectStore('damagedProducts', { keyPath: 'id' });
          damagedStore.createIndex('productId', 'productId', { unique: false });
          damagedStore.createIndex('status', 'status', { unique: false });
        }

        // Returns store
        if (!db.objectStoreNames.contains('returns')) {
          const returnsStore = db.createObjectStore('returns', { keyPath: 'id' });
          returnsStore.createIndex('originalInvoiceId', 'originalInvoiceId', { unique: false });
          returnsStore.createIndex('status', 'status', { unique: false });
        }

        // Delivery receipts store
        if (!db.objectStoreNames.contains('deliveryReceipts')) {
          const deliveryStore = db.createObjectStore('deliveryReceipts', { keyPath: 'id' });
          deliveryStore.createIndex('invoiceId', 'invoiceId', { unique: false });
          deliveryStore.createIndex('status', 'status', { unique: false });
        }

        // Stock alerts store
        if (!db.objectStoreNames.contains('stockAlerts')) {
          const alertsStore = db.createObjectStore('stockAlerts', { keyPath: 'id' });
          alertsStore.createIndex('productId', 'productId', { unique: false });
          alertsStore.createIndex('alertType', 'alertType', { unique: false });
        }
      };
    });
  }

  // Products methods
  async addProduct(product: Product): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.add(product);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateProduct(product: Product): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.put(product);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getProduct(id: string): Promise<Product | null> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const index = store.index('barcode');
      const request = index.get(barcode);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProducts(): Promise<Product[]> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Invoices methods
  async addInvoice(invoice: Invoice): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['invoices'], 'readwrite');
      const store = transaction.objectStore('invoices');
      const request = store.add(invoice);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllInvoices(): Promise<Invoice[]> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['invoices'], 'readonly');
      const store = transaction.objectStore('invoices');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Categories methods
  async addCategory(category: Category): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.add(category);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCategories(): Promise<Category[]> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async updateProductQuantity(productId: string, newQuantity: number): Promise<void> {
    await this.ensureDbConnection();
    const product = await this.getProduct(productId);
    if (product) {
      product.quantity = newQuantity;
      product.updatedAt = new Date();
      await this.updateProduct(product);
    }
  }

  // Damaged products methods
  async addDamagedProduct(damaged: DamagedProduct): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['damagedProducts'], 'readwrite');
      const store = transaction.objectStore('damagedProducts');
      const request = store.add(damaged);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDamagedProducts(): Promise<DamagedProduct[]> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['damagedProducts'], 'readonly');
      const store = transaction.objectStore('damagedProducts');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Returns methods
  async addReturn(returnItem: ReturnItem): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['returns'], 'readwrite');
      const store = transaction.objectStore('returns');
      const request = store.add(returnItem);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllReturns(): Promise<ReturnItem[]> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['returns'], 'readonly');
      const store = transaction.objectStore('returns');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Delivery receipts methods
  async addDeliveryReceipt(receipt: DeliveryReceipt): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['deliveryReceipts'], 'readwrite');
      const store = transaction.objectStore('deliveryReceipts');
      const request = store.add(receipt);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDeliveryReceipts(): Promise<DeliveryReceipt[]> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['deliveryReceipts'], 'readonly');
      const store = transaction.objectStore('deliveryReceipts');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Stock alerts methods
  async addStockAlert(alert: StockAlert): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['stockAlerts'], 'readwrite');
      const store = transaction.objectStore('stockAlerts');
      const request = store.add(alert);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllStockAlerts(): Promise<StockAlert[]> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['stockAlerts'], 'readonly');
      const store = transaction.objectStore('stockAlerts');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async updateStockAlert(alert: StockAlert): Promise<void> {
    await this.ensureDbConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['stockAlerts'], 'readwrite');
      const store = transaction.objectStore('stockAlerts');
      const request = store.put(alert);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const database = new Database();