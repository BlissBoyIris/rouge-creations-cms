import type { Core } from '@strapi/strapi';

/**
 * Production middleware stack (Strapi Cloud always runs with NODE_ENV=production).
 *
 * Cloud overwrites the global `config/middlewares.ts` on every deploy, so the CORS
 * allow-list has to be restated here or it never takes effect.
 *
 * The whole stack is spelled out on purpose: env config is merged into the base
 * array *index by index*, so a shorter array would land its entries on the wrong
 * middlewares. `strapi::security` is spelled out for the same reason — a bare
 * string at that index would overwrite the CSP Cloud sets for its media CDN, and
 * the Media Library would stop rendering thumbnails.
 */
export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          // Cloud serves uploads from <project>.media.strapiapp.com, a different
          // host than the admin, so it needs an explicit img-src/media-src entry.
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            '*.media.strapiapp.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            '*.media.strapiapp.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: env.array('FRONTEND_URLS', [
        'https://www.rougecreations.net',
        'https://rougecreations.net',
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
