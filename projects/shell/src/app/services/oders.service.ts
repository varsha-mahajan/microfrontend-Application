import { Injectable } from '@angular/core';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  date: Date;
  items: OrderItem[];
  totalAmount: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private key = 'shop_easy_orders';

  getOrders(): Order[] {
    const saved = localStorage.getItem(this.key);
    return saved ? JSON.parse(saved) : [];
  }

  addOrder(items: OrderItem[], totalAmount: number): void {
    const orders = this.getOrders();
    orders.unshift({
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date(),
      items,
      totalAmount
    });
    localStorage.setItem(this.key, JSON.stringify(orders));
  }
}