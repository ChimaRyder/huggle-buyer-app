/**
 * Product-related utility functions
 */

/**
 * Calculate the discount percentage based on original and discounted prices
 * @param originalPrice The original price of the product
 * @param discountedPrice The discounted price of the product
 * @param decimals Number of decimal places (default: 0)
 * @returns The discount percentage
 */
export const calculateDiscountPercentage = (
  originalPrice: number,
  discountedPrice: number,
  decimals: number = 0
): number => {
  if (originalPrice <= 0 || discountedPrice <= 0 || discountedPrice >= originalPrice) {
    return 0;
  }

  const discountPercent = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Number(discountPercent.toFixed(decimals));
};

/**
 * Format a price with the specified currency symbol
 * @param price The price to format
 * @param currencySymbol The currency symbol to use (default: '₱')
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number,
  currencySymbol: string = '₱',
  decimals: number = 2
): string => {
  return `${currencySymbol}${price.toFixed(decimals)}`;
};

/**
 * Format a date string to a more readable format
 * @param dateString The date string to format
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  locale: string = 'en-US'
): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};
