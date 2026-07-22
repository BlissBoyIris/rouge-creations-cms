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
