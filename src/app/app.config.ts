import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IMAGE_CONFIG } from '@angular/common';

export const WEB_SOCKET_URL = 'https://blablagram.m0sk1tu4.codes';
export const API_URL = 'https://blablagram.m0sk1tu4.codes/api';
export const API_PUBLIC_URL = 'https://blablagram.m0sk1tu4.codes/public';
export const MEDIA_SERVER_URL = 'https://blablagram.m0sk1tu4.codes/mediaserver';
export const MEDIA_SERVER_PUBLIC_URL =
  'https://blablagram.m0sk1tu4.codes/mediaserver/public';
export const DEFAULT_AVATAR_URL =
  'https://www.htlstp.ac.at/wp-content/uploads/2024/08/maus.jpeg';

// export const WEB_SOCKET_URL = 'http://172.25.251.28:8001';
// export const API_URL = 'http://172.25.251.28:8001/api';
// export const API_PUBLIC_URL = 'https://blablagram.m0sk1tu4.codes/public';
// export const MEDIA_SERVER_URL = 'https://blablagram.m0sk1tu4.codes/mediaserver';
// export const MEDIA_SERVER_PUBLIC_URL =
//   'https://blablagram.m0sk1tu4.codes/mediaserver/public';
// export const DEFAULT_AVATAR_URL =
//   'https://www.htlstp.ac.at/wp-content/uploads/2024/08/maus.jpeg';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([])),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
};
