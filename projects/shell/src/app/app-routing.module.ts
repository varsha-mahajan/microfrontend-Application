import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ApiDemoComponent } from './api-demo/api-demo.component';

const routes: Routes = [
    {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'api-demo',
    component: ApiDemoComponent
  },
  {
  path: 'login',
  component: LoginComponent
  },
 {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'products',
    loadComponent: () =>
      import('products/Component').then(m => m.AppComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('cart/Component').then(m => m.AppComponent)
  },
   
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout/checkout.component').then(m => m.CheckoutComponent)
  },
// Add the profile route right alongside your cart and orders routes
{
  path: 'profile',
  loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
},
  
  // ... your other routes
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}