import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { LoaderService } from './services/loader.service';
import { ContentService } from './services/content.service';
import { SHELL_FALLBACK, ShellMockConfig } from './constant/shells-fallback.constant';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  // Signals State
  isLoggedInSignal = signal<boolean>(false);
  cartCountSignal = signal<number>(0);

  // Backward-compatibility getters & setters for existing template bindings
  get isLoggedIn(): boolean {
    return this.isLoggedInSignal();
  }
  set isLoggedIn(val: boolean) {
    this.isLoggedInSignal.set(val);
  }

  get cartCount(): number {
    return this.cartCountSignal();
  }
  set cartCount(val: number) {
    this.cartCountSignal.set(val);
  }

  private authSub!: Subscription;

  // Signal storing dictionary-mapped content, seeded directly from constant fallback
  shellData = signal<Record<string, any>>(this.extractScreenMap(SHELL_FALLBACK));

  private cartListener = (event: any) => {
    const items = event?.detail || [];
    this.computeCartCount(items);
  };

  private authListener = (event: any) => {
    const status = event?.detail?.isLoggedIn ?? (localStorage.getItem('isLoggedIn') === 'true');
    this.isLoggedInSignal.set(status);
    this.refreshCartFromStorage();
  };

  private storageListener = (event: StorageEvent) => {
    if (
      event.key === 'cart' ||
      event.key?.startsWith('cart_') ||
      event.key === 'isLoggedIn' ||
      event.key === 'userEmail'
    ) {
      this.checkAuthState();
      this.refreshCartFromStorage();
    }
  };

  constructor(
    public loaderService: LoaderService,
    private authService: AuthService,
    private router: Router,
    public contentService: ContentService
  ) {}

  async ngOnInit(): Promise<void> {
    this.checkAuthState();
    this.refreshCartFromStorage();

    this.authSub = this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedInSignal.set(status);
      this.refreshCartFromStorage();
    });

    await this.loadShellContent();

    // Register global MFE and multi-tab listeners
    window.addEventListener('mfe-cart-updated', this.cartListener);
    window.addEventListener('mfe-auth-change', this.authListener);
    window.addEventListener('storage', this.storageListener);
  }

  private checkAuthState(): void {
    this.isLoggedInSignal.set(localStorage.getItem('isLoggedIn') === 'true');
  }

  private refreshCartFromStorage(): void {
    const currentEmail = (localStorage.getItem('userEmail') || '').trim().toLowerCase();
    let rawCart = '[]';

    // 1. Read user-isolated cart bucket if available
    if (currentEmail && localStorage.getItem(`cart_${currentEmail}`)) {
      rawCart = localStorage.getItem(`cart_${currentEmail}`)!;
    } else {
      // 2. Fallback to active session cart
      rawCart = localStorage.getItem('cart') || '[]';
    }

    try {
      const items = JSON.parse(rawCart);
      this.computeCartCount(items);
    } catch {
      this.cartCountSignal.set(0);
    }
  }

  /**
   * Sums the total quantity across all cart items so the badge count
   * matches the cart module header.
   */
  private computeCartCount(items: any[]): void {
    if (!Array.isArray(items) || items.length === 0) {
      this.cartCountSignal.set(0);
      return;
    }

    const totalQuantity = items.reduce(
      (total, item) => total + (Number(item.quantity) || 1),
      0
    );
    this.cartCountSignal.set(totalQuantity);
  }

  /**
   * Helper to convert Array content into a Key-Value Map
   */
  private extractScreenMap(config: ShellMockConfig): Record<string, any> {
    const screenGroup = config?.content?.find(
      (c) => c.screenIdentifier === 'shell-app-content'
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
   * Deep merges target and source objects so missing or empty keys fall back to constant
   */
  private deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output: Record<string, any> = { ...target };

    if (!source || typeof source !== 'object') {
      return output;
    }

    Object.keys(source).forEach((key) => {
      const sourceVal = source[key];
      const targetVal = target ? target[key] : undefined;

      // Check if value is an empty string or whitespace
      const isEmptyString = typeof sourceVal === 'string' && sourceVal.trim() === '';

      if (sourceVal === undefined || sourceVal === null || isEmptyString) {
        if (targetVal !== undefined) {
          output[key] = targetVal;
        }
      } else if (
        typeof sourceVal === 'object' &&
        !Array.isArray(sourceVal) &&
        typeof targetVal === 'object' &&
        !Array.isArray(targetVal)
      ) {
        output[key] = this.deepMerge(targetVal, sourceVal);
      } else {
        output[key] = sourceVal;
      }
    });

    return output;
  }

  private async loadShellContent(): Promise<void> {
    const fallbackMap = this.extractScreenMap(SHELL_FALLBACK);

    try {
      const response = await fetch('assets/data/shell-mock.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const config: ShellMockConfig = await response.json();

      if (config && Array.isArray(config.content) && config.content.length > 0) {
        const dynamicMap = this.extractScreenMap(config);
        const mergedData = this.deepMerge(fallbackMap, dynamicMap);
        this.shellData.set(mergedData);
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (error) {
      console.warn('Failed to load JSON data, falling back to SHELL_FALLBACK:', error);
      this.shellData.set(fallbackMap);
    }
  }

  /**
   * revamp() function used in HTML templates
   */
  revamp(): Record<string, any> {
    return this.shellData();
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedInSignal.set(false);
    this.cartCountSignal.set(0);

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('cart');
    localStorage.removeItem('orders');

    // Notify all remotes/MFEs of termination
    window.dispatchEvent(
      new CustomEvent('mfe-auth-change', {
        detail: { isLoggedIn: false }
      })
    );
    window.dispatchEvent(
      new CustomEvent('mfe-cart-updated', {
        detail: []
      })
    );

    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    window.removeEventListener('mfe-cart-updated', this.cartListener);
    window.removeEventListener('mfe-auth-change', this.authListener);
    window.removeEventListener('storage', this.storageListener);
  }
}