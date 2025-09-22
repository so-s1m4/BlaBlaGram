import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { API_URL } from 'app/app.config';
import { catchError, Observable } from 'rxjs';

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  if (!req.url.startsWith('http')) {
    req = req.clone({
      url: API_URL + `${req.url}`,
    });
  }
  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authService.token}`,
    },
  });
  return next(req);
}

export function errorCatcher(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        const authService = inject(AuthService);
        authService.logout();
      }
      throw err;
    })
  );
}