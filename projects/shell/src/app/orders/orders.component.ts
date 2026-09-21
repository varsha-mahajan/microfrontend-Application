import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdersService } from '../services/oders.service';
import { SHELL_FALLBACK, ShellMockConfig } from '../constant/shells-fallback.constant';

export type OrderStatus = 'Order Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export interface TrackingStep {
  label: string;
  status: 'completed' | 'active' | 'pending';
  icon: string;
  date?: string;
}

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface EnrichedOrder {
  id: string | number;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{ name: string; price: number; quantity: number; image?: string }>;
  deliveryStatus: OrderStatus;
  statusBadgeText: string;
  badgeClass: string;
  shippingAddress?: ShippingAddress;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: EnrichedOrder[] = [];
  isLoggedIn: boolean = false;
  selectedOrder: EnrichedOrder | null = null;

  ordersData = signal<Record<string, any>>(this.extractScreenMap(SHELL_FALLBACK));

  private authListener = (event: any) => {
    this.isLoggedIn = event?.detail?.isLoggedIn ?? (localStorage.getItem('isLoggedIn') === 'true');
    this.loadOrdersList();
  };

  private orderListener = () => {
    this.loadOrdersList();
  };

  private storageListener = (event: StorageEvent) => {
    if (
      event.key?.startsWith('orders') ||
      event.key === 'isLoggedIn' ||
      event.key === 'userEmail'
    ) {
      this.checkAuthStatus();
    }
  };

  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.checkAuthStatus();
    await this.loadOrdersContent();
    window.addEventListener('mfe-auth-change', this.authListener);
    window.addEventListener('mfe-order-created', this.orderListener);
    window.addEventListener('storage', this.storageListener);
  }

  private checkAuthStatus(): void {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.loadOrdersList();
  }

  private loadOrdersList(): void {
    if (!this.isLoggedIn) {
      this.orders = [];
      return;
    }

    const currentEmail = (localStorage.getItem('userEmail') || '').trim().toLowerCase();

    // 1. Read directly from active user's isolated storage bucket
    let userSpecificOrders: any[] = [];
    if (currentEmail) {
      const userOrdersRaw = localStorage.getItem(`orders_${currentEmail}`);
      if (userOrdersRaw !== null) {
        try {
          userSpecificOrders = JSON.parse(userOrdersRaw);
        } catch {
          userSpecificOrders = [];
        }
      }
    }

    // 2. Fallback: Filter legacy shared orders for this user's email if isolated bucket is missing
    if (userSpecificOrders.length === 0 && currentEmail) {
      try {
        const legacyOrders: any[] = JSON.parse(localStorage.getItem('orders') || '[]');
        userSpecificOrders = legacyOrders.filter(
          (o: any) => o.shippingAddress?.email?.toLowerCase() === currentEmail
        );
      } catch {
        userSpecificOrders = [];
      }
    }

    // 3. Enrich items with lifecycle badges and default placeholder fallbacks
    const placeholder = this.revamp()?.[ 'orders-content' ]?.[ 'placeholderImage' ] || 'https://via.placeholder.com/60?text=Product';

    this.orders = userSpecificOrders.map((order: any, index: number) => {
      const sanitizedItems = (order.items || []).map((item: any) => ({
        ...item,
        image: item.image || placeholder
      }));

      return this.assignOrderStatus({ ...order, items: sanitizedItems }, index);
    });
  }

  private assignOrderStatus(order: any, index: number): EnrichedOrder {
    const cycleStages: OrderStatus[] = [
      'Order Confirmed',
      'Out for Delivery',
      'Delivered',
      'Shipped'
    ];

    let currentStatus: OrderStatus = order.deliveryStatus;
    if (!currentStatus || currentStatus === 'Order Confirmed') {
      currentStatus = cycleStages[index % cycleStages.length];
    }

    const isCompleted = currentStatus === 'Delivered';
    const completedBadge = this.revamp()?.[ 'orders-content' ]?.[ 'statusCompleted' ] || 'Completed';

    let paymentMode = this.revamp()?.[ 'orders-content' ]?.[ 'paymentMethodValue' ] || 'Paid Online';
    if (order.paymentMethod) {
      paymentMode = order.paymentMethod;
    } else if (order.payment) {
      paymentMode = order.payment;
    }

    return {
      ...order,
      paymentMethod: paymentMode,
      deliveryStatus: currentStatus,
      statusBadgeText: isCompleted ? completedBadge : currentStatus,
      badgeClass: isCompleted
        ? 'badge-completed'
        : currentStatus === 'Out for Delivery'
        ? 'badge-out'
        : currentStatus === 'Shipped'
        ? 'badge-shipped'
        : 'badge-confirmed'
    };
  }

  private extractScreenMap(config: ShellMockConfig): Record<string, any> {
    const screenGroup = config?.content?.find((c) => c.screenIdentifier === 'shell-app-content');
    const screenContent = screenGroup?.screenContent || [];
    return screenContent.reduce((acc, item) => {
      if (item?.key) acc[item.key] = item;
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

  private async loadOrdersContent(): Promise<void> {
    const fallbackMap = this.extractScreenMap(SHELL_FALLBACK);

    try {
      const response = await fetch('assets/data/shell-mock.json');
      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const config: ShellMockConfig = await response.json();

      if (config && Array.isArray(config.content) && config.content.length > 0) {
        const dynamicMap = this.extractScreenMap(config);
        const mergedData = this.deepMerge(fallbackMap, dynamicMap);
        this.ordersData.set(mergedData);
        // Re-enrich orders to apply loaded statusCompleted or currency labels
        this.loadOrdersList();
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (error) {
      console.warn('Unable to load shell-mock.json, falling back to SHELL_FALLBACK constant:', error);
      this.ordersData.set(fallbackMap);
    }
  }

  revamp(): Record<string, any> {
    return this.ordersData();
  }

  openTracking(order: EnrichedOrder): void {
    this.selectedOrder = order;
  }

  closeTracking(): void {
    this.selectedOrder = null;
  }

  getOrderTrackingSteps(order: EnrichedOrder): TrackingStep[] {
    const baseDate = new Date(order.date || new Date());
    const orderStatus = order.deliveryStatus;
    const cfg = this.revamp()?.[ 'orders-content' ] || {};

    const stages: OrderStatus[] = ['Order Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStageIndex = stages.indexOf(orderStatus);

    return [
      {
        label: cfg.stepConfirmed || 'Order Confirmed',
        status: currentStageIndex > 0 ? 'completed' : currentStageIndex === 0 ? 'active' : 'pending',
        icon: '✓',
        date: baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      },
      {
        label: cfg.stepShipped || 'Shipped',
        status: currentStageIndex > 1 ? 'completed' : currentStageIndex === 1 ? 'active' : 'pending',
        icon: '📦',
        date: currentStageIndex >= 1 ? (cfg.stepProcessed || 'Processed') : (cfg.stepExpectedSoon || 'Expected soon')
      },
      {
        label: cfg.stepOutForDelivery || 'Out for Delivery',
        status: currentStageIndex > 2 ? 'completed' : currentStageIndex === 2 ? 'active' : 'pending',
        icon: '🚚',
        date: currentStageIndex >= 2 ? (cfg.stepInTransit || 'In transit') : (cfg.stepExpectedSoon || 'Pending')
      },
      {
        label: cfg.stepDelivered || 'Delivered',
        status: currentStageIndex === 3 ? 'completed' : 'pending',
        icon: '🏠',
        date: currentStageIndex === 3 ? (cfg.stepDeliveredState || 'Delivered') : (cfg.stepExpectedDays || 'Expected in 2-3 days')
      }
    ];
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallbackImage = this.revamp()?.[ 'orders-content' ]?.[ 'placeholderImage' ] || 'https://via.placeholder.com/60?text=Product';
    if (img) {
      img.src = fallbackImage;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('mfe-auth-change', this.authListener);
    window.removeEventListener('mfe-order-created', this.orderListener);
    window.removeEventListener('storage', this.storageListener);
  }
}