import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PRODUCTS_FALLBACK, ProductsMockConfig } from './constant/products-fallback.constant';
import { CartService } from './service/cart.service';

export interface ProductItem {
  id?: string | number;
  key?: string;
  title: string;
  name?: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  image?: string;
  thumbnail?: string;
  rating?: number | string;
  reviewCount?: string;
  buttonLabel?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'products';

  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly JSON_URL = 'http://localhost:4201/assets/data/aem-mock-data.json';
  // private readonly FALLBACK_REMOTE_URL = 'http://localhost:4201/assets/data/aem-mock-data.json';

  // Seeded directly from PRODUCTS_FALLBACK mapped dictionary
  productsData = signal<Record<string, any>>(this.extractScreenMap(PRODUCTS_FALLBACK));
  searchText = signal<string>('');
  selectedCategory = signal<string>('All');

  searchSubject = new Subject<string>();

  // Helper to extract clean numeric prices from strings with symbols/commas
  private parsePrice(price: any): number {
    if (price === null || price === undefined) return 0;
    if (typeof price === 'number') return isNaN(price) ? 0 : price;
    const cleaned = String(price).replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Extract product objects dynamically from dictionary while excluding metadata keys
  rawProducts = computed<ProductItem[]>(() => {
    const data = this.productsData();
    const reservedKeys = [
      'page-header',
      'search',
      'categories',
      'empty-state',
      'toast-messages'
    ];

    return Object.keys(data)
      .filter((k) => !reservedKeys.includes(k) && (data[k]?.title || data[k]?.name))
      .map((k) => {
        const item = data[k];
        const rawPrice = item.price ?? item.currentPrice ?? 0;
        const rawOldPrice = item.oldPrice ?? item.originalPrice;

        return {
          ...item,
          key: k,
          id: item.id || k,
          title: item.title || item.name,
          price: this.parsePrice(rawPrice),
          oldPrice: rawOldPrice !== undefined ? this.parsePrice(rawOldPrice) : undefined,
          image: item.image || item.thumbnail
        };
      });
  });

  // Dynamic category tabs mapped directly from AEM revamp dictionary
  categories = computed(() => {
    const catLabels = this.productsData()['categories'] || {};
    return [
      { label: catLabels.all || 'All', value: 'All' },
      { label: catLabels.mobiles || 'Mobiles', value: 'Mobile' },
      { label: catLabels.laptops || 'Laptops', value: 'Laptop' },
      { label: catLabels.accessories || 'Accessories', value: 'Accessories' }
    ];
  });

  // Automatically filters products when search input, category, or revamp data updates
  filteredProducts = computed<ProductItem[]>(() => {
    const term = this.searchText().trim().toLowerCase();
    const category = this.selectedCategory().toLowerCase();
    const products = this.rawProducts();

    return products.filter((product) => {
      const titleMatch = product?.title?.toLowerCase().includes(term);
      const categoryTextMatch = product?.category?.toLowerCase().includes(term);
      const descMatch = product?.description?.toLowerCase().includes(term);
      const matchesSearch = !term || titleMatch || categoryTextMatch || descMatch;

      const matchesCategory =
        category === 'all' || product?.category?.toLowerCase() === category;

      return matchesSearch && matchesCategory;
    });
  });

  constructor() {
    this.searchSubject
      .pipe(
        map((value) => value || ''),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.searchText.set(value);
      });
  }

  ngOnInit(): void {
    this.listenToQueryParams();
    this.loadProductsContent();
  }

