import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PRODUCTS_FALLBACK } from '../constant/products-fallback.constant';

@Injectable({
  providedIn: 'root'
})
export class RevampService {
  // Ensure 'aem-labels.json' is located in 'projects/products/src/assets/aem-labels.json'
  private readonly REVAMP_URL = 'assets/data/aem-labels.json';

  constructor(private http: HttpClient) {}

  getRevamp(): Observable<any> {
    return this.http.get<any>(this.REVAMP_URL).pipe(
      map(response => {
        // 1st Priority: Extract screenContent array from JSON
        const screenContent = response?.content?.[0]?.screenContent;

        if (!Array.isArray(screenContent) || screenContent.length === 0) {
          throw new Error('AEM JSON screenContent is empty or invalid.');
        }

        // Convert JSON array into a key-value dictionary using item.key
        const jsonMap = screenContent.reduce((acc: any, item: any) => {
          if (item?.key) {
            acc[item.key] = item;
          }
          return acc;
        }, {});

        // Merge JSON over Fallback: JSON keys take complete priority
        return { ...PRODUCTS_FALLBACK, ...jsonMap };
      }),
      catchError(error => {
        // 2nd Priority: Fallback to constant if JSON fails, 404s, or is invalid
        console.warn('AEM JSON failed to load. Falling back to PRODUCTS_FALLBACK:', error?.message || error);
        return of(PRODUCTS_FALLBACK);
      })
    );
  }
}