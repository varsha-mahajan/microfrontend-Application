import { Injectable, signal, WritableSignal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { ScreenContentItem, SHELL_FALLBACK, ShellMockConfig } from '../constant/shells-fallback.constant';
// import { SHELL_FALLBACK, ShellMockConfig, ScreenContentItem } from '../constants/shell-fallback.constant';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly jsonAssetUrl = 'assets/mock/shell-mock.json';

  // Private signal initialized with fallback constant
  private configSignal: WritableSignal<ShellMockConfig> = signal<ShellMockConfig>(SHELL_FALLBACK);

  // Read-only signal exposed to components
  public readonly config = this.configSignal.asReadonly();

  // Computed signal to safely get items
  public readonly screenContent = computed(() => {
    return this.config()?.content?.[0]?.screenContent || [];
  });

  constructor(private http: HttpClient) {}

  loadContentConfig() {
    return this.http.get<ShellMockConfig>(this.jsonAssetUrl).pipe(
      tap((data) => this.configSignal.set(data)),
      catchError((error) => {
        console.warn('Failed to load JSON file. Using fallback constant instead.', error);
        this.configSignal.set(SHELL_FALLBACK);
        return of(SHELL_FALLBACK);
      })
    );
  }

  // Get specific block by key
  getContentByKey(key: string): ScreenContentItem | undefined {
    return this.screenContent().find((item) => item.key === key);
  }
}