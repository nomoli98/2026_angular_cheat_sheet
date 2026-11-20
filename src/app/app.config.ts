import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthToggleService } from '@shared/auth-toggle/auth-toggle.service';
import { tokenInterceptor } from '@core/interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        // route + query params → input()
        provideRouter(routes, withComponentInputBinding()),
        // withFetch + tokenInterceptor on every request
        provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
        // log in again on start if the toggle is on
        provideAppInitializer(() => inject(AuthToggleService).init()),
    ],
};
