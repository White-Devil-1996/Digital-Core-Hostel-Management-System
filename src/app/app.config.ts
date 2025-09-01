

// // app.config.ts
// import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';
// import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';

// import { loaderInterceptor } from './shared/loader-interceptor';
// // ✅ Import HttpClientModule
// // import { HttpClientModule } from '@angular/common/http';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideZonelessChangeDetection(),
//     provideRouter(routes),
//     provideHttpClient(withInterceptors([loaderInterceptor])),
//     provideClientHydration(withEventReplay()),

//     // ✅ Register HttpClientModule for dependency injection
//     // importProvidersFrom(HttpClientModule)
//   ]
// };



import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  importProvidersFrom,
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { loaderInterceptor } from './shared/loader-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(), // no withInterceptors here!
    provideClientHydration(withEventReplay()),

    // ✅ Correct way to register class-based interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: loaderInterceptor,
      multi: true
    }
  ]
};
