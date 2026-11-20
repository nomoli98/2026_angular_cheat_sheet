import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { TokenAuthService } from '@core/services/token-auth.service';

// Put it on a request to send it WITHOUT the token (the explain page uses it for its demos):
// this._http.get(url, { context: new HttpContext().set(SKIP_TOKEN, true) })
export const SKIP_TOKEN = new HttpContextToken<boolean>(() => false);

// Runs for EVERY HttpClient request (registered in app.config.ts: withInterceptors([...])).
// 1. adds "Authorization: Bearer <token>" to the requests to OUR auth server
// 2. a 401 (token expired / invalid) → log out
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(TokenAuthService);
  const token = auth.token();

  // Only to our auth server: never send the token to json-server or another site
  if (!token || !req.url.startsWith(environment.authUrl) || req.context.get(SKIP_TOKEN)) {
    return next(req);
  }

  // Requests are immutable: clone() with the new header
  const withToken = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(withToken).pipe(
    catchError((err) => {
      // 401 on a protected route = the server doesn't accept our token anymore.
      // (Not on /login: there a 401 just means "wrong password".)
      if (err instanceof HttpErrorResponse && err.status === 401 && !req.url.endsWith('/login')) {
        auth.logout();
      }
      return throwError(() => err); // the caller still gets the error
    }),
  );
};
