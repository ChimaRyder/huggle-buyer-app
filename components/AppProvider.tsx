/**
 * App Provider Component
 * Combines all global providers (state, error boundaries, etc.) into a single wrapper
 */

import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';

import { ErrorBoundary } from './common';
import { AppStateProvider } from '@/context/AppStateContext';
import { ApiProvider } from '@/context/ApiContext';
import { LocationProvider, useLocationContext } from '@/context/LocationContext';
import { OrderProvider } from '@/context/OrderContext';
import { ProductProvider } from '@/context/ProductContext';
import { PostProvider } from '@/context/PostContext';
import { StoreProvider } from '@/context/StoreContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { handleError, ErrorType, ErrorSeverity } from '@/utils/errorHandler';

// Component to initialize location as early as possible
const LocationInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializeLocationInBackground } = useLocationContext();
  
  useEffect(() => {
    const initializeEarly = async () => {
      try {
        console.log('🚀 AppProvider: Early location initialization started');
        await initializeLocationInBackground();
        console.log('✅ AppProvider: Early location initialization completed');
      } catch (error) {
        console.warn('⚠️ AppProvider: Early location initialization failed:', error);
      }
    };

    // Initialize location as soon as the provider is available
    initializeEarly();
  }, [initializeLocationInBackground]);

  return <>{children}</>;
};

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
          <LocationInitializer>
            <OrderProvider>
              <ProductProvider>
                <PostProvider>
                  <StoreProvider>
                    <NotificationProvider>
                      <AppStateProvider>
                        {children}
                        {/* Global Toast Messages */}
                        <Toast />
                      </AppStateProvider>
                    </NotificationProvider>
                  </StoreProvider>
                </PostProvider>
              </ProductProvider>
            </OrderProvider>
          </LocationInitializer>
        </LocationProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
};