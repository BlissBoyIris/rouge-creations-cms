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

// Recovery data for a one-time incident: renaming the gallery-item relation field
// from `categoryRef` to `category` (2026-09-05) dropped the relation *links* even
// though it kept the gallery-item rows, the gallery-category rows, and every other
// field intact. Rebuilt from a pre-rename API snapshot (captured moments before the
// rename deployed) for 100 of 113 items, and by cross-referencing
// `scripts/gallery-manifest.mjs` (by title, one by cover image filename) for the
// remaining 13, which the earlier snapshot's pagination cut off. Verified 1:1 against
// every documentId live on the API before use. Delete this block and its call in
// `bootstrap` once deployed and confirmed.
const CATEGORY_RECOVERY_MAP: Record<string, string> = {
  h1mj1izgd027z2psxie7pwdf: 'Wedding',
  fnbpbhtmfqy48lmej2wal4rh: 'Wedding',
  dn178i2ztdpk4tzug7mq20to: 'Wedding',
  y7lhgj584p0pqty2c7nd3jat: 'Wedding',
  gjslqqfochlwkagb5sxkcxyd: 'Wedding',
  vhytx4a92be5mtu0l8vpmn9d: 'Wedding',
  kq594cxrn1k2rykhto1lhqij: 'Wedding',
  phzrx1set051x70311z5wl7b: 'Wedding',
  q6wssl3q0fs84f4hva56pj09: 'Wedding',
  lov4cw448a86jbxgv501xcd9: 'Wedding',
  mp7n8j7ccko620q0ff2yw3wx: 'Wedding',
  rpere9mjgy5e0cwojtud8k3t: 'Wedding',
  x07n4jy7w6me6epbohwtecjp: 'Wedding',
  ckcr2fxmw33ndkffzg77gamk: 'Wedding',
  h716u135ah9j4xvm4l5vsl4f: 'Wedding',
  gpdx7jbbdiidc8bk58dgx27o: 'Wedding',
  v8tesnoq5ck9dilbzcj9vmcc: 'Wedding',
  yh7au1v4isxe6q5a1tkjo52x: 'Wedding',
  et7iuq2fz4fqr99vkb03i3t2: 'Corporate',
  e5pfr7jhxkldwmvz624e2lra: 'Corporate',
  whuy1ggcdn61p6p2o455rwl8: 'Corporate',
  q6ed3sxix3c8zusqjnreocbr: 'Corporate',
  ir6zg1m3zwzbpx0pbecryj31: 'Corporate',
  d4qmlpj1nyuxwmgs7r538uz3: 'Corporate',
  ye8tnn0stzvg6k5006wq92qh: 'Corporate',
  wl4e2yafgydztplpty4es9g4: 'Corporate',
  pflvk1pz6mh0ilj4nd4l9nsj: 'Corporate',
  hay43md2oxeyfeq8qfx0x8dj: 'Corporate',
  lyl496p2e2obpvsng1lczz7i: 'Corporate',
  jbqalt5gui3b0tlzz960p5u3: 'Corporate',
  fgesap2lhbz6tc0gsiqxfosf: 'Corporate',
  bgbnm1jz3nmhu28elp6nd567: 'Corporate',
  ebq13uw063vf2bh50dfgk5o1: 'Corporate',
  ciw406wp2cro4wh1itewpfnw: 'Corporate',
  cjneftzqlqxpjorfhcgxacll: 'Corporate',
  a0efq95bpmqwfmlrsl0zcpo5: 'Corporate',
  nww3d0lox8mvhxzlqezrd29o: 'Decor',
  u53yb9zzffnpbbe29hnh4aa0: 'Decor',
  q0dd5kgri8033688mm9camvp: 'Decor',
  uxzyfxkss5cxeke201ydxpk2: 'Decor',
  jfq4ja0hvhjsfwesdz16xb1p: 'Decor',
  b87ki4cwkbj7bue4n52b7m77: 'Decor',
  jee7awex5n7f0x6liuokq18l: 'Decor',
  wdi9l60rtui86fdjbpza5bnc: 'Decor',
  k85ka2vw2bam593uz1fx6dni: 'Decor',
  d15mce6ktnmedgdgusmv4yw0: 'Decor',
  cv3w0io9t0u657mrl5bwl4em: 'Decor',
  hwmwf2e0p36rcmps526yenm6: 'Decor',
  u4bs537h8xum05je60ttfo3z: 'Decor',
  b0p0lxnwk19qyfymv8ujornb: 'Decor',
  biudsz8s3ctdpjerhha7ggj5: 'Decor',
  uukwyg2rgi7dliz7nteh91uf: 'Decor',
  zf22of2waqqd8vsc7uecorua: 'Decor',
  i9h7qi23iu4j1q3trwl694jp: 'Decor',
  s7y2ubbx9cgf1y5cgrpetyp1: 'Decor',
  idz09fn8qp29418gss1i0fur: 'Decor',
  gsxetg71afgh7a0f65x6blzv: 'Decor',
  vcwa0q96hllkp5cp5ak1eenn: 'Decor',
  m1t3yi89r950r6helo2a0c54: 'Decor',
  y1hycwsgpfxgrcwp2ij2xp4f: 'Decor',
  gp3odbjw7pwhumxh1pctn7rf: 'Decor',
  sxvk40e176tcyocq349fucxy: 'Decor',
  ecizlw00pyucr50p64ub99br: 'Decor',
  xl8tpisu1gtjasfxi53ovi1z: 'Decor',
  u101udtvxddopy6wmk0pg52g: 'Decor',
  no5c09n6lenjf30pc9o219qt: 'Decor',
  ns21dyioz8w40trgo15ediii: 'Decor',
  ps3dsgnfhuo18gjcd67ju713: 'Decor',
  x2lio2x1cq63kmgq2i36nm71: 'Decor',
  av5rcjspjm12s8fhywomx278: 'Decor',
  hgp8og2da1uwhgz3twf8v7ql: 'Decor',
  gedtc1ixf81gpqmyxzvbducc: 'Decor',
  i8j597awj4g7xc0f9ca2lkqi: 'Decor',
  v9jnuycot7jqpy0rb0ojxh8y: 'Decor',
  mjui5isqru1ohwofs00cwwts: 'Decor',
  k7lx089cpy6m0rux0alw0koc: 'Decor',
  cxojrr928oxfvpqsijnryzfl: 'Decor',
  dwhs1jjqs47j2jvipdzrvfj0: 'Decor',
  ch7d8sdmjq3p8gurp8nen8bl: 'Decor',
  uw04uviyolav2c5vqqlnn2dq: 'Decor',
  htl3imw9zrrocwjjddm8yyyw: 'Decor',
  x21xvm02e3uw19v5fana6i9b: 'Decor',
  wuo8q1o01i6u9h3akzone5pg: 'Decor',
  qsewegfj50x2p4dk2j6h3t6a: 'Decor',
  suhg7qtjc7cnaqud8nyt64kp: 'Decor',
  eilqtfeew8ffr73pm5s91yjv: 'Decor',
  d5pmwwwld0tfh2uvuzjn60ap: 'Decor',
  xl3o3fb2tgclwswcalsh982w: 'Decor',
  emmmv6fxhd9fs39cp0sg6x2p: 'Decor',
  feenvag6dj9bola1r31lhhbn: 'Decor',
  y5ofhu4g3myf1eripmxhh69b: 'Decor',
  b95062p9x3l3f6ok2943c0z1: 'Decor',
  ntyjb2vz5nqg1i9933za13zt: 'Decor',
  cmgx9lfexaki9zm2j04o41ai: 'Artists',
  drma5o8rs329ftg4v4771gs4: 'Artists',
  tn9nkx8v44ix2j4mvujjiw42: 'Artists',
  o8chdh2dgguxidbwx9di1iqc: 'Artists',
  twzi5q7xvtg1x7x6hvo4f106: 'Artists',
  r93vgzuwv0022x1lf86pna2a: 'Artists',
  m4syaox5gq0vq4ywsw5p2y9v: 'Artists',
  y6czcfzl3lv0k9vj55ufk47o: 'Artists',
  c4g6vj25yomqcc1akgq508ve: 'Artists',
  arnohyyzhcej6cm0qnzfvbxg: 'Artists',
  mu0zvjlhkmh2vmbyjgdlb91v: 'Activation',
  yp9mur4tiuovgqoz4ce5z3i6: 'Activation',
  b278fugk6mp7sc03n6l8yasp: 'Activation',
  t6mjqsy3h0oinn61doroo1vg: 'Activation',
  zgatqi6wir255l3ombtvjgil: 'Activation',
  glgk2kjg21pqrfc3haqpo6nz: 'Activation',
  t1t5z3bozxl6t7qvmtos1f9h: 'Wedding',
  isfmz0vol7z1vkpfz4ct939t: 'Decor',
  zhrqdbmrj8ojdd9gf10qa6lk: 'Decor',
  xpcyz97n770aasz9avjv5wmr: 'Wedding',
};

