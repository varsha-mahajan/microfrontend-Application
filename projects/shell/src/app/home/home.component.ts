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

  private async loadHomeContent(): Promise<void> {
    const fallbackMap = this.extractScreenMap(SHELL_FALLBACK);

    try {
      const response = await fetch('assets/data/shell-mock.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON. Status: ${response.status}`);
      }

      const config: ShellMockConfig = await response.json();

      if (config && Array.isArray(config.content) && config.content.length > 0) {
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
      this.homeData.set(fallbackMap);
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