import {
  createTransport,
  SendMailOptions,
  SentMessageInfo,
  Transporter
} from 'nodemailer';

import config from '../config';

import { ApiError } from '../errors/api.error';

export class Emailer {
  private transporter: Transporter;

  constructor() {}

  public initTransportSMTP(): void {
    this.transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: '',
        pass: ''
      }
    });
  }

  public sendMail(opts: SendMailOptions): Promise<SentMessageInfo> {
    if (!this.transporter) {
      throw new ApiError('E-mail utility must be initialized!');
    }
    const defOpts: SendMailOptions = {
      from: config.mailer.mail,
      to: opts.to,
      subject: config.mailer.subject,
      text: opts.text,
      replyTo: config.mailer.mail,
      html: opts.html
    };

    return this.transporter.sendMail(defOpts);
  }
}

const emailer: Emailer = new Emailer();
export { emailer };
