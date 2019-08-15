import { BaseError } from './base.error';

export class ApiError extends BaseError {
  public name: string = 'ApiError';
}
