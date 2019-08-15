export class BaseError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;

    Error.captureStackTrace(this);
  }

  public valueOf() {
    return {
      message: this.message,
      name: this.name
    };
  }
}
