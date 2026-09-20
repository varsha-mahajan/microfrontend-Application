import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ContentService } from '../services/content.service';
import { ShellMockConfig, SHELL_FALLBACK } from '../constant/shells-fallback.constant';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Regex Constants
  readonly emailRegex = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
  readonly passwordRegex = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!\%*?&]{8,}$';

  // State Signals
  isLoggedIn = signal<boolean>(false);
  isSignUpMode = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  successMessage = signal<string>('');

  // Login Form Signals
  email = signal<string>('');
  password = signal<string>('');
  rememberMe = signal<boolean>(false);

  // Signup Form Signals
  signupName = signal<string>('');
  signupEmail = signal<string>('');
  signupPassword = signal<string>('');
  signupConfirmPassword = signal<string>('');

  // Revamp AEM / Fallback Data Signal
  loginData = signal<Record<string, any>>(this.extractScreenMap(SHELL_FALLBACK));

  // Computed Validations
  isEmailValid = computed(() => new RegExp(this.emailRegex).test(this.email().trim()));
  isSignupEmailValid = computed(() => new RegExp(this.emailRegex).test(this.signupEmail().trim()));
  isSignupPasswordValid = computed(() => new RegExp(this.passwordRegex).test(this.signupPassword()));
  doPasswordsMatch = computed(() => {
    const pass = this.signupPassword();
    return pass.length > 0 && pass === this.signupConfirmPassword();
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    public contentService: ContentService
  ) {}

  async ngOnInit(): Promise<void> {
    this.checkInitialAuthState();
    await this.loadLoginContent();

    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      this.email.set(savedEmail);
      this.rememberMe.set(true);
    }
  }

  private checkInitialAuthState(): void {
    const storedStatus = localStorage.getItem('isLoggedIn');
    this.isLoggedIn.set(storedStatus === 'true');
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

    // If source is missing or empty, maintain target fallback values
    if (!source || typeof source !== 'object') {
      return output;
    }

    // Merge source values over target
    Object.keys(source).forEach((key) => {
      const sourceVal = source[key];
      const targetVal = target ? target[key] : undefined;

      // Detect empty or whitespace string in JSON
      const isEmptySourceString = typeof sourceVal === 'string' && sourceVal.trim() === '';

      if (
        typeof sourceVal === 'object' &&
        sourceVal !== null &&
        !Array.isArray(sourceVal) &&
        typeof targetVal === 'object' &&
        targetVal !== null &&
        !Array.isArray(targetVal)
      ) {
        // Recursive merge for nested objects
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
        if (output[key] === undefined || output[key] === null || (typeof output[key] === 'string' && output[key].trim() === '')) {
          output[key] = target[key];
        }
      });
    }

    return output;
  }

  private async loadLoginContent(): Promise<void> {
    const fallbackMap = this.extractScreenMap(SHELL_FALLBACK);

    try {
      const response = await fetch('assets/data/shell-mock.json');
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const config: ShellMockConfig = await response.json();

      if (config && Array.isArray(config.content) && config.content.length > 0) {
        const dynamicMap = this.extractScreenMap(config);
        this.loginData.set(this.deepMerge(fallbackMap, dynamicMap));
      } else {
        throw new Error('Empty or invalid JSON payload');
      }
    } catch (error) {
      console.warn('Falling back to SHELL_FALLBACK data:', error);
      this.loginData.set(fallbackMap);
    }
  }

  revamp(): Record<string, any> {
    return this.loginData();
  }

  revampFallback(): Record<string, any> {
    return this.revamp();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  toggleSignUpMode(isSignUp: boolean): void {
    this.isSignUpMode.set(isSignUp);
    this.successMessage.set('');
    this.resetForms();
  }

  createAccount(): void {
    this.toggleSignUpMode(true);
  }

  login(): void {
    this.isSubmitted.set(true);

    if (!this.email() || !this.isEmailValid() || !this.password()) {
      return;
    }

    const cleanEmail = this.email().trim().toLowerCase();
    const currentPassword = this.password();

    // 1. Hardcoded Mock Account
    if (cleanEmail === 'test@gmail.com' && currentPassword === '123456') {
      this.executeSuccessfulLogin(cleanEmail);
      return;
    }

    // 2. Multi-User Accounts
    const users: any[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const matchedUser = users.find(
      (u) => u.email?.toLowerCase() === cleanEmail && u.password === currentPassword
    );

    if (matchedUser) {
      localStorage.setItem('registeredUser', JSON.stringify(matchedUser));
      this.executeSuccessfulLogin(cleanEmail);
      return;
    }

    // 3. Single User Fallback
    const storedUserRaw = localStorage.getItem('registeredUser');
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        if (storedUser.email?.toLowerCase() === cleanEmail && storedUser.password === currentPassword) {
          this.executeSuccessfulLogin(cleanEmail);
          return;
        }
      } catch (e) {
        console.error('Error reading user payload:', e);
      }
    }

    alert('Invalid email or password');
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('cart');
    localStorage.removeItem('orders');

    window.dispatchEvent(
      new CustomEvent('mfe-auth-change', {
        detail: { isLoggedIn: false }
      })
    );
    window.dispatchEvent(
      new CustomEvent('mfe-cart-updated', {
        detail: []
      })
    );

    this.resetForms();
  }

  registerUser(): void {
    this.isSubmitted.set(true);

    if (
      !this.signupName().trim() ||
      !this.isSignupEmailValid() ||
      !this.isSignupPasswordValid() ||
      !this.doPasswordsMatch()
    ) {
      return;
    }

    const cleanEmail = this.signupEmail().trim().toLowerCase();

    const users: any[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (users.some((u) => u.email?.toLowerCase() === cleanEmail)) {
      alert('An account with this email already exists. Please sign in.');
      return;
    }

    const newUser = {
      name: this.signupName().trim(),
      email: cleanEmail,
      password: this.signupPassword(),
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    localStorage.setItem('registeredUser', JSON.stringify(newUser));

    localStorage.setItem(`cart_${cleanEmail}`, JSON.stringify([]));
    localStorage.setItem(`orders_${cleanEmail}`, JSON.stringify([]));

    // Reset into Sign In state with user's email prefilled
    this.email.set(cleanEmail);
    this.password.set('');
    this.signupName.set('');
    this.signupEmail.set('');
    this.signupPassword.set('');
    this.signupConfirmPassword.set('');
    this.isSubmitted.set(false);
    this.showPassword.set(false);

    this.isSignUpMode.set(false);
    this.successMessage.set('Account created successfully! Please sign in with your password.');
  }

  forgotPassword(): void {
    const forgotEmail = prompt('Enter your registered email address:');
    if (!forgotEmail) return;

    if (!new RegExp(this.emailRegex).test(forgotEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    alert(`Password reset link has been sent to ${forgotEmail}`);
  }

  loginWithGoogle(): void {
    alert('Google login functionality will be added soon.');
  }

  private executeSuccessfulLogin(userEmail: string): void {
    this.authService.login();
    this.isLoggedIn.set(true);

    const cleanEmail = userEmail.trim().toLowerCase();

    localStorage.setItem('userEmail', cleanEmail);
    localStorage.setItem('isLoggedIn', 'true');

    const userScopedCart = localStorage.getItem(`cart_${cleanEmail}`) || '[]';
    localStorage.setItem('cart', userScopedCart);

    const userScopedOrders = localStorage.getItem(`orders_${cleanEmail}`) || '[]';
    localStorage.setItem('orders', userScopedOrders);

    window.dispatchEvent(
      new CustomEvent('mfe-auth-change', {
        detail: { isLoggedIn: true, email: cleanEmail }
      })
    );
    window.dispatchEvent(
      new CustomEvent('mfe-cart-updated', {
        detail: JSON.parse(userScopedCart)
      })
    );

    this.router.navigate(['/home']);
  }

  private resetForms(): void {
    this.email.set('');
    this.password.set('');
    this.signupName.set('');
    this.signupEmail.set('');
    this.signupPassword.set('');
    this.signupConfirmPassword.set('');
    this.showPassword.set(false);
    this.isSubmitted.set(false);
  }
}