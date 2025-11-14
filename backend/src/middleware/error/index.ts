/**
 * @summary
 * Global error handling middleware.
 * Catches and processes all errors thrown in the application.
 *
 * @module middleware/error
 */

import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export async function errorMiddleware(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  console.error('Error:', {
    statusCode,
    message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
  });
}
