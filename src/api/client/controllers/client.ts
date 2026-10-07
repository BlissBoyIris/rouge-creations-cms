import { factories } from '@strapi/strapi';

// Clients come back in the editor-set Order (lowest first), then alphabetically for
// ties — so the logo strip has a stable sequence without the frontend having to ask.
// A caller that passes its own `sort` still gets exactly what it asked for.
const DEFAULT_SORT = ['order:asc', 'name:asc'];

export default factories.createCoreController('api::client.client' as any, () => ({
  async find(ctx) {
    if (!ctx.query.sort) {
      ctx.query = { ...ctx.query, sort: DEFAULT_SORT };
    }
    return super.find(ctx);
  },
}));
