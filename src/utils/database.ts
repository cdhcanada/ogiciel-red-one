import { Product, Invoice, Category } from '../types';

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
}

export const database = new Database();