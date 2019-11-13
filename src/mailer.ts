import { emailer } from './core/utils/email.util';
import { createMail } from './core/utils/mailer.util';


class Sender {

    constructor() {
        emailer.initTransportSMTP();
        createMail();
    }

}

export const sender = new Sender();