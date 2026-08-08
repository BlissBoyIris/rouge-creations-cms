/**
 * Strapi Cloud overwrites this file on every deploy to inject its own upload
 * provider, so it holds nothing but a re-export. The configuration itself lives
 * in `config/shared/plugins.ts` and is loaded in production through
 * `config/env/production/plugins.ts`, which Cloud leaves alone.
 */
export { default } from './shared/plugins';
