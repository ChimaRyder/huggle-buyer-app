/**
 * Dynamic Pricing types for product pricing information
 */

export interface PriceTrajectoryPoint {
  timestamp: string;
  price: number;
  discountPercentage: number;
}

export interface DynamicPricingInfo {
  isDynamicPricingEnabled: boolean;
  currentPrice: number;
  originalPrice: number;
  minimumPrice: number;
  currentDiscount: number;
  expiresOn: string;
  totalDaysInWindow: number;
  daysRemainingInWindow: number;
  hoursUntilExpiry: number;
  minutesUntilExpiry: number;
  priceTrajectory: PriceTrajectoryPoint[];
  stage: number;
  urgencyLevel: 'low' | 'medium' | 'high';
}

export interface DynamicPricingResponse {
  success: boolean;
  data: DynamicPricingInfo;
}
