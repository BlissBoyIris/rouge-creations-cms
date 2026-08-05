import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes: deniedExecutableTypes,
      },
      // Only wire up B2 once real credentials are provided — same guard
      // pattern as the Resend email provider below, so a fresh clone still
      // boots (falling back to local disk storage) without B2 env vars set.
      ...(env('B2_BUCKET')
        ? {
            provider: 'aws-s3',
            providerOptions: {
              s3Options: {
                credentials: {
                  accessKeyId: env('B2_ACCESS_KEY_ID'),
                  secretAccessKey: env('B2_SECRET_ACCESS_KEY'),
                },
                endpoint: env('B2_ENDPOINT'),
                region: env('B2_REGION', 'us-west-004'),
                forcePathStyle: true,
                params: {
                  // Bucket is Private (B2 charges $1 to verify card-on-file
                  // for Public buckets) — ACL: private makes the provider
                  // sign GET URLs instead, so media still loads.
                  ACL: 'private',
                  signedUrlExpires: env('B2_SIGNED_URL_EXPIRES', 60 * 60 * 24 * 7),
                  Bucket: env('B2_BUCKET'),
                },
              },
            },
            actionOptions: {
              upload: {},
              uploadStream: {},
              delete: {},
            },
          }
        : {}),
    },
  },
  // Only wire up Resend once a real API key is provided — without this guard,
  // the provider throws at boot on a fresh clone (empty key) and crashes Strapi
  // entirely. Without a key, Strapi falls back to its bundled sendmail provider,
  // which boots fine and only fails (caught) when an email is actually sent.
  ...(env('RESEND_API_KEY')
    ? {
        email: {
          config: {
            provider: 'strapi-provider-email-resend',
            providerOptions: {
              apiKey: env('RESEND_API_KEY'),
            },
            settings: {
              defaultFrom: env('EMAIL_FROM', 'onboarding@resend.dev'),
              defaultReplyTo: env('EMAIL_REPLY_TO', env('EMAIL_FROM', 'onboarding@resend.dev')),
            },
          },
        },
      }
    : {}),
});

export default config;
