/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, radii, shadows } from '@/constants/theme';
import { config } from '@/constants/config';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to log this to a crash reporting service
    if (config.isProduction) {
      // Example: Crashlytics.recordError(error);
      // Example: Sentry.captureException(error);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Ionicons 
                name="warning-outline" 
                size={64} 
                color={colors.error} 
              />
            </View>

            {/* Error Title */}
            <Text style={styles.title}>
              Oops! Something went wrong
            </Text>

            {/* Error Description */}
            <Text style={styles.description}>
              We're sorry, but something unexpected happened. 
              Please try again or contact support if the problem persists.
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={this.resetError}
              >
                <Ionicons 
                  name="refresh-outline" 
                  size={20} 
                  color={colors.text.inverse} 
                  style={styles.buttonIcon}
                />
                <Text style={styles.retryButtonText}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Details (Development Only) */}
            {config.isDevelopment && this.state.error && (
              <View style={styles.errorDetailsContainer}>
                <Text style={styles.errorDetailsTitle}>
                  Error Details (Development Only)
                </Text>
                
                <View style={styles.errorBox}>
                  <Text style={styles.errorMessage}>
                    {this.state.error.message}
                  </Text>
                  
                  <Text style={styles.errorStack}>
                    {this.state.error.stack}
                  </Text>
                  
                  {this.state.errorInfo && (
                    <Text style={styles.errorInfo}>
                      Component Stack:
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSizes.lg * typography.lineHeights.relaxed,
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    ...shadows.md,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  retryButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  errorDetailsContainer: {
    width: '100%',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  errorDetailsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  errorBox: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorMessage: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorStack: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: spacing.sm,
  },
  errorInfo: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;