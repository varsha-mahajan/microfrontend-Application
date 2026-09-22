export interface ScreenContentItem {
  key: string;
  device: string;
  [key: string]: any;
}

export interface ScreenContentGroup {
  screenIdentifier: string;
  screenContent: ScreenContentItem[];
}

export interface ShellMockConfig {
  screenCoverage: string;
  moduleIdentifier: string;
  lastModified: string;
  content: ScreenContentGroup[];
}

/* ==========================================================================
   1. ENGLISH DEFAULT FALLBACK
   ========================================================================== */
export const SHELL_FALLBACK: ShellMockConfig = {
  screenCoverage: 'single',
  moduleIdentifier: 'shell',
  lastModified: '2026-09-22T10:00:00',
  content: [
    {
      screenIdentifier: 'shell-app-content',
      screenContent: [
        /* ------------------- 1. SHELL NAVBAR ------------------- */
        {
          key: 'shell-navbar',
          device: 'both',
          brandLogo: '🛒 ShopEasy',
          linkHome: 'Home',
          linkProducts: 'Products',
          linkCart: '🛒 Cart',
          linkOrders: 'Orders',
          linkProfile: '👤 Profile',
          linkLogin: 'Login',
          buttonLogout: 'Logout'
        },

        /* ------------------- 2. CART LABELS & ACTIONS ------------------- */
        {
          key: 'cart',
          device: 'both',
          items: 'Items',
          currencySymbol: '₹',
          quantity: 'Quantity:',
          decreaseQty: 'Decrease Quantity',
          increaseQty: 'Increase Quantity',
          remove: 'Remove',
          clearCart: 'Clear Cart',
          continueShoppingLink: '← Continue Shopping'
        },

        /* ------------------- 3. ORDER SUMMARY ------------------- */
        {
          key: 'order-summary',
          device: 'both',
          title: 'Order Summary',
          subtotal: 'Subtotal',
          delivery: 'Delivery',
          free: 'FREE',
          total: 'Total Payable',
          checkout: 'Proceed to Checkout →',
          secureCheckout: '🔒 100% Safe and Secure Checkout Guaranteed',
          currencySymbol: '₹'
        },

        /* ------------------- 4. EMPTY CART STATE ------------------- */
        {
          key: 'empty-cart',
          device: 'both',
          icon: '🛒',
          title: 'Your Cart is Empty',
          description: "Looks like you haven't added anything to your cart yet.",
          continueShopping: 'Start Shopping Now'
        },

        /* ------------------- 5. CHECKOUT LOGIN MODAL ------------------- */
        {
          key: 'login-modal',
          device: 'both',
          title: 'Sign In to Proceed',
          emailLabel: 'Email Address',
          emailPlaceholder: 'name@company.com',
          passwordLabel: 'Password',
          passwordPlaceholder: '••••••••',
          rememberMe: 'Remember me',
          submitBtn: 'Sign In & Checkout',
          cancelBtn: 'Cancel'
        },

        /* ------------------- 6. ORDERS COMPONENT & TRACKING ------------------- */
        {
          key: 'orders-content',
          device: 'both',
          pageTitle: 'My Purchased Orders',
          emptyStateIcon: '📦',
          emptyStateTitle: 'No orders found',
          emptyStateSubtitle: "You haven't placed any orders yet.",
          authRequiredIcon: '🔒',
          authRequiredTitle: 'Please Sign In',
          authRequiredSubtitle: 'You need to be logged in to view your purchased orders and track deliveries.',
          authRequiredBtnText: 'Sign In Now',
          orderPrefix: 'Order #',
          statusCompleted: 'Completed',
          trackStatusText: 'Track Status →',
          qtyLabel: 'Qty:',
          paymentMethodLabel: 'Payment Method:',
          paymentMethodValue: 'Paid Online',
          modalPaymentLabel: 'Payment:',
          totalPaidLabel: 'Total Paid:',
          currencySymbol: '₹',
          placeholderImage: 'https://via.placeholder.com/60?text=Product',
          trackingModalTitle: 'Track Order #',
          trackingStatusLabel: 'Status:',
          deliveryAddressHeader: '📍 Delivery Address',
          trackingItemsHeader: 'Items in this order',
          trackingDoneBtn: 'Done',
          stepConfirmed: 'Order Confirmed',
          stepShipped: 'Shipped',
          stepOutForDelivery: 'Out for Delivery',
          stepDelivered: 'Delivered',
          stepExpectedSoon: 'Expected soon',
          stepInTransit: 'In transit',
          stepExpectedDays: 'Expected in 2-3 days',
          stepDeliveredState: 'Delivered',
          stepProcessed: 'Processed'
        },

        /* ------------------- 7. LOGIN COMPONENT ------------------- */
        {
          key: 'login-content',
          device: 'both',
          loggedInTitle: 'Welcome Back',
          loggedInSubtitle: 'You are currently logged in to your account.',
          logoutBtnText: 'Logout',
          welcomeTitle: 'Welcome Back',
          welcomeSubtitle: 'Please enter your details to sign in',
          signupTitle: 'Create Account',
          signupSubtitle: 'Please enter your details to sign up',
          googleButtonText: 'Continue with Google',
          noAccountText: "Don't have an account?",
          hasAccountText: 'Already have an account?',
          createAccountLink: 'Create account',
          signInLink: 'Sign in',
          emailLabel: 'Email address',
          emailPlaceholder: 'name@company.com',
          emailRequiredError: 'Email address is required.',
          emailPatternError: 'Please enter a valid email address (e.g. name@domain.com).',
          passwordLabel: 'Password',
          passwordPlaceholder: '••••••••',
          passwordRequiredError: 'Password is required.',
          passwordPatternError: 'Password must be at least 8 characters long, containing 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&).',
          confirmPasswordRequiredError: 'Confirming your password is required.',
          passwordsMismatchError: 'Passwords do not match.',
          togglePasswordAria: 'Toggle password visibility',
          rememberMeLabel: 'Remember me',
          forgotPasswordLink: 'Forgot password?',
          signInButtonText: 'Sign In',
          fullNameLabel: 'Full Name',
          fullNamePlaceholder: 'John Doe',
          fullNameRequiredError: 'Full name is required.',
          confirmPasswordLabel: 'Confirm Password',
          confirmPasswordPlaceholder: '••••••••',
          signUpButtonText: 'Create Account',
          orDividerText: 'OR'
        },

        /* ------------------- 8. CHECKOUT COMPONENT ------------------- */
        {
          key: 'checkout-content',
          device: 'both',
          pageTitle: 'Checkout',
          backToCart: '← Back to Cart',
          shippingSectionTitle: '1. Shipping Address',
          fullNameLabel: 'Full Name *',
          fullNamePlaceholder: 'John Doe',
          phoneLabel: 'Phone Number *',
          phonePlaceholder: '10-digit mobile',
          emailLabel: 'Email Address',
          emailPlaceholder: 'name@company.com',
          streetLabel: 'Street Address / Flat No. *',
          streetPlaceholder: 'House/Flat No., Street, Area',
          cityLabel: 'City *',
          cityPlaceholder: 'City',
          stateLabel: 'State *',
          statePlaceholder: 'State',
          pincodeLabel: 'Pincode *',
          pincodePlaceholder: '6-digit PIN',
          paymentSectionTitle: '2. Payment Method',
          onlinePaymentTitle: 'Pay Online',
          onlinePaymentSubtitle: 'UPI (Google Pay, PhonePe), Debit/Credit Card, Net Banking',
          codPaymentTitle: 'Cash on Delivery (COD)',
          codPaymentSubtitle: 'Pay with cash upon arrival',
          upiTabLabel: 'UPI',
          cardTabLabel: 'Card',
          netbankingTabLabel: 'Net Banking',
          upiIdLabel: 'UPI ID (VPA) *',
          upiIdPlaceholder: 'username@okhdfcbank',
          upiHelperText: 'A payment request will be sent to your UPI app.',
          cardNumberLabel: 'Card Number *',
          cardNumberPlaceholder: '16-digit card number',
          cardExpiryLabel: 'Valid Thru (MM/YY) *',
          cardExpiryPlaceholder: '08/28',
          cardCvvLabel: 'CVV *',
          cardCvvPlaceholder: '123',
          selectBankLabel: 'Select Bank *',
          payOnlineBtn: 'Pay Online & Complete Order',
          confirmCodBtn: 'Confirm Order with COD',
          orderSummaryTitle: 'Order Summary',
          qtyLabel: 'Qty:',
          subtotalLabel: 'Subtotal',
          deliveryLabel: 'Delivery',
          freeDeliveryText: 'FREE',
          totalPayableLabel: 'Total Payable',
          currencySymbol: '₹'
        },

        /* ------------------- 9. PROFILE COMPONENT ------------------- */
        {
          key: 'profile-content',
          device: 'both',
          memberSincePrefix: 'Member since',
          tabPersonalInfo: '👤 Personal Information',
          tabAddresses: '📍 Saved Addresses',
          tabSecurity: '🔒 Login & Security',
          tabLogout: '🚪 Logout',
          totalOrdersLabel: 'Total Orders',
          personalInfoTitle: 'Personal Information',
          personalInfoSubtitle: 'Manage your personal details and contact preferences',
          editProfileBtn: 'Edit Profile',
          cancelBtn: 'Cancel',
          fullNameLabel: 'Full Name',
          emailLabel: 'Email Address',
          emailNote: 'Email cannot be changed directly.',
          phoneLabel: 'Mobile Number',
          genderLabel: 'Gender',
          genderOptionMale: 'Male',
          genderOptionFemale: 'Female',
          genderOptionOther: 'Other',
          saveChangesBtn: 'Save Changes',
          addressesTitle: 'Saved Addresses',
          addressesSubtitle: 'Your primary shipping destination for faster checkout',
          defaultTag: 'DEFAULT',
          securityTitle: 'Login & Security',
          securitySubtitle: 'Ensure your account is protected with a secure password',
          currentPasswordLabel: 'Current Password',
          currentPasswordPlaceholder: '••••••••',
          newPasswordLabel: 'New Password',
          newPasswordPlaceholder: 'Min. 6 characters',
          confirmPasswordLabel: 'Confirm New Password',
          confirmPasswordPlaceholder: '••••••••',
          updatePasswordBtn: 'Update Password'
        },

        /* ------------------- 10. HOME HERO ------------------- */
        {
          key: 'home-hero',
          device: 'both',
          offerTag: '🔥 Special Offer',
          headingLine1: 'Shop Smart',
          headingLine2: 'Shop Everything',
          subheading: 'Discover the latest products at amazing prices. Find electronics, fashion, accessories and more.',
          shopBtnText: 'Shop Now →',
          exploreBtnText: 'Explore More →'
        },

        /* ------------------- 11. LIVE METRICS STRIP ------------------- */
        {
          key: 'home-metrics',
          device: 'both',
          list: [
            { icon: '⚡', value: '24 Hr', label: 'Express Delivery' },
            { icon: '📦', value: '15,000+', label: 'Orders Fulfilled' },
            { icon: '⭐', value: '4.9 / 5', label: 'Customer Rating' },
            { icon: '🛡️', value: '100%', label: 'Certified Authentic' }
          ]
        },

        /* ------------------- 12. HOME CATEGORIES ------------------- */
        {
          key: 'home-categories',
          device: 'both',
          title: 'Shop by Category',
          subtitle: 'Find what you are looking for',
          list: [
            { icon: '📱', name: 'Mobiles', count: '120+ Products' },
            { icon: '💻', name: 'Laptops', count: '80+ Products' },
            { icon: '🎧', name: 'Accessories', count: '200+ Products' }
          ]
        },

        /* ------------------- 13. DISCOVERY PROMOS ------------------- */
        {
          key: 'home-discovery-cards',
          device: 'both',
          list: [
            {
              badge: 'New Release',
              title: 'Next-Gen Audio',
              tagline: 'Spatial acoustics and active noise cancellation',
              icon: '🎧'
            },
            {
              badge: 'Special Deal',
              title: 'Pro Workstations',
              tagline: 'Powerful computing gear engineered for creators',
              icon: '💻'
            },
            {
              badge: 'Trending',
              title: 'Smart Wearables',
              tagline: 'Track everyday vitals, heart rate, and workouts',
              icon: '⌚'
            }
          ]
        },

        /* ------------------- 14. HOME FEATURES ------------------- */
        {
          key: 'home-features',
          device: 'both',
          list: [
            { icon: '🚚', title: 'Free Delivery', desc: 'Free delivery on orders above ₹499' },
            { icon: '🔒', title: 'Secure Payment', desc: '100% secure payment' },
            { icon: '↩️', title: 'Easy Returns', desc: '7 days easy return policy' },
            { icon: '💬', title: '24/7 Support', desc: 'We are here to help' }
          ]
        },

        /* ------------------- 15. HOME FEATURED PRODUCTS ------------------- */
        {
          key: 'home-featured-products',
          device: 'both',
          title: 'Featured Products',
          subtitle: 'Popular products you may like',
          viewAllBtnText: 'View All →',
          products: [
            {
              img: '💻',
              badge: 'Best Seller',
              title: 'HP Laptop',
              ratingStars: '★★★★★',
              ratingCount: "(120)",
              currentPrice: '₹55,999',
              originalPrice: '₹65,999'
            },
            {
              img: '⌚',
              badge: 'New',
              title: 'Smart Watch',
              ratingStars: '★★★★★',
              ratingCount: "(150)",
              currentPrice: '₹4,499',
              originalPrice: '₹6,999'
            }
          ]
        },

        /* ------------------- 16. TESTIMONIALS ------------------- */
        {
          key: 'home-testimonials',
          device: 'both',
          title: 'What Our Shoppers Say',
          subtitle: 'Real verified customer reviews and experiences',
          list: [
            {
              stars: '★★★★★',
              comment: 'The fastest delivery and authentic packaging. Everything arrived in pristine condition.',
              avatar: '👤',
              name: 'Aditi Verma',
              role: 'Verified Buyer'
            },
            {
              stars: '★★★★★',
              comment: 'Seamless order experience, transparent tracking, and genuine warranty included.',
              avatar: '👤',
              name: 'Rahul Deshmukh',
              role: 'Tech Enthusiast'
            },
            {
              stars: '★★★★★',
              comment: 'Found deals on studio gear that beat competitors by a long margin. Highly recommended.',
              avatar: '👤',
              name: 'Pooja Patel',
              role: 'Verified Buyer'
            }
          ]
        },

        /* ------------------- 17. HOME TRUST BADGES ------------------- */
        {
          key: 'home-trust-badges',
          device: 'both',
          list: [
            {
              icon: '🔒',
              title: 'Encrypted Payments',
              desc: '256-bit SSL multi-layered checkout security.'
            },
            {
              icon: '🔄',
              title: '7-Day Easy Returns',
              desc: 'No-questions-asked pickup and replacement.'
            },
            {
              icon: '🏷️',
              title: 'Best Price Match',
              desc: 'Certified competitive prices on brand originals.'
            },
            {
              icon: '💬',
              title: '24/7 Priority Support',
              desc: 'Direct access to technical assistance anytime.'
            }
          ]
        },

        /* ------------------- 18. HOME OFFER BANNER & NEWSLETTER ------------------- */
        {
          key: 'home-promos',
          device: 'both',
          bannerTag: 'LIMITED TIME OFFER',
          bannerTitle: 'Get up to 50% OFF',
          bannerDesc: 'On selected electronics and accessories.',
          bannerBtnText: 'Explore Deals →',
          newsletterTitle: 'Stay Updated',
          newsletterDesc: 'Subscribe to get updates about new products and special offers.',
          subscribeBtnText: 'Subscribe',
          emailPlaceholder: 'Enter your email'
        }
      ]
    }
  ]
};

