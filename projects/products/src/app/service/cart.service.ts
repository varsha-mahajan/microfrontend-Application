import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly CART_KEY = 'cartItems';

  addToCart(product: any): void {

    const cartItems = this.getCartItems();

    const existingProduct = cartItems.find(
      item => item.title === product.title
    );

    if (existingProduct) {

      existingProduct.quantity += 1;

    } else {

      cartItems.push({
        ...product,
        quantity: 1
      });

    }

    localStorage.setItem(
      this.CART_KEY,
      JSON.stringify(cartItems)
    );

    // Notify Cart MFE
    window.dispatchEvent(
      new CustomEvent('cartUpdated')
    );

    console.log('Product added to cart:', product);
  }

  getCartItems(): any[] {

    const cart = localStorage.getItem(this.CART_KEY);

    return cart ? JSON.parse(cart) : [];
  }
}