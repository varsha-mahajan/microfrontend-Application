import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../services/oders.service';
import { SHELL_FALLBACK, ShellMockConfig } from '../constant/shells-fallback.constant';

export interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'ONLINE' | 'COD';
  onlineSubMethod: 'UPI' | 'CARD' | 'NETBANKING';
  upiId: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  selectedBank: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  submitted: boolean = false;

  checkoutData: CheckoutForm = {
    fullName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    paymentMethod: 'ONLINE',
    onlineSubMethod: 'UPI',
    upiId: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    selectedBank: 'HDFC Bank'
  };

  checkoutDataUi = signal<Record<string, any>>(this.extractScreenMap(SHELL_FALLBACK));

  constructor(
    private router: Router,
    private ordersService: OrdersService
  ) {}

  async ngOnInit(): Promise<void> {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const savedEmail = (localStorage.getItem('userEmail') || '').trim().toLowerCase();
    if (savedEmail) {
      this.checkoutData.email = savedEmail;
    }

    // Prefill name & phone from registered profile if available
    const storedUserRaw = localStorage.getItem('registeredUser');
    if (storedUserRaw) {
      try {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed.name) this.checkoutData.fullName = parsed.name;
        if (parsed.phone) this.checkoutData.phone = parsed.phone;
      } catch (e) {
        console.error('Error reading registeredUser', e);
      }
    }

    // Scoped cart extraction
    const userCartKey = savedEmail ? `cart_${savedEmail}` : 'cart';
    const savedCart = localStorage.getItem(userCartKey) || localStorage.getItem('cart');
    this.cartItems = savedCart ? JSON.parse(savedCart) : [];

    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    await this.loadCheckoutContent();
  }

  private extractScreenMap(config: ShellMockConfig): Record<string, any> {
    const screenGroup = config?.content?.find((c) => c.screenIdentifier === 'shell-app-content');
    const screenContent = screenGroup?.screenContent || [];
    return screenContent.reduce((acc, item) => {
      if (item?.key) acc[item.key] = item;
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * First priority goes to Dynamic JSON data.
   * If a dynamic key is missing, null, undefined, or an empty/whitespace string,
   * it falls back to the constant fallback value.
   */
  private deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output: Record<string, any> = { ...target };

    if (!source || typeof source !== 'object') {
      return output;
    }

    Object.keys(source).forEach((key) => {
      const sourceVal = source[key];
      const targetVal = target ? target[key] : undefined;

      // Detect empty or whitespace-only string in JSON
      const isEmptySourceString = typeof sourceVal === 'string' && sourceVal.trim() === '';

      if (
        typeof sourceVal === 'object' &&
        sourceVal !== null &&
        !Array.isArray(sourceVal) &&
        typeof targetVal === 'object' &&
        targetVal !== null &&
        !Array.isArray(targetVal)
      ) {
        output[key] = this.deepMerge(targetVal, sourceVal);
      } else if (sourceVal !== undefined && sourceVal !== null && !isEmptySourceString) {
        // 1st Priority: valid dynamic value from JSON
        output[key] = sourceVal;
      } else if (targetVal !== undefined) {
        // Fallback: keep constant value if JSON key is blank or invalid
        output[key] = targetVal;
      }
    });

    // Ensure any keys present in target but completely missing in source are preserved
    if (target && typeof target === 'object') {
      Object.keys(target).forEach((key) => {
        if (
          output[key] === undefined ||
          output[key] === null ||
          (typeof output[key] === 'string' && output[key].trim() === '')
        ) {
          output[key] = target[key];
        }
      });
    }

    return output;
  }

  private async loadCheckoutContent(): Promise<void> {
    const fallbackMap = this.extractScreenMap(SHELL_FALLBACK);

    try {
      const response = await fetch('assets/data/shell-mock.json');
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const config: ShellMockConfig = await response.json();

      if (config && Array.isArray(config.content) && config.content.length > 0) {
        const dynamicMap = this.extractScreenMap(config);
        const mergedData = this.deepMerge(fallbackMap, dynamicMap);
        this.checkoutDataUi.set(mergedData);
      } else {
        throw new Error('Invalid or empty JSON structure');
      }
    } catch (error) {
      console.warn('Unable to load shell-mock.json, keeping SHELL_FALLBACK:', error);
      this.checkoutDataUi.set(fallbackMap);
    }
  }

  revamp(): Record<string, any> {
    return this.checkoutDataUi();
  }

  parsePrice(price: string | number): number {
    if (typeof price === 'number') return price;
    return Number(String(price).replace(/[^0-9.-]+/g, '')) || 0;
  }

  getSubtotal(): number {
    return this.cartItems.reduce(
      (acc, item) => acc + this.parsePrice(item.price) * (item.quantity || 1),
      0
    );
  }

  getDeliveryCharge(): number {
    return this.getSubtotal() > 500 || this.cartItems.length === 0 ? 0 : 50;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getDeliveryCharge();
  }

  // --- Realtime Input Formatters ---

  formatCardNumber(event: any): void {
    const value = event.target.value.replace(/\D/g, '').substring(0, 16);
    const chunks = value.match(/.{1,4}/g);
    this.checkoutData.cardNumber = chunks ? chunks.join(' ') : value;
  }

  formatExpiry(event: any): void {
    const value = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 3) {
      this.checkoutData.cardExpiry = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    } else {
      this.checkoutData.cardExpiry = value;
    }
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    return charCode >= 48 && charCode <= 57;
  }

  // --- Granular Validation Checks ---

  isExpiryValid(): boolean {
    const raw = this.checkoutData.cardExpiry.trim();
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(raw)) return false;

    const [expMonthStr, expYearStr] = raw.split('/');
    const expMonth = parseInt(expMonthStr, 10);
    const expYear = parseInt('20' + expYearStr, 10);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    return true;
  }

  isPaymentValid(): boolean {
    if (this.checkoutData.paymentMethod === 'COD') {
      return true;
    }

    if (this.checkoutData.paymentMethod === 'ONLINE') {
      if (this.checkoutData.onlineSubMethod === 'UPI') {
        return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(this.checkoutData.upiId.trim());
      }

      if (this.checkoutData.onlineSubMethod === 'CARD') {
        const cleanCard = this.checkoutData.cardNumber.replace(/\s+/g, '');
        const validCard = /^\d{16}$/.test(cleanCard);
        const validExpiry = this.isExpiryValid();
        const validCvv = /^\d{3}$/.test(this.checkoutData.cardCvv.trim());
        return validCard && validExpiry && validCvv;
      }

      if (this.checkoutData.onlineSubMethod === 'NETBANKING') {
        return !!this.checkoutData.selectedBank;
      }
    }

    return false;
  }

  placeOrder(form: NgForm): void {
    this.submitted = true;

    if (form.invalid || !this.isPaymentValid()) {
      return;
    }

    const currentEmail = (localStorage.getItem('userEmail') || this.checkoutData.email || '').trim().toLowerCase();
    const userOrdersKey = currentEmail ? `orders_${currentEmail}` : 'orders';
    const userCartKey = currentEmail ? `cart_${currentEmail}` : 'cart';

    const paymentLabel =
      this.checkoutData.paymentMethod === 'ONLINE'
        ? `Paid Online (${this.checkoutData.onlineSubMethod})`
        : 'Cash on Delivery';

    const orderPayload = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      date: new Date().toISOString(),
      totalAmount: this.getTotal(),
      paymentMethod: paymentLabel,
      deliveryStatus: 'Order Confirmed',
      shippingAddress: { ...this.checkoutData, email: currentEmail },
      items: this.cartItems.map((item) => ({
        name: item.title || item.name,
        price: this.parsePrice(item.price),
        quantity: item.quantity || 1,
        image: item.image || item.img || ''
      }))
    };

    // Update optional orders service
    try {
      if (typeof this.ordersService?.addOrder === 'function') {
        this.ordersService.addOrder(orderPayload.items, orderPayload.totalAmount);
      }
    } catch {
      // Direct local storage persistence fallback
    }

    // Persist to user's isolated list
    const userExistingOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
    userExistingOrders.unshift(orderPayload);
    localStorage.setItem(userOrdersKey, JSON.stringify(userExistingOrders));

    // Global mirror fallback
    const globalExistingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    globalExistingOrders.unshift(orderPayload);
    localStorage.setItem('orders', JSON.stringify(globalExistingOrders));

    // Empty scoped cart
    localStorage.setItem(userCartKey, JSON.stringify([]));
    localStorage.setItem('cart', JSON.stringify([]));
    this.cartItems = [];

    // Dispatch sync events across Shell and Remotes
    window.dispatchEvent(new CustomEvent('mfe-cart-updated', { detail: [] }));
    window.dispatchEvent(new CustomEvent('mfe-order-created', { detail: orderPayload }));

    alert(`Order Placed Successfully! (${paymentLabel})`);
    this.router.navigate(['/orders']);
  }

  backToCart(): void {
    this.router.navigate(['/cart']);
  }
}