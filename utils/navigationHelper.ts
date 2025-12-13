/**
 * NavigationHelper - Centralized navigation utilities for consistent routing behavior
 * 
 * This utility provides a consistent API for navigation throughout the app,
 * handling edge cases like empty navigation stacks and providing fallbacks.
 */

import { router } from 'expo-router';

type NavigationHref = string | { pathname: string; params?: Record<string, any> };

export class NavigationHelper {
  /**
   * Navigate forward with proper stack management
   * @param href - The route to navigate to
   * @param clearStack - Whether to clear the navigation stack before navigating
   */
  static push(href: NavigationHref, clearStack = false) {
    if (clearStack) {
      router.dismissTo('/(tabs)');
    }
    router.push(href as any);
  }

  /**
   * Go back with fallback to home if stack is empty
   * @param fallbackHref - Where to go if navigation stack is empty (defaults to tabs home)
   */
  static back(fallbackHref: NavigationHref = '/(tabs)') {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref as any);
    }
  }

  /**
   * Navigate to specific tab and clear navigation stack
   * @param tabIndex - Index of tab or tab name
   */
  static goToTab(tabIndex: number | string = 0) {
    if (typeof tabIndex === 'string') {
      router.dismissTo(`/(tabs)/${tabIndex}` as any);
    } else {
      router.dismissTo('/(tabs)');
    }
  }

  /**
   * Reset entire navigation to home tab
   */
  static resetToHome() {
    router.dismissTo('/(tabs)');
  }

  /**
   * Replace current screen (can't go back to it)
   * @param href - The route to replace with
   */
  static replace(href: NavigationHref) {
    router.replace(href as any);
  }

  /**
   * Close modal or drawer and return to previous screen
   * Provides fallback if no previous screen exists
   * @param fallbackHref - Where to go if no previous screen (defaults to tabs home)
   */
  static closeModal(fallbackHref?: NavigationHref) {
    if (router.canGoBack()) {
      router.back();
    } else if (fallbackHref) {
      router.replace(fallbackHref as any);
    } else {
      router.replace('/(tabs)');
    }
  }

  /**
   * Navigate to a screen within the same section/tab
   * Used for nested navigation within tabs (e.g., Profile -> Settings)
   * @param href - The route to navigate to
   */
  static pushInTab(href: NavigationHref) {
    router.push(href as any);
  }

  /**
   * Go back within a tab context, with fallback to the tab root
   * @param tabRoot - The root screen of the current tab to fallback to
   */
  static backInTab(tabRoot: NavigationHref) {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(tabRoot as any);
    }
  }

  /**
   * Navigate and ensure the target screen is the root of the stack
   * Useful for deep links or notification handlers
   * @param href - The route to navigate to
   */
  static navigateAndReset(href: NavigationHref) {
    router.dismissTo('/(tabs)');
    router.push(href as any);
  }

  /**
   * Check if we can navigate back
   */
  static canGoBack(): boolean {
    return router.canGoBack();
  }

  /**
   * Navigate with params
   * @param href - The route object with pathname and params
   */
  static pushWithParams(href: { pathname: string; params?: Record<string, any> }) {
    router.push(href as any);
  }

  /**
   * Replace with params
   * @param href - The route object with pathname and params
   */
  static replaceWithParams(href: { pathname: string; params?: Record<string, any> }) {
    router.replace(href as any);
  }
}

/**
 * Hook-friendly wrapper for NavigationHelper
 * Can be used in components that need navigation utilities
 */
export const useNavigationHelper = () => {
  return NavigationHelper;
};
