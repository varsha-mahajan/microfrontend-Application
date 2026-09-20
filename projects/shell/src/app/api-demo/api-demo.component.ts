import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductApiService } from '../services/product-api.service';

@Component({
  selector: 'app-api-demo',
  // standalone: true,
  // imports: [CommonModule],
  templateUrl: './api-demo.component.html',
  styleUrls: ['./api-demo.component.scss']
})
export class ApiDemoComponent implements OnInit {

  products: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private productApiService: ProductApiService) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {

    this.loading = true;
    this.errorMessage = '';

    this.productApiService.getProducts().subscribe({
      next: (response) => {
        this.products = response.products;
        this.loading = false;

        console.log('API Response:', response);
      },

      error: (error) => {
        console.error('API Error:', error);
        this.errorMessage = 'Unable to load products.';
        this.loading = false;
      }
    });
  }
}