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
  'gallery-category',
  'expertise',
  'blog-post',
  'resource',
  'global',
];

// Chip order gallery categories were shown in before Gallery Category became an
// editor-managed collection type. Used once, to seed initial `order` values.
const INITIAL_CATEGORY_ORDER = [
  'Wedding',
  'Corporate',
  'Decor',
  'Artists',
  'Activation',
  'Conference',
  'Exhibition',
];

async function grantPublicPermissions(strapi: Core.Strapi) {
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
}

/**
 * One-time migration from the old hardcoded `category` enum on gallery-item to the
 * new editor-managed Gallery Category collection type. Idempotent — seeds categories
 * only if none exist yet, and only touches gallery items whose `categoryRef` relation
 * isn't set yet, so it's a no-op on every boot after the first successful run.
 */
async function migrateGalleryCategories(strapi: Core.Strapi) {
  const existingCategories = await strapi.db
    .query('api::gallery-category.gallery-category')
    .findMany({});

  if (existingCategories.length === 0) {
    await Promise.all(
      INITIAL_CATEGORY_ORDER.map((name, index) =>
        strapi.db.query('api::gallery-category.gallery-category').create({
          data: { name, order: index + 1 },
        }),
      ),
    );
    strapi.log.info(
      `[bootstrap] Seeded ${INITIAL_CATEGORY_ORDER.length} gallery categories`,
    );
  }

  const categories = await strapi.db
    .query('api::gallery-category.gallery-category')
    .findMany({});
  const categoryByName = new Map(categories.map((c) => [c.name, c]));

  const allItems = await strapi.db.query('api::gallery-item.gallery-item').findMany({
    populate: ['categoryRef'],
    orderBy: { createdAt: 'asc' },
  });
  const unlinkedItems = allItems.filter((item) => !item.categoryRef);

  if (unlinkedItems.length === 0) return;

  await Promise.all(
    unlinkedItems.map((item, index) => {
      const category = categoryByName.get(item.category);
      if (!category) {
        strapi.log.warn(
          `[bootstrap] gallery-item ${item.id} has unrecognized category "${item.category}", skipping`,
        );
        return null;
      }
      return strapi.db.query('api::gallery-item.gallery-item').update({
        where: { id: item.id },
        data: { categoryRef: category.id, order: (index + 1) * 10 },
      });
    }),
  );

  strapi.log.info(
    `[bootstrap] Linked ${unlinkedItems.length} gallery item(s) to their gallery category`,
  );
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Grants the public role read access to marketing content and create-only
   * access to event-inquiry (so the website form can submit leads without
   * exposing other people's submissions), then runs the gallery-category
   * migration. Both are idempotent — safe to run on every boot.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicPermissions(strapi);
    await migrateGalleryCategories(strapi);
  },
};
