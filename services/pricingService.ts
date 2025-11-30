import { config } from '@/constants/config';
import type { DynamicPricingResponse } from '@/types/DynamicPricing';

/**
 * Fetch dynamic pricing information for a product
 * @param productId - The ID of the product
 * @param token - Authentication token
 * @returns Promise with dynamic pricing data
 */
export async function fetchDynamicPricingInfo(
  productId: string,
  token: string | null
): Promise<DynamicPricingResponse> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${config.apiBaseUrl}/api/products/${productId}/pricing-info`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pricing info: ${response.statusText}`);
    }

    const data : DynamicPricingResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dynamic pricing info:', error);
    throw error;
  }
}
