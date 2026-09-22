import { Component, OnInit, signal, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MockApiService } from '../services/mock-api.service';
import { ContentService } from '../services/content.service';
import { 
  ShellMockConfig, 
  SHELL_FALLBACK, 
  SHELL_FALLBACK_HI 
} from '../constant/shells-fallback.constant';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  errorMessage = '';

  // Supported languages list
  availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' }
  ];

  // Active language state initialized from localStorage or default 'en'
  selectedLang = signal<string>(localStorage.getItem('preferredLang') || 'en');

  // Seed signal initially with the respective language constant fallback
  homeData = signal<Record<string, any>>(
    this.extractScreenMap(
      (localStorage.getItem('preferredLang') || 'en') === 'hi' 
        ? SHELL_FALLBACK_HI 
        : SHELL_FALLBACK
    )
  );

  constructor(
    private router: Router,
    private mockApiService: MockApiService,
    public contentService: ContentService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadHomeContent(this.selectedLang());
  }

  /**
   * Selects language-specific constant fallback (English vs Hindi)
   */
  private getFallbackConfig(lang: string): ShellMockConfig {
    return lang === 'hi' ? SHELL_FALLBACK_HI : SHELL_FALLBACK;
  }

  /**
   * Converts raw content array into a key-value dictionary
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

      // Detect empty or whitespace-only string in dynamic JSON
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
        // Fallback: keep constant value if JSON key is blank, null, or undefined
        output[key] = targetVal;
      }
    });

    // Ensure any keys present in constant target but missing in dynamic JSON are preserved
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

  /**
   * Loads language-specific mock JSON (shell-mock-hi.json or shell-mock.json)
   * Falls back to SHELL_FALLBACK_HI or SHELL_FALLBACK based on current locale
   */
  private async loadHomeContent(lang: string = 'en'): Promise<void> {
    const activeFallback = this.getFallbackConfig(lang);
    const fallbackMap = this.extractScreenMap(activeFallback);
    const fileName = lang === 'hi' ? 'assets/data/shell-mock-hi.json' : 'assets/data/shell-mock.json';

    try {
      const response = await fetch(fileName);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}. Status: ${response.status}`);
      }

      const config: ShellMockConfig = await response.json();

      if (config && Array.isArray(config.content) && config.content.length > 0) {
        const dynamicMap = this.extractScreenMap(config);
        const mergedData = this.deepMerge(fallbackMap, dynamicMap);

        // Enforce strictly 3 categories (supporting both English and Hindi naming)
        if (mergedData['home-categories']?.list) {
          const allowedCategories = [
            'MOBILE', 'LAPTOP', 'ACCESSORIES', 'MOBILES', 'LAPTOPS',
            'मोबाइल', 'लैपटॉप', 'एक्सेसरीज़', 'सामान'
          ];
          mergedData['home-categories'].list = mergedData['home-categories'].list.filter((item: any) =>
            allowedCategories.includes(item.name?.toUpperCase())
          );
        }

        // Filter out unwanted cards from featured products
        if (mergedData['home-featured-products']?.products) {
          mergedData['home-featured-products'].products = mergedData['home-featured-products'].products.filter(
            (prod: any) => prod?.title !== 'Samsung Galaxy' && prod?.title !== 'Wireless Headphones'
          );
        }

        this.homeData.set(mergedData);
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (error) {
      console.warn(`Dynamic JSON load failed for '${lang}', falling back to constant:`, error);
      this.homeData.set(fallbackMap);
    }
  }

  /**
   * Language Switch Trigger from UI
   */
  async changeLanguage(lang: string): Promise<void> {
    if (this.selectedLang() === lang) return;

    this.selectedLang.set(lang);
    localStorage.setItem('preferredLang', lang);
    await this.loadHomeContent(lang);

    // Broadcast across micro-frontends (Products MFE, Cart MFE, Shell)
    window.dispatchEvent(
      new CustomEvent('mfe-lang-change', {
        detail: { lang }
      })
    );
  }

  /**
   * Sync with language change event triggered from other MFEs
   */
  @HostListener('window:mfe-lang-change', ['$event'])
  async onLanguageChange(event: CustomEvent): Promise<void> {
    const newLang = event?.detail?.lang;
    if (newLang && newLang !== this.selectedLang()) {
      this.selectedLang.set(newLang);
      await this.loadHomeContent(newLang);
    }
  }

  /**
   * Sync when another browser tab updates localStorage
   */
  @HostListener('window:storage', ['$event'])
  async onStorageChange(event: StorageEvent): Promise<void> {
    if (event.key === 'preferredLang') {
      const newLang = event.newValue || 'en';
      if (newLang !== this.selectedLang()) {
        this.selectedLang.set(newLang);
        await this.loadHomeContent(newLang);
      }
    }
  }

  /**
   * revamp() method consumed by HTML
   */
  revamp(): Record<string, any> {
    return this.homeData();
  }

  /**
   * Direct category navigation to Products MFE
   */
  navigateToCategory(categoryName: string): void {
    let categoryKey = 'All';
    const name = (categoryName || '').toUpperCase();

    if (name.includes('MOBILE') || name.includes('मोबाइल')) {
      categoryKey = 'Mobile';
    } else if (name.includes('LAPTOP') || name.includes('लैपटॉप')) {
      categoryKey = 'Laptop';
    } else if (name.includes('ACCESSOR') || name.includes('एक्सेसरीज़') || name.includes('सामान')) {
      categoryKey = 'Accessories';
    }

    this.router.navigate(['/products'], { queryParams: { category: categoryKey } });
  }

  getProducts(): void {
    this.errorMessage = '';
    this.mockApiService.getProducts().subscribe({
      next: (response) => {
        this.products = response.products;
      },
      error: (error) => {
        console.error('Error received in Home:', error);
        this.errorMessage = 'Unable to load products.';
      }
    });
  }

  testError(): void {
    this.errorMessage = '';
    this.mockApiService.getInvalidApi().subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error received in Home:', error);
        this.errorMessage = 'Something went wrong. Please try again.';
      }
    });
  }
}