import type { Core } from '@strapi/strapi';

/**
 * Development middleware stack. Strapi Cloud overwrites this file on every
 * deploy, so production changes belong in `config/env/production/middlewares.ts`
 * and have to be made in both places.
 */
export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: env.array('FRONTEND_URLS', [
        'http://localhost:3000',
        'https://rouge-creations-website.vercel.app',
      ]),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
