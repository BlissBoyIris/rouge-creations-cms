/**
 * Strapi Cloud overwrites this file on every deploy to inject its own upload
 * provider, so it holds nothing but a re-export. The configuration itself lives
 * in `config/env/production/plugins.ts`, which Cloud leaves alone and merges
 * over whatever it injects here.
 *
 * Locally, `config/env/production` is never read (NODE_ENV is development), so
 * this re-export is what gives dev the same plugin config as production.
 */
export { default } from './env/production/plugins';
