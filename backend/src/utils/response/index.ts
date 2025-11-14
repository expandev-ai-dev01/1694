/**
 * @summary
 * Response formatting utilities.
 * Provides standardized response structures for API endpoints.
 *
 * @module utils/response
 */

export interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    [key: string]: any;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

export function successResponse<T>(data: T, metadata?: Record<string, any>): SuccessResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
}

export function errorResponse(message: string, code?: string, details?: any): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };
}
