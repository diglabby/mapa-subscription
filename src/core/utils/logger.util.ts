import * as logger from 'winston';

import config from '../config';

class Logger {
  constructor() {
    logger.configure(config.logger);
  }

  public info(message: any) {
    return logger.info(message);
  }

  public error(message: any, ...meta: any[]) {
    return logger.error(message, ...meta);
  }
}

export default new Logger();
