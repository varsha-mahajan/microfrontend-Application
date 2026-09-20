// import { Injectable } from '@angular/core';
// import {
//   HttpErrorResponse,
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';

// @Injectable()
// export class ErrorInterceptor implements HttpInterceptor {

//   intercept(
//     request: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {

//     console.log('Interceptor called:', request.url);

//     return next.handle(request).pipe(
//       catchError((error: HttpErrorResponse) => {

//         console.log('HTTP Error:', error);

        
//         if (error.status === 404) {
//           console.error('404: API not found');
//         }

//         if (error.status === 401) {
//           console.error('401: Unauthorized');
//         }

//         if (error.status === 403) {
//           console.error('403: Access denied');
//         }

//         if (error.status >= 500) {
//           console.error('Server error');
//         }

//         if (error.status === 0) {
//           console.error('Network error or server unavailable');
//         }

//         return throwError(() => error);
//       })
//     );
//   }
// }