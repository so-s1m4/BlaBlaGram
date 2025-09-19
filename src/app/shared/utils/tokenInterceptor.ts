import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { API_URL } from 'app/app.config';
import { Observable } from 'rxjs';

export default function loggingInterceptor(
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