  private extractScreenMap(config: ProductsMockConfig): Record<string, any> {
    const screenGroup = config?.content?.find(
      (c) => c.screenIdentifier === 'products-app-content' || c.screenIdentifier === 'products'
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

    if (!source || typeof source !== 'object') {
      return output;
    }

    Object.keys(source).forEach((key) => {
      const sourceVal = source[key];
      const targetVal = target ? target[key] : undefined;

      // Check if value is blank/whitespace
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

  private loadProductsContent(): void {
    const fallbackMap = this.extractScreenMap(PRODUCTS_FALLBACK);

    this.http
      .get<ProductsMockConfig>(this.JSON_URL)
      .pipe(
        catchError(() => {
          return this.http.get<ProductsMockConfig>(this.JSON_URL).pipe(
            catchError((err) => {
              console.warn('Unable to load mock data JSON, defaulting to constant:', err);
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (response && Array.isArray(response.content) && response.content.length > 0) {
          const dynamicMap = this.extractScreenMap(response);
          const merged = this.deepMerge(fallbackMap, dynamicMap);
          this.productsData.set(merged);
        } else {
          this.productsData.set(fallbackMap);
        }
      });
  }

  /**
   * Primary standard dictionary accessor for template bindings
   */
  revamp(): Record<string, any> {
    return this.productsData();
  }

  revampFallback(): Record<string, any> {
    return this.revamp();
  }

  labelsData(): Record<string, any> {
    return this.revamp();
  }

  private listenToQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const catParam = params['category'];
        if (catParam) {
          const upperCat = String(catParam).toUpperCase();
          if (upperCat.includes('MOBILE')) {
            this.selectedCategory.set('Mobile');
          } else if (upperCat.includes('LAPTOP')) {
            this.selectedCategory.set('Laptop');
          } else if (upperCat.includes('ACCESSOR')) {
            this.selectedCategory.set('Accessories');
          } else {
            this.selectedCategory.set('All');
          }
        }
      });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  showAllProducts(): void {
    this.selectedCategory.set('All');
    this.searchText.set('');
    this.searchSubject.next('');
  }

  trackByCategory(index: number, category: any): string {
    return category?.value || index.toString();
  }

  trackByProduct(index: number, product: any): string {
    return product?.key || product?.id || index.toString();
  }

  addToCart(product: any): void {
    if (!product) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const email = (localStorage.getItem('userEmail') || '').trim().toLowerCase();

    // 1. Guard unauthorized actions
    if (!isLoggedIn || !email) {
      alert('Please log in to add items to your cart.');
      try {
        this.router.navigate(['/login']);
      } catch {
        window.location.href = '/login';
      }
      return;
    }

    // 2. Identify Storage Keys
    const storageKey = `cart_${email}`;

    let cart: any[] = [];
    try {
      cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      cart = [];
    }

    // Ensure price is converted to a clean numeric value
    const itemPrice = this.parsePrice(product.price ?? product.currentPrice);
    const productId = product.id || product.key || product.title;

    const existingIndex = cart.findIndex(
      (item: any) => (item.id || item.key || item.title) === productId
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity = (Number(cart[existingIndex].quantity) || 1) + 1;
      // Self-heal price in storage if previous payload lacked clean price
      if (!cart[existingIndex].price || isNaN(cart[existingIndex].price)) {
        cart[existingIndex].price = itemPrice;
      }
    } else {
      cart.push({
        id: productId,
        key: product.key || productId,
        title: product.title || product.name,
        category: product.category,
        description: product.description,
        price: itemPrice,
        image: product.image || product.thumbnail,
        quantity: 1
      });
    }

    // 3. Update User-Isolated Storage and Mirror Active Session
    localStorage.setItem(storageKey, JSON.stringify(cart));
    localStorage.setItem('cart', JSON.stringify(cart));

    // 4. Broadcast to Shell Navbar and Other MFEs
    window.dispatchEvent(
      new CustomEvent('mfe-cart-updated', {
        detail: cart
      })
    );

    // 5. Optional Local Service Sync
    if (this.cartService && typeof this.cartService.addToCart === 'function') {
      try {
        this.cartService.addToCart({ ...product, price: itemPrice });
      } catch {
        // Fallback handled by storage & CustomEvent
      }
    }

    alert(`${product.title || 'Product'} added to cart!`);
  }

  @HostListener('window:mfe-auth-change', ['$event'])
  onAuthChange(event?: any): void {
    if (event?.detail?.isLoggedIn === false) {
      this.selectedCategory.set('All');
    }
  }
}