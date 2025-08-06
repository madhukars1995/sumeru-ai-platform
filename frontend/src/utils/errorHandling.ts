import { config } from '../config/environment';

// Error handling utilities

export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  userAgent: string;
  url: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: ErrorInfo[] = [];
  private maxErrors = 100;

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: Error, componentStack?: string): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errors.push(errorInfo);
    
    // Keep only the latest errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorInfo);
    }

    // Send to error reporting service in production
    if (import.meta.env.PROD) {
      this.sendToErrorService(errorInfo);
    }
  }

  private async sendToErrorService(errorInfo: ErrorInfo): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo),
      });
    } catch (error) {
      console.error('Failed to send error to service:', error);
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

// User-friendly error messages
export const getErrorMessage = (error: Error): string => {
  const errorMessages: Record<string, string> = {
    'NetworkError': 'Network connection failed. Please check your internet connection.',
    'TypeError': 'An unexpected error occurred. Please try refreshing the page.',
    'ReferenceError': 'An application error occurred. Please try again.',
    'SyntaxError': 'There was an error processing your request. Please try again.',
  };

  return errorMessages[error.name] || error.message || 'An unexpected error occurred.';
};

// API error handling
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Server error (${status}). Please try again.`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection and try again.';
  } else {
    // Other error
    return getErrorMessage(error);
  }
};

// Retry utility for failed operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

// Error boundary hook
export const useErrorHandler = () => {
  const logger = ErrorLogger.getInstance();

  const handleError = React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    logger.logError(error, errorInfo?.componentStack || undefined);
  }, [logger]);

  return { handleError };
};

// React import for the hook
import React from 'react'; 