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
  /**
   * Notify the team about a new lead.
   *
   * Deliberately NOT awaited. The lead is already saved by the time this runs, and
   * the default `sendmail` provider blocks for ~60s when there is no local MTA
   * (every dev machine) — awaiting it held the visitor's form submission open for a
   * minute and then failed the request, even though the inquiry had been stored.
   * Email delivery is best-effort; the submission is not.
   */
  afterCreate(event: AfterCreateEvent) {
    const { result } = event;
    const to = process.env.NOTIFY_EMAIL || process.env.EMAIL_FROM;

    if (!to) {
      strapi.log.info(
        '[event-inquiry] no NOTIFY_EMAIL/EMAIL_FROM configured — inquiry saved, notification skipped',
      );
      return;
    }

    void strapi
      .plugin('email')
      .service('email')
      .send({
        to,
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
      })
      .catch((error: Error) => {
        strapi.log.error(
          '[event-inquiry] failed to send notification email',
          error,
        );
      });
  },
};
