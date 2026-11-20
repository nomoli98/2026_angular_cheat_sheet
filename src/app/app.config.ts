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
    // withComponentInputBinding: route params (:id) and query params go into the component's input()
    provideRouter(routes, withComponentInputBinding()),
    // HttpClient for the services (withFetch: uses the browser's fetch() API)
    // withInterceptors: runs tokenInterceptor on every request (adds the JWT, see core/interceptors/)
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
    // Before the first page opens: log in again if the auth toggle is 'on' (see shared/auth-toggle/)
    provideAppInitializer(() => inject(AuthToggleService).init()),
  ],
};
