import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../types/invoice.types';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Handle Prisma / standard errors
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: err.message || 'Internal Server Error',
      statusCode: 500,
    },
  });
};
