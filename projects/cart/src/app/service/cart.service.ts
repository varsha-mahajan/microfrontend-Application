import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly CART_KEY = 'cartItems';

  private cartSubject = new BehaviorSubject<any[]>(
    this.getCartFromStorage()
  );

  cart$ = this.cartSubject.asObservable();

  constructor() {

    window.addEventListener(
      'cartUpdated',
      this.handleCartUpdated
    );
  }

  private handleCartUpdated = (): void => {

    const latestCart = this.getCartFromStorage();

    this.cartSubject.next(latestCart);
  };

  private getCartFromStorage(): any[] {

    const cart = localStorage.getItem(this.CART_KEY);

    return cart ? JSON.parse(cart) : [];
  }

  private saveCart(items: any[]): void {

    localStorage.setItem(
      this.CART_KEY,
      JSON.stringify(items)
    );

    this.cartSubject.next(items);

    // Notify other MFE
    window.dispatchEvent(
      new CustomEvent('cartUpdated')
    );
  }

  getCartItems(): any[] {

    return this.cartSubject.value;
  }

  increaseQuantity(item: any): void {

    const updatedCart = this.cartSubject.value.map(product => {

      if (product.key === item.key) {

        return {
          ...product,
          quantity: product.quantity + 1
        };

      }

      return product;
    });

    this.saveCart(updatedCart);
  }

  decreaseQuantity(item: any): void {

    const updatedCart = this.cartSubject.value
      .map(product => {

        if (product.key === item.key) {

          return {
            ...product,
            quantity: product.quantity - 1
          };

        }

        return product;
      })
      .filter(product => product.quantity > 0);

    this.saveCart(updatedCart);
  }

  removeItem(item: any): void {

    const updatedCart =
      this.cartSubject.value.filter(
        product => product.key !== item.key
      );

    this.saveCart(updatedCart);
  }

  clearCart(): void {

    localStorage.removeItem(this.CART_KEY);

    this.cartSubject.next([]);

    // Notify other MFE
    window.dispatchEvent(
      new CustomEvent('cartUpdated')
    );
  }
}