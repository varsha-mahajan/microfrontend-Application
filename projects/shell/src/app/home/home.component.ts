import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MockApiService } from '../services/mock-api.service';
import { ContentService } from '../services/content.service';
import { ShellMockConfig, SHELL_FALLBACK } from '../constant/shells-fallback.constant';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  errorMessage = '';

  // Signal seeded directly from SHELL_FALLBACK dictionary map
  homeData = signal<Record<string, any>>(this.extractScreenMap(SHELL_FALLBACK));

  constructor(
    private router: Router,
    private mockApiService: MockApiService,
    public contentService: ContentService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadHomeContent();
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
   * Deep merges dynamic content onto constant fallback to prevent missing keys
   */
  private deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output = { ...target };

    if (source && typeof source === 'object') {
      Object.keys(source).forEach((key) => {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          target[key] &&
          typeof target[key] === 'object' &&
          !Array.isArray(target[key])
        ) {
          output[key] = this.deepMerge(target[key], source[key]);
        } else if (source[key] !== undefined && source[key] !== null) {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  private async loadHomeContent(): Promise<void> {
    try {
      const response = await fetch('assets/data/shell-mock.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON. Status: ${response.status}`);
      }

      const config: ShellMockConfig = await response.json();

      if (config && Array.isArray(config.content) && config.content.length > 0) {
        const fallbackMap = this.extractScreenMap(SHELL_FALLBACK);
        const dynamicMap = this.extractScreenMap(config);

        const mergedData = this.deepMerge(fallbackMap, dynamicMap);

        // Enforce strictly 3 categories
        if (mergedData['home-categories']?.list) {
          mergedData['home-categories'].list = mergedData['home-categories'].list.filter((item: any) =>
            ['MOBILE', 'LAPTOP', 'ACCESSORIES', 'MOBILES', 'LAPTOPS'].includes(item.name?.toUpperCase())
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
      console.warn('Falling back to SHELL_FALLBACK constant:', error);
      this.homeData.set(this.extractScreenMap(SHELL_FALLBACK));
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

    if (name.includes('MOBILE')) {
      categoryKey = 'Mobile';
    } else if (name.includes('LAPTOP')) {
      categoryKey = 'Laptop';
    } else if (name.includes('ACCESSOR')) {
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