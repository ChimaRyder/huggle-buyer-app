/**
 * Global Error Handler Utilities
 * Centralized error handling, logging, and user notification patterns
 */

import Toast from 'react-native-toast-message';
import { config } from '@/constants/config';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  API = 'API',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Structured error interface
export interface AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  code?: string;
  statusCode?: number;
  userMessage?: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
}

// Error handler class
class ErrorHandler {
  private static instance: ErrorHandler;
  private errorReports: AppError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Create structured error
  createError(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: {
      code?: string;
      statusCode?: number;
      userMessage?: string;
      originalError?: Error;
      context?: Record<string, any>;
    } = {}
  ): AppError {
    const error = new Error(message) as AppError;
    error.type = type;
    error.severity = severity;
    error.code = options.code;
    error.statusCode = options.statusCode;
    error.userMessage = options.userMessage || this.getDefaultUserMessage(type);
    error.originalError = options.originalError;
    error.context = options.context;
    error.timestamp = new Date();

    return error;
  }

  // Handle and process errors
  handle(error: Error | AppError, context?: Record<string, any>): void {
    const structuredError = this.normalizeError(error, context);
    
    // Log the error
    this.logError(structuredError);
    
    // Store error report
    this.storeErrorReport(structuredError);
    
    // Show user notification based on severity
    this.showUserNotification(structuredError);
    
    // Report to external services in production
    if (config.isProduction) {
      this.reportToExternalServices(structuredError);
    }
  }

  // Normalize any error to AppError structure
  private normalizeError(error: Error | AppError, context?: Record<string, any>): AppError {
    if (this.isAppError(error)) {
      if (context) {
        error.context = { ...error.context, ...context };
      }
      return error;
    }

    // Convert regular Error to AppError
    const type = this.inferErrorType(error);
    const severity = this.inferErrorSeverity(error);
    
    return this.createError(
      error.message,
      type,
      severity,
      {
        originalError: error,
        context,
      }
    );
  }

  // Type guard for AppError
  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'type' in error && 'severity' in error;
  }

  // Infer error type from error message/properties
  private inferErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    
    if (message.includes('api') || message.includes('server') || message.includes('http')) {
      return ErrorType.API;
    }
    
    return ErrorType.UNKNOWN;
  }

  // Infer error severity
  private inferErrorSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('crash')) {
      return ErrorSeverity.CRITICAL;
    }
    
    if (message.includes('auth') || message.includes('network')) {
      return ErrorSeverity.HIGH;
    }
    
    if (message.includes('validation')) {
      return ErrorSeverity.LOW;
    }
    
    return ErrorSeverity.MEDIUM;
  }

  // Get default user-friendly message based on error type
  private getDefaultUserMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Please check your internet connection and try again.';
      case ErrorType.AUTHENTICATION:
        return 'Please sign in again to continue.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.API:
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  // Log error to console (and external logging in production)
  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.type}] ${error.message}`;
    
    console[logLevel](logMessage, {
      severity: error.severity,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      timestamp: error.timestamp,
      stack: error.stack,
    });
  }

  // Get appropriate console log level
  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'warn';
    }
  }

  // Store error report for debugging
  private storeErrorReport(error: AppError): void {
    this.errorReports.push(error);
    
    // Keep only recent errors to avoid memory issues
    if (this.errorReports.length > 100) {
      this.errorReports = this.errorReports.slice(-50);
    }
  }

  // Show user notification based on error severity
  private showUserNotification(error: AppError): void {
    // Only show notifications for certain severity levels
    if (error.severity === ErrorSeverity.LOW) {
      return;
    }

    const toastType = this.getToastType(error.severity);
    const message = error.userMessage || error.message;
    
    Toast.show({
      type: toastType,
      text1: this.getToastTitle(error.type),
      text2: message,
      visibilityTime: this.getVisibilityTime(error.severity),
      autoHide: error.severity !== ErrorSeverity.CRITICAL,
    });
  }

  // Get toast type based on severity
  private getToastType(severity: ErrorSeverity): 'success' | 'error' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'info';
      default:
        return 'info';
    }
  }

  // Get toast title based on error type
  private getToastTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorType.VALIDATION:
        return 'Validation Error';
      case ErrorType.API:
        return 'Service Error';
      default:
        return 'Error';
    }
  }

  // Get visibility time based on severity
  private getVisibilityTime(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 8000;
      case ErrorSeverity.HIGH:
        return 6000;
      case ErrorSeverity.MEDIUM:
        return 4000;
      default:
        return 3000;
    }
  }

  // Report to external services (Crashlytics, Sentry, etc.)
  private reportToExternalServices(error: AppError): void {
    // Only report medium and above severity errors in production
    if (error.severity === ErrorSeverity.LOW) {
      return;
    }

    try {
      // Example: Firebase Crashlytics
      // crashlytics().recordError(error);
      
      // Example: Sentry
      // Sentry.captureException(error, {
      //   tags: {
      //     errorType: error.type,
      //     severity: error.severity,
      //   },
      //   extra: error.context,
      // });
      
      console.log('Would report to external services:', error.type, error.message);
    } catch (reportingError) {
      console.error('Failed to report error to external services:', reportingError);
    }
  }

  // Get error reports (for debugging)
  getErrorReports(): AppError[] {
    return [...this.errorReports];
  }

  // Clear error reports
  clearErrorReports(): void {
    this.errorReports = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: Error | AppError, context?: Record<string, any>): void => {
  errorHandler.handle(error, context);
};

export const createError = (
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  options?: {
    code?: string;
    statusCode?: number;
    userMessage?: string;
    originalError?: Error;
    context?: Record<string, any>;
  }
): AppError => {
  return errorHandler.createError(message, type, severity, options);
};

// Network error helper
export const createNetworkError = (message: string, statusCode?: number): AppError => {
  return createError(message, ErrorType.NETWORK, ErrorSeverity.HIGH, { statusCode });
};

// Authentication error helper
export const createAuthError = (message: string): AppError => {
  return createError(message, ErrorType.AUTHENTICATION, ErrorSeverity.HIGH);
};

// Validation error helper
export const createValidationError = (message: string, field?: string): AppError => {
  return createError(message, ErrorType.VALIDATION, ErrorSeverity.LOW, {
    context: { field },
  });
};

// API error helper
export const createAPIError = (message: string, statusCode?: number, code?: string): AppError => {
  return createError(message, ErrorType.API, ErrorSeverity.MEDIUM, { statusCode, code });
};