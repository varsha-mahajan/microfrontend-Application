



import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  login(): void {
    localStorage.setItem('isLoggedIn', 'true');
    this.isLoggedInSubject.next(true);
    // Broadcast auth change to remote micro-frontends
    window.dispatchEvent(new CustomEvent('mfe-auth-change', { detail: { isLoggedIn: true } }));
  }

  logout(): void {
    localStorage.setItem('isLoggedIn', 'false');
    this.isLoggedInSubject.next(false);
    window.dispatchEvent(new CustomEvent('mfe-auth-change', { detail: { isLoggedIn: false } }));
  }

  get isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }
}











// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   constructor() { }
//    login(): void {
//     localStorage.setItem('isLoggedIn', 'true');
//   }
 
//   logout(): void {
//     localStorage.removeItem('isLoggedIn');
//   }
 
//   isLoggedIn(): boolean {
//     return localStorage.getItem('isLoggedIn') === 'true';
//   }
// }