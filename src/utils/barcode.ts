export class BarcodeScanner {
  private listeners: Array<(barcode: string) => void> = [];
  private barcodeBuffer = '';
  private lastKeyTime = 0;

  constructor() {
    this.setupKeyboardListener();
  }

  private setupKeyboardListener() {
    document.addEventListener('keydown', (event) => {
      const currentTime = Date.now();
      
      // If more than 50ms between keystrokes, reset buffer
      if (currentTime - this.lastKeyTime > 50) {
        this.barcodeBuffer = '';
      }

      this.lastKeyTime = currentTime;

      // Handle Enter key (end of barcode)
      if (event.key === 'Enter' && this.barcodeBuffer.length > 0) {
        event.preventDefault();
        this.notifyListeners(this.barcodeBuffer);
        this.barcodeBuffer = '';
        return;
      }

      // Add character to buffer if it's a valid barcode character
      if (this.isValidBarcodeChar(event.key)) {
        this.barcodeBuffer += event.key;
      }
    });
  }

  private isValidBarcodeChar(char: string): boolean {
    return /^[0-9a-zA-Z\-_.]$/.test(char);
  }

  private notifyListeners(barcode: string) {
    this.listeners.forEach(listener => listener(barcode));
  }

  public onBarcodeScanned(callback: (barcode: string) => void) {
    this.listeners.push(callback);
  }

  public removeBarcodeListener(callback: (barcode: string) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
}

export const barcodeScanner = new BarcodeScanner();