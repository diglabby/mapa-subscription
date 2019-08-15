import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  public name: string = 'ValidationError';
}
