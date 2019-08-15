import logger from '../utils/logger.util';
import * as express from 'express';

import { ValidationError, ApiError } from '../errors';

class ErrorHandler {
  private errorCode: number;

  public handleError(error: any, res: express.Response, code?: number) {
    logger.error(error);

    switch (error.constructor) {
      case ApiError:
        this.errorCode = code || 400;
        break;
      case ValidationError:
        this.errorCode = code || 400;
        break;
      default:
        this.errorCode = code || 500;
        break;
    }

    return res.status(this.errorCode).send(error.valueOf());
  }
}

export const handleError = new ErrorHandler().handleError;
