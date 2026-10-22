import {
  ApplicationConfig,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { PRIME_NG_CONFIG, PrimeNG, PrimeNGConfigType } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { MessageService, ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';

const AcademicPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#00b4d8',
      600: '#0096c7',
      700: '#0077b6',
      800: '#023e8a',
      900: '#03045e',
      950: '#060b18'
    }
  }
});

function provideCustomPrimeNG(...features: PrimeNGConfigType[]): EnvironmentProviders {
  const providers = features?.map((feature) => ({
    provide: PRIME_NG_CONFIG,
    useValue: feature,
    multi: false,
  }));

  const initializer = provideAppInitializer(() => {
    const primeNGConfig = inject(PrimeNG);
    features?.forEach((feature) => primeNGConfig.setConfig(feature));
    primeNGConfig._setVerified(true);
  });

  return makeEnvironmentProviders([...(providers || []), initializer]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideCustomPrimeNG({
      theme: {
        preset: AcademicPreset,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: false
        }
      },
      ripple: true
    }),
    MessageService,
    ConfirmationService
  ]
};