async function recoverGalleryItemCategories(strapi: Core.Strapi) {
  const categories = await strapi.db
    .query('api::gallery-category.gallery-category')
    .findMany({});
  const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

  let relinked = 0;
  for (const [documentId, categoryName] of Object.entries(CATEGORY_RECOVERY_MAP)) {
    const item = await strapi.documents('api::gallery-item.gallery-item').findOne({
      documentId,
      populate: ['category'],
    });
    if (!item || item.category) continue;

    const categoryId = categoryIdByName.get(categoryName);
    if (!categoryId) {
      strapi.log.warn(
        `[bootstrap] recovery: no gallery-category named "${categoryName}" (item ${documentId})`,
      );
      continue;
    }

    await strapi.documents('api::gallery-item.gallery-item').update({
      documentId,
      data: { category: categoryId },
    });
    relinked += 1;
  }

  if (relinked > 0) {
    strapi.log.info(
      `[bootstrap] Recovery: relinked ${relinked} gallery item(s) after the categoryRef rename dropped their category`,
    );
  }
}

const GALLERY_ITEM_UID = 'api::gallery-item.gallery-item';
const GALLERY_ITEM_TABLE = 'gallery_items';

/**
 * Sends one gallery item to the front and pushes every other item back by one, in a
 * single pass: `order = order + 1` for everything else, then `order = 1` for this one.
 * Raw knex rather than the query layer's `update`, since Strapi's `data.order = data.order
 * + 1` isn't expressible through it — this needs the increment to happen in the
 * database, not read-then-write per row, or two edits landing at once could clobber
 * each other.
 */
