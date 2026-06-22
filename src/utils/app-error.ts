export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, errorCode: string, message: string, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    // TypeScript uchun prototype zanjirini to'g'rilaymiz
    Object.setPrototypeOf(this, new.target.prototype);

    // Xatolik qayerdan chiqqanini (Stack Trace) kuzatish uchun
    Error.captureStackTrace(this, this.constructor);
  }
}