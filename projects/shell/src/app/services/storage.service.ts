export class UserStorageHelper {
  static getActiveEmail(): string {
    return (localStorage.getItem('userEmail') || '').trim().toLowerCase();
  }

  // CART
  static getUserCart(): any[] {
    const email = this.getActiveEmail();
    if (!email) return [];
    return JSON.parse(localStorage.getItem(`cart_${email}`) || '[]');
  }

  static saveUserCart(items: any[]): void {
    const email = this.getActiveEmail();
    if (email) {
      localStorage.setItem(`cart_${email}`, JSON.stringify(items));
    }
    // Mirror to transient global cart for remotes
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('mfe-cart-updated', { detail: items }));
  }

  // ORDERS
  static getUserOrders(): any[] {
    const email = this.getActiveEmail();
    if (!email) return [];
    return JSON.parse(localStorage.getItem(`orders_${email}`) || '[]');
  }

  static addUserOrder(order: any): void {
    const email = this.getActiveEmail();
    if (!email) return;

    const orders = this.getUserOrders();
    orders.unshift(order);
    localStorage.setItem(`orders_${email}`, JSON.stringify(orders));

    window.dispatchEvent(new CustomEvent('mfe-order-created', { detail: order }));
  }

  // SESSION TEARDOWN
  static clearSession(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('cart');
    localStorage.removeItem('orders');

    window.dispatchEvent(new CustomEvent('mfe-auth-change', { detail: { isLoggedIn: false } }));
    window.dispatchEvent(new CustomEvent('mfe-cart-updated', { detail: [] }));
  }
}