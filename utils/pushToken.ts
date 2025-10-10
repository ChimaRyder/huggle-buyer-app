import { API_ENDPOINTS } from "@/constants/config";
import type { ApiResponse } from '@/types/common';

export interface PushTokenRequest {
  token: string;
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  deviceType: string;
  deviceId?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePushTokenStatusRequest {
  isActive: boolean;
}

/**
 * Add or register a new push token
 */
export const addPushToken = async (apiClient: any, pushTokenData: PushTokenRequest): Promise<ApiResponse<PushToken>> => {
  try {
    console.log('📱 PushToken: Adding push token:', pushTokenData.token.substring(0, 20) + '...');
    
    const response = await apiClient.post<PushToken>(
      API_ENDPOINTS.pushTokens.register,
      pushTokenData
    );
    
    if (response.success) {
      console.log('✅ PushToken: Successfully registered push token');
    } else {
      console.error('❌ PushToken: Failed to register push token:', response.error);
    }
    
    return response;
  } catch (error) {
    console.error('❌ PushToken: Error adding push token:', error);
    return {
      success: false,
      error: 'Failed to register push token'
    };
  }
};

/**
 * Update push token status (enable/disable)
 */
export const updatePushTokenStatus = async (
  apiClient: any, 
  tokenId: string, 
  statusData: UpdatePushTokenStatusRequest
): Promise<ApiResponse<any>> => {
  try {
    console.log(`📱 PushToken: Updating token status to ${statusData.isActive ? 'active' : 'inactive'}`);
    
    const response = await apiClient.put(
      API_ENDPOINTS.pushTokens.updateStatus(tokenId),
      statusData
    );
    
    if (response.success) {
      console.log('✅ PushToken: Successfully updated push token status');
    } else {
      console.error('❌ PushToken: Failed to update push token status:', response.error);
    }
    
    return response;
  } catch (error) {
    console.error('❌ PushToken: Error updating push token status:', error);
    return {
      success: false,
      error: 'Failed to update push token status'
    };
  }
};

/**
 * Disable push token (set isActive to false)
 */
export const disablePushToken = async (
  apiClient: any, 
  tokenId: string
): Promise<ApiResponse<any>> => {
  return updatePushTokenStatus(apiClient, tokenId, { isActive: false });
};

/**
 * Enable push token (set isActive to true)
 */
export const enablePushToken = async (
  apiClient: any, 
  tokenId: string
): Promise<ApiResponse<any>> => {
  return updatePushTokenStatus(apiClient, tokenId, { isActive: true });
};
