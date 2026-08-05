import type { Core } from '@strapi/strapi';

// Content types the public (unauthenticated) frontend is allowed to read.
const PUBLIC_READ_CONTENT_TYPES = [
  'hero',
  'carousel-item',
  'testimonial',
  'social-link',
  'client',
  'site-stat',
  'gallery-item',
  'expertise',
  'blog-post',
  'resource',
  'global',
];

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Grants the public role read access to marketing content and create-only
   * access to event-inquiry (so the website form can submit leads without
   * exposing other people's submissions). Idempotent — safe to run on every
   * boot, only inserts permissions that don't already exist.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    const desiredActions: string[] = [];
    for (const name of PUBLIC_READ_CONTENT_TYPES) {
      desiredActions.push(`api::${name}.${name}.find`);
      desiredActions.push(`api::${name}.${name}.findOne`);
    }
    desiredActions.push('api::event-inquiry.event-inquiry.create');

    const existing = await strapi
      .query('plugin::users-permissions.permission')
      .findMany({ where: { role: publicRole.id }, select: ['action'] });
    const existingActions = new Set(existing.map((p) => p.action));

    const missingActions = desiredActions.filter(
      (action) => !existingActions.has(action),
    );

    if (missingActions.length === 0) return;

    await Promise.all(
      missingActions.map((action) =>
        strapi.query('plugin::users-permissions.permission').create({
          data: { action, role: publicRole.id },
        }),
      ),
    );

    strapi.log.info(
      `[bootstrap] Granted ${missingActions.length} public permission(s): ${missingActions.join(', ')}`,
    );
  },
};
