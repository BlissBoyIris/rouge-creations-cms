interface AfterCreateEvent {
  result: {
    name: string;
    email: string;
    phone?: string;
    eventType?: string;
    eventDate?: string;
    message: string;
  };
}

export default {
  async afterCreate(event: AfterCreateEvent) {
    const { result } = event;

    try {
      await strapi.plugin('email').service('email').send({
        to: process.env.NOTIFY_EMAIL || process.env.EMAIL_FROM,
        replyTo: result.email,
        subject: `New Event Inquiry — ${result.eventType ?? 'General'} (${result.name})`,
        text: [
          'New event inquiry received via the Rouge Creations website.',
          '',
          `Name: ${result.name}`,
          `Email: ${result.email}`,
          `Phone: ${result.phone ?? '—'}`,
          `Event type: ${result.eventType ?? '—'}`,
          `Preferred date: ${result.eventDate ?? '—'}`,
          '',
          'Message:',
          result.message,
        ].join('\n'),
      });
    } catch (error) {
      strapi.log.error(
        '[event-inquiry] failed to send notification email',
        error as Error,
      );
    }
  },
};
