/**
 * Enhanced Error Handling Utilities for Location Features
 *
 * Provides comprehensive error handling, retry logic, graceful degradation,
 * and user-friendly error messages for production applications.
 */

import { useCallback, useState, useRef } from 'react';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  API = 'API',
  STORAGE = 'STORAGE',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: unknown;
  timestamp: number;
  recoverable: boolean;
}

// Create typed error instances
export class LocationError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly recoverable: boolean;
  public readonly timestamp: number;

  constructor(
    type: ErrorType,
    message: string,
    options: {
      code?: string;
      details?: unknown;
      recoverable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'LocationError';
    this.type = type;
    this.code = options.code;
    this.details = options.details;
    this.recoverable = options.recoverable ?? true;
    this.timestamp = Date.now();

    if (options.cause) {
      this.cause = options.cause;
    }
  }

  toJSON(): AppError {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      recoverable: this.recoverable,
    };
  }
}

// Error factory functions
export const createNetworkError = (message: string, cause?: Error) =>
  new LocationError(ErrorType.NETWORK, message, { recoverable: true, cause });

export const createValidationError = (message: string, details?: unknown) =>
  new LocationError(ErrorType.VALIDATION, message, { recoverable: false, details });

export const createApiError = (message: string, code?: string, cause?: Error) =>
  new LocationError(ErrorType.API, message, { code, recoverable: true, cause });

export const createStorageError = (message: string, cause?: Error) =>
  new LocationError(ErrorType.STORAGE, message, { recoverable: true, cause });

// User-friendly error messages
export function getErrorMessage(error: LocationError | Error): string {
  if (error instanceof LocationError) {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case ErrorType.VALIDATION:
        return error.message || 'Please check your input and try again.';
      case ErrorType.API:
        return 'Server error occurred. Please try again in a moment.';
      case ErrorType.STORAGE:
        return 'Unable to save your changes locally. Please ensure you have enough storage space.';
      case ErrorType.PERMISSION:
        return "You don't have permission to perform this action.";
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  return error.message || 'An unexpected error occurred.';
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
};

// Enhanced retry logic with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, delayMs, backoffMultiplier, maxDelayMs } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | null = null;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry non-recoverable errors
      if (error instanceof LocationError && !error.recoverable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError || new LocationError(ErrorType.UNKNOWN, 'All retry attempts failed');
}

// Error boundary hook for components
export function useErrorHandler() {
  const [error, setError] = useState<LocationError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCount = useRef(0);

  const handleError = useCallback((error: Error | LocationError) => {
    const locationError =
      error instanceof LocationError
        ? error
        : new LocationError(ErrorType.UNKNOWN, error.message, { cause: error });

    setError(locationError);

    // Log error for monitoring
    console.error('[ErrorHandler]', locationError);

    // Report to error service in production
    if (process.env.NODE_ENV === 'production') {
      reportError(locationError);
    }
  }, []);

  const retry = useCallback(
    async (operation?: () => Promise<void>) => {
      if (!error?.recoverable || isRetrying) return;

      setIsRetrying(true);
      retryCount.current += 1;

      try {
        if (operation) {
          await operation();
        }
        setError(null);
        retryCount.current = 0;
      } catch (newError) {
        handleError(newError as Error);
      } finally {
        setIsRetrying(false);
      }
    },
    [error, isRetrying, handleError]
  );

  const clearError = useCallback(() => {
    setError(null);
    retryCount.current = 0;
  }, []);

  return {
    error,
    isRetrying,
    retryCount: retryCount.current,
    handleError,
    retry,
    clearError,
  };
}

// Safe API call wrapper
export function useSafeApiCall() {
  const { handleError } = useErrorHandler();

  const safeCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      fallback?: T,
      retryConfig?: Partial<RetryConfig>
    ): Promise<T | undefined> => {
      try {
        return await withRetry(apiCall, retryConfig);
      } catch (error) {
        handleError(error as Error);
        return fallback;
      }
    },
    [handleError]
  );

  return { safeCall };
}

// Error reporting (can be extended for external services)
function reportError(error: LocationError) {
  // Example: Send to analytics or error reporting service
  if (typeof window !== 'undefined') {
    // Google Analytics example
    if ('gtag' in window) {
      const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
      gtag?.('event', 'exception', {
        description: `${error.type}: ${error.message}`,
        fatal: false,
        custom_map: {
          error_code: error.code,
          error_type: error.type,
          recoverable: error.recoverable,
        },
      });
    }

    // Sentry example (if Sentry is configured)
    if ('Sentry' in window) {
      const Sentry = (window as { Sentry?: { captureException: (error: Error) => void } }).Sentry;
      Sentry?.captureException(error);
    }
  }
}

// Circuit breaker pattern for repeated failures
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold = 5,
    private timeoutMs = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeoutMs) {
        throw createApiError('Service temporarily unavailable (circuit breaker open)');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures += 1;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Global] Unhandled promise rejection:', event.reason);

      const error =
        event.reason instanceof Error
          ? new LocationError(ErrorType.UNKNOWN, event.reason.message, { cause: event.reason })
          : new LocationError(ErrorType.UNKNOWN, 'Unhandled promise rejection');

      reportError(error);
    });

    window.addEventListener('error', (event) => {
      console.error('[Global] Unhandled error:', event.error);

      const error = new LocationError(
        ErrorType.UNKNOWN,
        event.error?.message || 'Unhandled error',
        { cause: event.error }
      );

      reportError(error);
    });
  }
}