async function sendGalleryItemToFront(strapi: Core.Strapi, itemId: number) {
  const trx = await strapi.db.connection.transaction();
  try {
    await trx(GALLERY_ITEM_TABLE).where('id', '!=', itemId).increment('order', 1);
    await trx(GALLERY_ITEM_TABLE).where('id', itemId).update({ order: 1 });
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

/** Loosely zero: catches `0`, `"0"`, and (for create) an omitted field entirely. */
function isFrontSignal(value: unknown, treatMissingAsFront: boolean): boolean {
  if (value === undefined || value === null) return treatMissingAsFront;
  return Number(value) === 0;
}

/**
 * With a hundred-plus gallery photos, renumbering every existing item by hand each time
 * a new one is added is not something an editor should have to do. So: leave a photo's
 * Order at its default (0, or simply don't touch the field) when uploading, and it
 * automatically becomes 1 — everything else shifts back by one, same as a card pushed
 * to the top of a stack. Resetting an existing photo's Order to 0 does the same thing,
 * as a "send to the front" shortcut. An Order set to anything else, on create or edit,
 * is left alone: that is a deliberate, specific placement.
 *
 * Strapi v5's admin Content Manager, REST API, and GraphQL all write through the
 * Document Service, not the raw query engine — `strapi.db.lifecycles` sits one layer
 * too low and never sees these writes, which is why an initial version of this hook
 * (subscribed there) silently did nothing from the admin panel. `strapi.documents.use`
 * is the middleware layer Strapi v5 actually routes every document write through.
 */
function registerGalleryOrderLifecycle(strapi: Core.Strapi) {
  strapi.documents.use(async (context, next) => {
    if (context.uid !== GALLERY_ITEM_UID || !['create', 'update'].includes(context.action)) {
      return next();
    }

    const submittedOrder = (context.params as { data?: { order?: unknown } })?.data?.order;
    const isFront = isFrontSignal(submittedOrder, context.action === 'create');

    const result = await next();

    const id = (result as { id?: number } | null)?.id;
    if (isFront && id) await sendGalleryItemToFront(strapi, id);

    return result;
  });
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Grants the public role read access to marketing content and create-only
   * access to event-inquiry (so the website form can submit leads without
   * exposing other people's submissions). Idempotent — safe to run on every
   * boot, only inserts permissions that don't already exist.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicPermissions(strapi);
    await recoverGalleryItemCategories(strapi);
    registerGalleryOrderLifecycle(strapi);
  },
};
