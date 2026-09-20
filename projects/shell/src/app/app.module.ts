import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
// import { HomeComponent } from './home/home.component';
import { HomeComponent } from './home/home.component'
import { LoginComponent } from './login/login.component';

// import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ApiDemoComponent } from './api-demo/api-demo.component';
import { ApiInterceptor } from './interceptors/loader.interceptor';
// import { OrdersComponent } from './orders/orders.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ApiDemoComponent,
    // OrdersComponent
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    }
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}