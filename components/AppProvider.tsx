/**
 * App Provider Component
 * Combines all global providers (state, error boundaries, etc.) into a single wrapper
 */

import React from 'react';
import Toast from 'react-native-toast-message';

import { ErrorBoundary } from './common';
import { AppStateProvider } from '@/context/AppStateContext';
import { ApiProvider } from '@/context/ApiContext';
import { LocationProvider } from '@/context/LocationContext';
import { OrderProvider } from '@/context/OrderContext';
import { ProductProvider } from '@/context/ProductContext';
import { PostProvider } from '@/context/PostContext';
import { StoreProvider } from '@/context/StoreContext';
import { handleError, ErrorType, ErrorSeverity } from '@/utils/errorHandler';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Error boundary error handler
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Create structured error with component stack info
    const appError = {
      ...error,
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.CRITICAL,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      timestamp: new Date(),
    };

    handleError(appError);
  };

  // Custom fallback for critical errors
  const renderErrorFallback = (error: Error, resetError: () => void) => (
    <ErrorBoundary fallback={() => null}>
      {/* This would render the default ErrorBoundary UI */}
      <></>
    </ErrorBoundary>
  );

  return (
    <ErrorBoundary 
      onError={handleGlobalError}
      fallback={renderErrorFallback}
    >
      <ApiProvider>
        <LocationProvider>
          <OrderProvider>
            <ProductProvider>
              <PostProvider>
                <StoreProvider>
                  <AppStateProvider>
                    {children}
                    {/* Global Toast Messages */}
                    <Toast />
                  </AppStateProvider>
                </StoreProvider>
              </PostProvider>
            </ProductProvider>
          </OrderProvider>
        </LocationProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
};