import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SHELL_FALLBACK, ShellMockConfig } from '../constant/shells-fallback.constant';

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  memberSince: string;
}

export interface SavedAddress {
  type: 'Home' | 'Work';
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  activeTab: 'details' | 'addresses' | 'security' = 'details';
  isEditing: boolean = false;
  successMessage: string = '';
  orderCount: number = 0;

  user: UserProfile = {
    fullName: 'John Doe',
    email: '',
    phone: '+91 9876543210',
    gender: 'Male',
    memberSince: 'September 2026'
  };

  savedAddresses: SavedAddress[] = [];

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';

  profileDataUi = signal<Record<string, any>>(this.extractScreenMap(SHELL_FALLBACK));

  constructor(public router: Router) {}

  async ngOnInit(): Promise<void> {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserData();
    this.loadAddressData();
    await this.loadProfileContent();
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

  private async loadProfileContent(): Promise<void> {
    const fallbackMap = this.extractScreenMap(SHELL_FALLBACK);

    try {
      const response = await fetch('assets/data/shell-mock.json');
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const config: ShellMockConfig = await response.json();

      if (config && Array.isArray(config.content) && config.content.length > 0) {
        const dynamicMap = this.extractScreenMap(config);
        const mergedData = this.deepMerge(fallbackMap, dynamicMap);
        this.profileDataUi.set(mergedData);
      } else {
        throw new Error('Invalid or empty JSON structure');
      }
    } catch (error) {
      console.warn('Unable to load shell-mock.json, keeping SHELL_FALLBACK:', error);
      this.profileDataUi.set(fallbackMap);
    }
  }

  revamp(): Record<string, any> {
    return this.profileDataUi();
  }

  private loadUserData(): void {
    const storedEmail = (localStorage.getItem('userEmail') || 'test@gmail.com').trim().toLowerCase();
    this.user.email = storedEmail;

    const storedUserRaw = localStorage.getItem('registeredUser');
    if (storedUserRaw) {
      try {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed.name) this.user.fullName = parsed.name;
        if (parsed.email) this.user.email = parsed.email;
        if (parsed.phone) this.user.phone = parsed.phone;
        if (parsed.gender) this.user.gender = parsed.gender;
        if (parsed.memberSince) this.user.memberSince = parsed.memberSince;
      } catch (e) {
        console.error('Error reading registeredUser', e);
      }
    }
  }

  private loadAddressData(): void {
    const currentEmail = (localStorage.getItem('userEmail') || '').trim().toLowerCase();

    // 1. Read from isolated user-scoped orders bucket
    let userOrders: any[] = [];
    if (currentEmail) {
      const scopedRaw = localStorage.getItem(`orders_${currentEmail}`);
      if (scopedRaw) {
        try {
          userOrders = JSON.parse(scopedRaw);
        } catch {
          userOrders = [];
        }
      }
    }

    // 2. Fallback to legacy orders filtered by email
    if (userOrders.length === 0 && currentEmail) {
      try {
        const legacyOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        userOrders = legacyOrders.filter(
          (o: any) => o.shippingAddress?.email?.toLowerCase() === currentEmail
        );
      } catch {
        userOrders = [];
      }
    }

    this.orderCount = userOrders.length;

    // 3. Extract default shipping address from latest placed order
    if (userOrders.length > 0 && userOrders[0].shippingAddress) {
      const addr = userOrders[0].shippingAddress;
      this.savedAddresses = [
        {
          type: 'Home',
          street: addr.street || 'Flat 402, Green Valley Apartments',
          city: addr.city || 'Pune',
          state: addr.state || 'Maharashtra',
          pincode: addr.pincode || '411001',
          isDefault: true
        }
      ];
    } else {
      this.savedAddresses = [
        {
          type: 'Home',
          street: 'Flat 402, Green Valley Apartments, FC Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          isDefault: true
        }
      ];
    }
  }

  saveProfile(): void {
    this.isEditing = false;
    this.successMessage = 'Profile updated successfully!';

    const storedUserRaw = localStorage.getItem('registeredUser');
    const existing = storedUserRaw ? JSON.parse(storedUserRaw) : {};
    existing.name = this.user.fullName;
    existing.phone = this.user.phone;
    existing.gender = this.user.gender;
    localStorage.setItem('registeredUser', JSON.stringify(existing));

    // Broadcast update across MFEs (e.g., updates user display name in Shell navbar)
    window.dispatchEvent(
      new CustomEvent('mfe-auth-change', {
        detail: {
          isLoggedIn: true,
          email: this.user.email,
          name: this.user.fullName
        }
      })
    );

    setTimeout(() => (this.successMessage = ''), 3000);
  }

  updatePassword(): void {
    this.passwordError = '';

    if (!this.currentPassword || !this.newPassword) {
      this.passwordError = 'Please fill in all password fields.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters.';
      return;
    }

    const storedUserRaw = localStorage.getItem('registeredUser');
    if (storedUserRaw) {
      try {
        const user = JSON.parse(storedUserRaw);
        user.password = this.newPassword;
        localStorage.setItem('registeredUser', JSON.stringify(user));
      } catch (e) {
        console.error('Failed to update password in storage', e);
      }
    }

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.successMessage = 'Password updated successfully!';
    setTimeout(() => (this.successMessage = ''), 3000);
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.dispatchEvent(new CustomEvent('mfe-auth-change', { detail: { isLoggedIn: false } }));
    this.router.navigate(['/login']);
  }
}