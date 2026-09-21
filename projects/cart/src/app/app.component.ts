import { Component, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CART_FALLBACK, CartMockConfig } from './constant/cart.constant';

@Component({
  selector: 'app-cart-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  showLoginModal: boolean = false;

  loginEmail: string = '';
  loginPassword: string = '';
  rememberMe: boolean = false;

  cartItems: any[] = [];

  // Seeded directly from the constant dictionary
  cartData = signal<Record<string, any>>(this.extractScreenMap(CART_FALLBACK));

  constructor(private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.checkAuthStatus();
    this.loadCartFromStorage();
    await this.loadCartContent();
  }

  private extractScreenMap(config: CartMockConfig): Record<string, any> {
    const screenGroup = config?.content?.find(
      (c) => c.screenIdentifier === 'cart-app-content'
    );
    const screenContent = screenGroup?.screenContent || [];

    return screenContent.reduce((acc, item) => {
      if (item?.key) {
        acc[item.key] = item;
      }
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

    // If source is missing or invalid, maintain target fallback values
    if (!source || typeof source !== 'object') {
      return output;
    }

    // Merge source values over target
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
        // Recursive merge for nested dictionary objects
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

  private async loadCartContent(): Promise<void> {
    const fallbackMap = this.extractScreenMap(CART_FALLBACK);

    try {
      const response = await fetch('http://localhost:4202/assets/data/aem-data.json');
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const config: CartMockConfig = await response.json();

      if (config && Array.isArray(config.content) && config.content.length > 0) {
        const dynamicMap = this.extractScreenMap(config);
        const mergedData = this.deepMerge(fallbackMap, dynamicMap);
        this.cartData.set(mergedData);
      } else {
        throw new Error('Invalid or empty JSON structure');
      }
    } catch (error) {
      console.warn('Unable to load cart aem-data.json, keeping CART_FALLBACK:', error);
      this.cartData.set(fallbackMap);
    }
  }

  revamp(): Record<string, any> {
    return this.cartData();
  }

  private getActiveUserEmail(): string {
    return (localStorage.getItem('userEmail') || '').trim().toLowerCase();
  }

  private getCartStorageKey(): string {
    const email = this.getActiveUserEmail();
    return email ? `cart_${email}` : 'cart';
  }

  private loadCartFromStorage(): void {
    const key = this.getCartStorageKey();
    const savedUserCart = localStorage.getItem(key);

    if (savedUserCart !== null) {
      this.cartItems = JSON.parse(savedUserCart);
    } else {
      const globalCart = localStorage.getItem('cart');
      this.cartItems = globalCart ? JSON.parse(globalCart) : [];
    }
  }

  private saveCartToStorage(): void {
    const key = this.getCartStorageKey();
    const serialized = JSON.stringify(this.cartItems);

    localStorage.setItem(key, serialized);
    localStorage.setItem('cart', serialized);

    window.dispatchEvent(new CustomEvent('mfe-cart-updated', { detail: this.cartItems }));
  }

  private checkAuthStatus(): void {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  }

  @HostListener('window:mfe-cart-updated', ['$event'])
  onCartUpdated(event: CustomEvent): void {
    if (event.detail && Array.isArray(event.detail)) {
      this.cartItems = event.detail;
    } else {
      this.loadCartFromStorage();
    }
  }

  @HostListener('window:mfe-auth-change', ['$event'])
  onAuthChange(event: CustomEvent): void {
    if (event.detail && typeof event.detail.isLoggedIn === 'boolean') {
      this.isLoggedIn = event.detail.isLoggedIn;
      this.loadCartFromStorage();
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent): void {
    if (event.key === 'isLoggedIn' || event.key === 'userEmail' || event.key?.startsWith('cart')) {
      this.checkAuthStatus();
      this.loadCartFromStorage();
    }
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  proceedToCheckout(): void {
    this.checkAuthStatus();

    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!this.isLoggedIn) {
      alert('Please login first to proceed to checkout!');
      this.showLoginModal = true;
    } else {
      try {
        this.router.navigate(['/checkout']);
      } catch {
        window.location.href = '/checkout';
      }
    }
  }

  loginAndCheckout(): void {
    if (!this.loginEmail.trim() || !this.loginPassword.trim()) {
      alert('Please enter email and password.');
      return;
    }

    const cleanEmail = this.loginEmail.trim().toLowerCase();

    // 1. Check Hardcoded Mock Account
    const isMockUser = cleanEmail === 'test@gmail.com' && this.loginPassword === '123456';

    // 2. Check Multi-User Registered Accounts
    const registeredUsers: any[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const isRegisteredUser = registeredUsers.some(
      (u) => u.email?.toLowerCase() === cleanEmail && u.password === this.loginPassword
    );

    // 3. Check Legacy Single Account
    const singleUser = JSON.parse(localStorage.getItem('registeredUser') || '{}');
    const isSingleUser = singleUser.email?.toLowerCase() === cleanEmail && singleUser.password === this.loginPassword;

    if (isMockUser || isRegisteredUser || isSingleUser) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', cleanEmail);

      // Load user-specific cart into state
      const scopedCartRaw = localStorage.getItem(`cart_${cleanEmail}`);
      const userCart = scopedCartRaw ? JSON.parse(scopedCartRaw) : [];
      localStorage.setItem('cart', JSON.stringify(userCart));
      this.cartItems = userCart;

      window.dispatchEvent(
        new CustomEvent('mfe-auth-change', {
          detail: { isLoggedIn: true, email: cleanEmail }
        })
      );
      window.dispatchEvent(new CustomEvent('mfe-cart-updated', { detail: userCart }));

      this.isLoggedIn = true;
      this.closeLoginModal();

      try {
        this.router.navigate(['/checkout']);
      } catch {
        window.location.href = '/checkout';
      }
    } else {
      alert('Invalid email or password.');
    }
  }

  continueShopping(): void {
    try {
      this.router.navigate(['/products']);
    } catch {
      window.location.href = '/products';
    }
  }

  trackByCartItem(index: number, item: any): number {
    return item.id || item.key || index;
  }

  increaseQuantity(item: any): void {
    item.quantity = (Number(item.quantity) || 1) + 1;
    this.saveCartToStorage();
  }

  decreaseQuantity(item: any): void {
    const currentQty = Number(item.quantity) || 1;
    if (currentQty > 1) {
      item.quantity = currentQty - 1;
      this.saveCartToStorage();
    }
  }

  removeItem(item: any): void {
    const itemKey = item.key || item.id || item.title;
    this.cartItems = this.cartItems.filter((i) => (i.key || i.id || i.title) !== itemKey);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCartToStorage();
  }

  /**
   * Calculates the total units/quantity of all items in the cart
   * to keep the cart header pill matched with the shell navbar badge.
   */
  getTotalItemCount(): number {
    return this.cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  }

  /**
   * Safely parses price regardless of whether it arrives as a number,
   * a currency string ("₹1,200.00"), or an object/undefined[cite: 1].
   */
  parseItemPrice(price: any): number {
    if (price === null || price === undefined) return 0;
    if (typeof price === 'number') return isNaN(price) ? 0 : price;

    const cleaned = String(price).replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  getSubtotal(): number {
    return this.cartItems.reduce((acc, item) => {
      const numericPrice = this.parseItemPrice(item.price);
      return acc + numericPrice * (Number(item.quantity) || 1);
    }, 0);
  }

  getDeliveryCharge(): number {
    return this.getSubtotal() > 500 || this.cartItems.length === 0 ? 0 : 50;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getDeliveryCharge();
  }
}

