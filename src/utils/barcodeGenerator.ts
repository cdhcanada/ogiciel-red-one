export class BarcodeGenerator {
  static generateEAN13(): string {
    // Generate 12 random digits
    let barcode = '';
    for (let i = 0; i < 12; i++) {
      barcode += Math.floor(Math.random() * 10).toString();
    }
    
    // Calculate check digit
    const checkDigit = this.calculateEAN13CheckDigit(barcode);
    return barcode + checkDigit;
  }

  static generateCode128(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return timestamp + random;
  }

  static generateCustom(prefix: string = 'PRD'): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private static calculateEAN13CheckDigit(barcode: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcode[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  static validateEAN13(barcode: string): boolean {
    if (barcode.length !== 13) return false;
    
    const checkDigit = barcode.slice(-1);
    const calculatedCheckDigit = this.calculateEAN13CheckDigit(barcode.slice(0, 12));
    
    return checkDigit === calculatedCheckDigit;
  }

  static formatBarcode(barcode: string, type: 'EAN13' | 'CODE128' = 'CODE128'): string {
    if (type === 'EAN13' && barcode.length === 13) {
      return barcode.replace(/(\d{1})(\d{6})(\d{6})/, '$1-$2-$3');
    }
    return barcode;
  }
}