/**
 * Debug utility to test post like functionality and inspect responses
 * This helps identify issues with the like/unlike mechanism
 */

import { config } from '@/constants/config';
import { API_ENDPOINTS } from '@/constants/config';

interface LikeDebugResult {
  success: boolean;
  postId: string;
  action: 'like' | 'unlike';
  method: 'POST' | 'DELETE';
  statusCode: number;
  response?: any;
  error?: string;
}

/**
 * Debug utility to test like/unlike functionality with detailed logging
 */
export const debugLikeAPI = async (
  token: string | null,
  postId: string,
  currentlyLiked: boolean
): Promise<LikeDebugResult> => {
  const action = currentlyLiked ? 'unlike' : 'like';
  const method = currentlyLiked ? 'DELETE' : 'POST';
  const endpoint = `${config.apiBaseUrl}${API_ENDPOINTS.posts.like(postId)}`;
  
  console.log('🔍 DEBUG LIKE API: Starting debug for like functionality');
  console.log('📝 Post ID:', postId);
  console.log('📝 Currently liked:', currentlyLiked);
  console.log('📝 Action:', action);
  console.log('📝 Method:', method);
  console.log('📝 Endpoint:', endpoint);
  console.log('📝 Token present:', !!token);

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    console.log('📝 Response status:', response.status);
    console.log('📝 Response ok:', response.ok);
    console.log('📝 Response headers:', Object.fromEntries(response.headers.entries()));

    const result: LikeDebugResult = {
      success: response.ok,
      postId,
      action,
      method,
      statusCode: response.status,
    };

    if (response.ok) {
      try {
        const data = await response.json();
        console.log('✅ SUCCESS: Like API response:', data);
        result.response = data;
      } catch (jsonError) {
        console.log('✅ SUCCESS: Like API responded with no JSON body');
        result.response = { message: 'Success, no body' };
      }
    } else {
      const errorText = await response.text();
      console.log('❌ FAILED: Like API error response:', errorText);
      result.error = errorText;
    }

    return result;
  } catch (error) {
    console.error('❌ ERROR: Exception in like API call:', error);
    return {
      success: false,
      postId,
      action,
      method,
      statusCode: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Debug utility to fetch a post and inspect its like status
 */
export const debugPostLikeStatus = async (
  token: string | null,
  postId: string
): Promise<any> => {
  const endpoint = `${config.apiBaseUrl}${API_ENDPOINTS.posts.byId(postId)}`;
  
  console.log('🔍 DEBUG POST STATUS: Fetching post to check like status');
  console.log('📝 Post ID:', postId);
  console.log('📝 Endpoint:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    console.log('📝 Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS: Post data received:', data);
      
      // Extract post data
      let postData = data;
      if (data.data) {
        postData = data.data;
      }
      
      console.log('📝 Like count:', postData.likeCount);
      console.log('📝 Is liked:', postData.isLiked);
      console.log('📝 Post fields:', Object.keys(postData));
      
      return postData;
    } else {
      const errorText = await response.text();
      console.log('❌ FAILED: Could not fetch post:', errorText);
      return null;
    }
  } catch (error) {
    console.error('❌ ERROR: Exception fetching post:', error);
    return null;
  }
};

/**
 * Test complete like workflow: fetch post, toggle like, fetch again
 */
export const debugLikeWorkflow = async (
  token: string | null,
  postId: string
): Promise<void> => {
  console.log('🚀 STARTING COMPLETE LIKE WORKFLOW DEBUG');
  console.log('==========================================');
  
  // Step 1: Fetch initial post status
  console.log('\n1. Fetching initial post status...');
  const initialPost = await debugPostLikeStatus(token, postId);
  if (!initialPost) {
    console.log('❌ Could not fetch initial post, aborting workflow');
    return;
  }
  
  // Step 2: Toggle like
  console.log('\n2. Toggling like status...');
  const likeResult = await debugLikeAPI(token, postId, initialPost.isLiked);
  
  // Step 3: Fetch post again to verify change
  console.log('\n3. Fetching post after like toggle...');
  const updatedPost = await debugPostLikeStatus(token, postId);
  
  // Step 4: Compare results
  console.log('\n4. RESULTS COMPARISON:');
  console.log('======================');
  console.log('Initial like status:', initialPost.isLiked);
  console.log('Initial like count:', initialPost.likeCount);
  console.log('Like action:', likeResult.action);
  console.log('Like API success:', likeResult.success);
  console.log('Updated like status:', updatedPost?.isLiked);
  console.log('Updated like count:', updatedPost?.likeCount);
  
  // Validate results
  if (!likeResult.success) {
    console.log('❌ WORKFLOW FAILED: Like API call failed');
    return;
  }
  
  if (!updatedPost) {
    console.log('❌ WORKFLOW FAILED: Could not fetch updated post');
    return;
  }
  
  const expectedLikeStatus = !initialPost.isLiked;
  const expectedLikeCount = initialPost.isLiked ? 
    initialPost.likeCount - 1 : 
    initialPost.likeCount + 1;
  
  if (updatedPost.isLiked !== expectedLikeStatus) {
    console.log('❌ WORKFLOW FAILED: Like status not updated correctly');
    console.log('Expected:', expectedLikeStatus);
    console.log('Actual:', updatedPost.isLiked);
  } else if (updatedPost.likeCount !== expectedLikeCount) {
    console.log('❌ WORKFLOW FAILED: Like count not updated correctly');
    console.log('Expected:', expectedLikeCount);
    console.log('Actual:', updatedPost.likeCount);
  } else {
    console.log('✅ WORKFLOW SUCCESS: Like functionality working correctly!');
  }
  
  console.log('==========================================');
  console.log('🏁 WORKFLOW COMPLETE');
};

export default {
  debugLikeAPI,
  debugPostLikeStatus,
  debugLikeWorkflow,
};