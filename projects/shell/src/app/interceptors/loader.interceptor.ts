import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoaderService } from '../services/loader.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(
    private loaderService: LoaderService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    // Show loader before API call
    this.loaderService.show();

    return next.handle(request).pipe(

      // Hide loader after API success/error
      finalize(() => {
        this.loaderService.hide();
      })

    );
  }
}