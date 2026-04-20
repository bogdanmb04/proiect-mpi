import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { AuthenticationService } from './services/authentication-service';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

// Interceptor to add credentials to all requests
function credentialsInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const clonedReq = req.clone({
    withCredentials: true
  });
  return next(clonedReq);
}

// Interceptor to handle 401 errors and auto-refresh tokens
function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthenticationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return new Promise<HttpEvent<unknown>>((resolve, reject) => {
          authService.refreshAccessToken().then(success => {
            if (success) {
              // Retry the request with new token
              const clonedReq = req.clone();
              next(clonedReq).subscribe(resolve, reject);
            } else {
              reject(error);
            }
          });
        });
      }
      return throwError(() => error);
    })
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([credentialsInterceptor, authInterceptor]),
      withFetch()
    )
  ]
};
