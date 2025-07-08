import { database } from './database';
import { Product, StockAlert } from '../types';

export class StockAlertManager {
  private static instance: StockAlertManager;
  
  static getInstance(): StockAlertManager {
    if (!StockAlertManager.instance) {
      StockAlertManager.instance = new StockAlertManager();
    }
    return StockAlertManager.instance;
  }

  async checkStockLevels(): Promise<void> {
    try {
      const products = await database.getAllProducts();
      const existingAlerts = await database.getAllStockAlerts();
      
      for (const product of products) {
        await this.checkProductStock(product, existingAlerts);
      }
    } catch (error) {
      console.error('Error checking stock levels:', error);
    }
  }

  private async checkProductStock(product: Product, existingAlerts: StockAlert[]): Promise<void> {
    const lowStockThreshold = 5;
    const outOfStockThreshold = 0;

    // Check if alert already exists for this product
    const existingAlert = existingAlerts.find(
      alert => alert.productId === product.id && !alert.acknowledged
    );

    if (product.quantity <= outOfStockThreshold && !existingAlert) {
      await this.createAlert(product, 'out_of_stock', outOfStockThreshold);
    } else if (product.quantity <= lowStockThreshold && product.quantity > outOfStockThreshold && !existingAlert) {
      await this.createAlert(product, 'low_stock', lowStockThreshold);
    }
  }

  private async createAlert(product: Product, alertType: 'low_stock' | 'out_of_stock', threshold: number): Promise<void> {
    const alert: StockAlert = {
      id: Date.now().toString() + Math.random(),
      productId: product.id,
      product,
      alertType,
      threshold,
      currentQuantity: product.quantity,
      createdAt: new Date(),
      acknowledged: false
    };

    await database.addStockAlert(alert);
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const alerts = await database.getAllStockAlerts();
      const alert = alerts.find(a => a.id === alertId);
      
      if (alert) {
        alert.acknowledged = true;
        await database.updateStockAlert(alert);
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }
}

export const stockAlertManager = StockAlertManager.getInstance();