/**
 * Production plugin config (Strapi Cloud always runs with NODE_ENV=production).
 *
 * Strapi loads `config/plugins` first, then deep-merges this file over it, so
 * the upload provider Cloud injects into the global file survives while our own
 * settings (Resend email, upload allow/deny lists, session flags) are restored.
 * Both files re-export the same source of truth.
 */
export { default } from '../../shared/plugins';
