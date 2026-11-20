import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { TokenAuthService } from '@core/services/token-auth.service';

// opt out: { context: new HttpContext().set(SKIP_TOKEN, true) }
export const SKIP_TOKEN = new HttpContextToken<boolean>(() => false);

// adds the Bearer token to auth-server requests, 401 → logout
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(TokenAuthService);
    const token = auth.token();

    // never send the token to another server
    if (!token || !req.url.startsWith(environment.authUrl) || req.context.get(SKIP_TOKEN)) {
        return next(req);
    }

    // requests are immutable
    const withToken = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

    return next(withToken).pipe(
        catchError((err) => {
            // 401 = token refused (on /login it means wrong password)
            if (
                err instanceof HttpErrorResponse &&
                err.status === 401 &&
                !req.url.endsWith('/login')
            ) {
                auth.logout();
            }
            return throwError(() => err); // the caller still gets it
        }),
    );
};