/* ==========================================================================
   2. HINDI CONSTANT FALLBACK (For offline / failed fetch resilience)
   ========================================================================== */
export const SHELL_FALLBACK_HI: ShellMockConfig = {
  screenCoverage: 'single',
  moduleIdentifier: 'shell',
  lastModified: '2026-09-22T10:00:00',
  content: [
    {
      screenIdentifier: 'shell-app-content',
      screenContent: [
        /* ------------------- 1. SHELL NAVBAR ------------------- */
        {
          key: 'shell-navbar',
          device: 'both',
          brandLogo: '🛒 ShopEasy',
          linkHome: 'होम',
          linkProducts: 'उत्पाद',
          linkCart: '🛒 कार्ट',
          linkOrders: 'ऑर्डर्स',
          linkProfile: '👤 प्रोफ़ाइल',
          linkLogin: 'लॉग इन',
          buttonLogout: 'लॉग आउट'
        },

        /* ------------------- 2. CART LABELS & ACTIONS ------------------- */
        {
          key: 'cart',
          device: 'both',
          items: 'आइटम',
          currencySymbol: '₹',
          quantity: 'मात्रा:',
          decreaseQty: 'मात्रा घटाएं',
          increaseQty: 'मात्रा बढ़ाएं',
          remove: 'हटाएं',
          clearCart: 'कार्ट खाली करें',
          continueShoppingLink: '← खरीदारी जारी रखें'
        },

        /* ------------------- 3. ORDER SUMMARY ------------------- */
        {
          key: 'order-summary',
          device: 'both',
          title: 'ऑर्डर सारांश',
          subtotal: 'उप-योग',
          delivery: 'डिलीवरी',
          free: 'मुफ़्त',
          total: 'कुल देय राशि',
          checkout: 'चेकआउट के लिए आगे बढ़ें →',
          secureCheckout: '🔒 100% सुरक्षित और संरक्षित चेकआउट की गारंटी',
          currencySymbol: '₹'
        },

        /* ------------------- 4. EMPTY CART STATE ------------------- */
        {
          key: 'empty-cart',
          device: 'both',
          icon: '🛒',
          title: 'आपकी कार्ट खाली है',
          description: 'लगता है कि आपने अभी तक अपनी कार्ट में कुछ भी नहीं जोड़ा है।',
          continueShopping: 'अभी खरीदारी शुरू करें'
        },

        /* ------------------- 5. CHECKOUT LOGIN MODAL ------------------- */
        {
          key: 'login-modal',
          device: 'both',
          title: 'आगे बढ़ने के लिए साइन इन करें',
          emailLabel: 'ईमेल पता',
          emailPlaceholder: 'name@company.com',
          passwordLabel: 'पासवर्ड',
          passwordPlaceholder: '••••••••',
          rememberMe: 'मुझे याद रखें',
          submitBtn: 'साइन इन करें और चेकआउट करें',
          cancelBtn: 'रद्द करें'
        },

        /* ------------------- 6. ORDERS COMPONENT & TRACKING ------------------- */
        {
          key: 'orders-content',
          device: 'both',
          pageTitle: 'मेरे खरीदे गए ऑर्डर्स',
          emptyStateIcon: '📦',
          emptyStateTitle: 'कोई ऑर्डर नहीं मिला',
          emptyStateSubtitle: 'आपने अभी तक कोई ऑर्डर नहीं दिया है।',
          authRequiredIcon: '🔒',
          authRequiredTitle: 'कृपया साइन इन करें',
          authRequiredSubtitle: 'अपने खरीदे गए ऑर्डर्स और डिलीवरी ट्रैक करने के लिए आपको लॉग इन होना आवश्यक है।',
          authRequiredBtnText: 'अभी साइन इन करें',
          orderPrefix: 'ऑर्डर #',
          statusCompleted: 'पूर्ण हुआ',
          trackStatusText: 'स्थिति ट्रैक करें →',
          qtyLabel: 'मात्रा:',
          paymentMethodLabel: 'भुगतान विधि:',
          paymentMethodValue: 'ऑनलाइन भुगतान किया गया',
          modalPaymentLabel: 'भुगतान:',
          totalPaidLabel: 'कुल भुगतान:',
          currencySymbol: '₹',
          placeholderImage: 'https://via.placeholder.com/60?text=Product',
          trackingModalTitle: 'ऑर्डर ट्रैक करें #',
          trackingStatusLabel: 'स्थिति:',
          deliveryAddressHeader: '📍 डिलीवरी का पता',
          trackingItemsHeader: 'इस ऑर्डर के आइटम',
          trackingDoneBtn: 'संपन्न',
          stepConfirmed: 'ऑर्डर की पुष्टि हुई',
          stepShipped: 'भेज दिया गया (Shipped)',
          stepOutForDelivery: 'डिलीवरी के लिए निकल चुका है',
          stepDelivered: 'डिलीवर किया गया',
          stepExpectedSoon: 'जल्द अपेक्षित है',
          stepInTransit: 'रास्ते में है',
          stepExpectedDays: '2-3 दिनों में अपेक्षित',
          stepDeliveredState: 'डिलीवर हो गया',
          stepProcessed: 'प्रोसेस्ड'
        },

        /* ------------------- 7. LOGIN COMPONENT ------------------- */
        {
          key: 'login-content',
          device: 'both',
          loggedInTitle: 'वापसी पर स्वागत है',
          loggedInSubtitle: 'आप वर्तमान में अपने खाते में लॉग इन हैं।',
          logoutBtnText: 'लॉग आउट',
          welcomeTitle: 'वापसी पर स्वागत है',
          welcomeSubtitle: 'कृपया साइन इन करने के लिए अपना विवरण दर्ज करें',
          signupTitle: 'खाता बनाएं',
          signupSubtitle: 'कृपया साइन अप करने के लिए अपना विवरण दर्ज करें',
          googleButtonText: 'Google के साथ जारी रखें',
          noAccountText: 'खाता नहीं है?',
          hasAccountText: 'पहले से ही एक खाता है?',
          createAccountLink: 'खाता बनाएं',
          signInLink: 'साइन इन करें',
          emailLabel: 'ईमेल पता',
          emailPlaceholder: 'name@company.com',
          emailRequiredError: 'ईमेल पता आवश्यक है।',
          emailPatternError: 'कृपया एक मान्य ईमेल पता दर्ज करें (उदा. name@domain.com)।',
          passwordLabel: 'पासवर्ड',
          passwordPlaceholder: '••••••••',
          passwordRequiredError: 'पासवर्ड आवश्यक है।',
          passwordPatternError: 'पासवर्ड कम से कम 8 अक्षर लंबा होना चाहिए, जिसमें 1 बड़ा अक्षर, 1 छोटा अक्षर, 1 संख्या और 1 विशेष वर्ण शामिल हो।',
          confirmPasswordRequiredError: 'पासवर्ड की पुष्टि करना आवश्यक है।',
          passwordsMismatchError: 'पासवर्ड मेल नहीं खाते।',
          togglePasswordAria: 'पासवर्ड दृश्यता टॉगल करें',
          rememberMeLabel: 'मुझे याद रखें',
          forgotPasswordLink: 'पासवर्ड भूल गए?',
          signInButtonText: 'साइन इन करें',
          fullNameLabel: 'पूरा नाम',
          fullNamePlaceholder: 'John Doe',
          fullNameRequiredError: 'पूरा नाम आवश्यक है।',
          confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
          confirmPasswordPlaceholder: '••••••••',
          signUpButtonText: 'खाता बनाएं',
          orDividerText: 'या'
        },

        /* ------------------- 8. CHECKOUT COMPONENT ------------------- */
        {
          key: 'checkout-content',
          device: 'both',
          pageTitle: 'चेकआउट',
          backToCart: '← कार्ट पर वापस जाएं',
          shippingSectionTitle: '1. शिपिंग पता',
          fullNameLabel: 'पूरा नाम *',
          fullNamePlaceholder: 'John Doe',
          phoneLabel: 'फ़ोन नंबर *',
          phonePlaceholder: '10 अंकों का मोबाइल नंबर',
          emailLabel: 'ईमेल पता',
          emailPlaceholder: 'name@company.com',
          streetLabel: 'सड़क का पता / फ्लैट नं. *',
          streetPlaceholder: 'मकान/फ्लैट नं., सड़क, क्षेत्र',
          cityLabel: 'शहर *',
          cityPlaceholder: 'शहर',
          stateLabel: 'राज्य *',
          statePlaceholder: 'राज्य',
          pincodeLabel: 'पिनकोड *',
          pincodePlaceholder: '6 अंकों का पिन',
          paymentSectionTitle: '2. भुगतान का तरीका',
          onlinePaymentTitle: 'ऑनलाइन भुगतान करें',
          onlinePaymentSubtitle: 'UPI (Google Pay, PhonePe), डेबिट/क्रेडिट कार्ड, नेट बैंकिंग',
          codPaymentTitle: 'कैश ऑन डिलीवरी (COD)',
          codPaymentSubtitle: 'सामान मिलने पर नकद भुगतान करें',
          upiTabLabel: 'UPI',
          cardTabLabel: 'कार्ड',
          netbankingTabLabel: 'नेट बैंकिंग',
          upiIdLabel: 'UPI ID (VPA) *',
          upiIdPlaceholder: 'username@okhdfcbank',
          upiHelperText: 'आपके UPI ऐप पर भुगतान अनुरोध भेजा जाएगा।',
          cardNumberLabel: 'कार्ड नंबर *',
          cardNumberPlaceholder: '16 अंकों का कार्ड नंबर',
          cardExpiryLabel: 'समाप्ति तिथि (MM/YY) *',
          cardExpiryPlaceholder: '08/28',
          cardCvvLabel: 'CVV *',
          cardCvvPlaceholder: '123',
          selectBankLabel: 'बैंक चुनें *',
          payOnlineBtn: 'ऑनलाइन भुगतान करें और ऑर्डर पूरा करें',
          confirmCodBtn: 'COD के साथ ऑर्डर की पुष्टि करें',
          orderSummaryTitle: 'ऑर्डर सारांश',
          qtyLabel: 'मात्रा:',
          subtotalLabel: 'उप-योग',
          deliveryLabel: 'डिलीवरी',
          freeDeliveryText: 'मुफ़्त',
          totalPayableLabel: 'कुल देय राशि',
          currencySymbol: '₹'
        },

        /* ------------------- 9. PROFILE COMPONENT ------------------- */
        {
          key: 'profile-content',
          device: 'both',
          memberSincePrefix: 'सदस्यता तिथि',
          tabPersonalInfo: '👤 व्यक्तिगत जानकारी',
          tabAddresses: '📍 सहेजे गए पते',
          tabSecurity: '🔒 लॉगिन और सुरक्षा',
          tabLogout: '🚪 लॉग आउट',
          totalOrdersLabel: 'कुल ऑर्डर्स',
          personalInfoTitle: 'व्यक्तिगत जानकारी',
          personalInfoSubtitle: 'अपने व्यक्तिगत विवरण और संपर्क प्राथमिकताओं को प्रबंधित करें',
          editProfileBtn: 'प्रोफ़ाइल संपादित करें',
          cancelBtn: 'रद्द करें',
          fullNameLabel: 'पूरा नाम',
          emailLabel: 'ईमेल पता',
          emailNote: 'ईमेल सीधे नहीं बदला जा सकता।',
          phoneLabel: 'मोबाइल नंबर',
          genderLabel: 'लिंग',
          genderOptionMale: 'पुरुष',
          genderOptionFemale: 'महिला',
          genderOptionOther: 'अन्य',
          saveChangesBtn: 'बदलाव सहेजें',
          addressesTitle: 'सहेजे गए पते',
          addressesSubtitle: 'तेज़ चेकआउट के लिए आपका प्राथमिक शिपिंग गंतव्य',
          defaultTag: 'डिफ़ॉल्ट',
          securityTitle: 'लॉगिन और सुरक्षा',
          securitySubtitle: 'सुनिश्चित करें कि आपका खाता एक सुरक्षित पासवर्ड से सुरक्षित है',
          currentPasswordLabel: 'वर्तमान पासवर्ड',
          currentPasswordPlaceholder: '••••••••',
          newPasswordLabel: 'नया पासवर्ड',
          newPasswordPlaceholder: 'न्यूनतम 6 अक्षर',
          confirmPasswordLabel: 'नए पासवर्ड की पुष्टि करें',
          confirmPasswordPlaceholder: '••••••••',
          updatePasswordBtn: 'पासवर्ड अपडेट करें'
        },

        /* ------------------- 10. HOME HERO ------------------- */
        {
          key: 'home-hero',
          device: 'both',
          offerTag: '🔥 विशेष ऑफर',
          headingLine1: 'स्मार्ट खरीदारी करें',
          headingLine2: 'सब कुछ खरीदें',
          subheading: 'शानदार कीमतों पर नवीनतम उत्पादों की खोज करें। इलेक्ट्रॉनिक्स, फैशन, एक्सेसरीज़ और बहुत कुछ पाएं।',
          shopBtnText: 'अभी खरीदें →',
          exploreBtnText: 'और देखें →'
        },

        /* ------------------- 11. LIVE METRICS STRIP ------------------- */
        {
          key: 'home-metrics',
          device: 'both',
          list: [
            { icon: '⚡', value: '24 घंटे', label: 'एक्सप्रेस डिलीवरी' },
            { icon: '📦', value: '15,000+', label: 'ऑर्डर पूरे किए' },
            { icon: '⭐', value: '4.9 / 5', label: 'ग्राहक रेटिंग' },
            { icon: '🛡️', value: '100%', label: 'प्रमाणित प्रामाणिक' }
          ]
        },

        /* ------------------- 12. HOME CATEGORIES ------------------- */
        {
          key: 'home-categories',
          device: 'both',
          title: 'श्रेणी के अनुसार खरीदारी करें',
          subtitle: 'वह खोजें जो आप ढूंढ रहे हैं',
          list: [
            { icon: '📱', name: 'मोबाइल', count: '120+ उत्पाद' },
            { icon: '💻', name: 'लैपटॉप', count: '80+ उत्पाद' },
            { icon: '🎧', name: 'एक्सेसरीज़', count: '200+ उत्पाद' }
          ]
        },

        /* ------------------- 13. DISCOVERY PROMOS ------------------- */
        {
          key: 'home-discovery-cards',
          device: 'both',
          list: [
            {
              badge: 'नया संस्करण',
              title: 'नेक्स्ट-जेन ऑडियो',
              tagline: 'स्थानिक ध्वनिकी और सक्रिय शोर रद्दीकरण',
              icon: '🎧'
            },
            {
              badge: 'विशेष सौदा',
              title: 'प्रो वर्कस्टेशन',
              tagline: 'रचनाकारों के लिए तैयार किए गए शक्तिशाली कंप्यूटिंग उपकरण',
              icon: '💻'
            },
            {
              badge: 'रुझान में',
              title: 'स्मार्ट वियरेबल्स',
              tagline: 'दैनिक स्वास्थ्य संकेत, हृदय गति और वर्कआउट ट्रैक करें',
              icon: '⌚'
            }
          ]
        },

        /* ------------------- 14. HOME FEATURES ------------------- */
        {
          key: 'home-features',
          device: 'both',
          list: [
            { icon: '🚚', title: 'मुफ़्त डिलीवरी', desc: '₹499 से अधिक के ऑर्डर पर मुफ़्त डिलीवरी' },
            { icon: '🔒', title: 'सुरक्षित भुगतान', desc: '100% सुरक्षित भुगतान' },
            { icon: '↩️', title: 'आसान रिटर्न', desc: '7 दिनों की आसान रिटर्न नीति' },
            { icon: '💬', title: '24/7 सहायता', desc: 'हम आपकी मदद के लिए हमेशा तैयार हैं' }
          ]
        },

        /* ------------------- 15. HOME FEATURED PRODUCTS ------------------- */
        {
          key: 'home-featured-products',
          device: 'both',
          title: 'विशेष उत्पाद',
          subtitle: 'लोकप्रिय उत्पाद जो आपको पसंद आ सकते हैं',
          viewAllBtnText: 'सभी देखें →',
          products: [
            {
              img: '💻',
              badge: 'बेस्ट सेलर',
              title: 'HP लैपटॉप',
              ratingStars: '★★★★★',
              ratingCount: "(120)",
              currentPrice: '₹55,999',
              originalPrice: '₹65,999'
            },
            {
              img: '⌚',
              badge: 'नया',
              title: 'स्मार्ट वॉच',
              ratingStars: '★★★★★',
              ratingCount: "(150)",
              currentPrice: '₹4,499',
              originalPrice: '₹6,999'
            }
          ]
        },

        /* ------------------- 16. TESTIMONIALS ------------------- */
        {
          key: 'home-testimonials',
          device: 'both',
          title: 'हमारे खरीदार क्या कहते हैं',
          subtitle: 'वास्तविक सत्यापित ग्राहक समीक्षाएं और अनुभव',
          list: [
            {
              stars: '★★★★★',
              comment: 'सबसे तेज़ डिलीवरी और प्रामाणिक पैकेजिंग। सब कुछ प्राचीन स्थिति में आया।',
              avatar: '👤',
              name: 'अदिति वर्मा',
              role: 'सत्यापित खरीदार'
            },
            {
              stars: '★★★★★',
              comment: 'सहज ऑर्डर अनुभव, पारदर्शी ट्रैकिंग, और वास्तविक वारंटी शामिल है।',
              avatar: '👤',
              name: 'राहुल देशमुख',
              role: 'टेक उत्साही'
            },
            {
              stars: '★★★★★',
              comment: 'स्टूडियो गियर पर ऐसे सौदे मिले जो प्रतिस्पर्धियों से काफी बेहतर थे। अत्यधिक अनुशंसित।',
              avatar: '👤',
              name: 'पूजा पटेल',
              role: 'सत्यापित खरीदार'
            }
          ]
        },

        /* ------------------- 17. HOME TRUST BADGES ------------------- */
        {
          key: 'home-trust-badges',
          device: 'both',
          list: [
            {
              icon: '🔒',
              title: 'एन्क्रिप्टेड भुगतान',
              desc: '256-बिट SSL बहुस्तरीय चेकआउट सुरक्षा।'
            },
            {
              icon: '🔄',
              title: '7-दिन आसान रिटर्न',
              desc: 'बिना किसी सवाल के पिकअप और रिप्लेसमेंट।'
            },
            {
              icon: '🏷️',
              title: 'सर्वोत्तम मूल्य गारंटी',
              desc: 'ब्रांड ओरिजिनल्स पर प्रमाणित प्रतिस्पर्धी कीमतें।'
            },
            {
              icon: '💬',
              title: '24/7 प्राथमिकता सहायता',
              desc: 'किसी भी समय तकनीकी सहायता के लिए सीधा संपर्क।'
            }
          ]
        },

        /* ------------------- 18. HOME OFFER BANNER & NEWSLETTER ------------------- */
        {
          key: 'home-promos',
          device: 'both',
          bannerTag: 'सीमित समय का ऑफर',
          bannerTitle: '50% तक की छूट पाएं',
          bannerDesc: 'चुनिंदा इलेक्ट्रॉनिक्स और एक्सेसरीज़ पर।',
          bannerBtnText: 'ऑफर्स देखें →',
          newsletterTitle: 'अपडेट रहें',
          newsletterDesc: 'नए उत्पादों और विशेष ऑफ़र के बारे में अपडेट पाने के लिए सदस्यता लें।',
          subscribeBtnText: 'सदस्यता लें',
          emailPlaceholder: 'अपना ईमेल दर्ज करें'
        }
      ]
    }
  ]
};