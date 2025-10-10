import { API_BASE_URL } from "./constants";

/**
 * Debug utility to test review creation with different payload formats
 * This helps identify what the backend expects for image URLs
 */
export const debugCreateReview = async (
  token: string | null = null,
  reviewData: {
    productId: string;
    buyerId: string;
    orderId: string | null;
    orderItemId?: string | null;
    content: string;
    imageUrls: string[];
    rating: number;
  }
) => {
  const testPayloads = [
    {
      name: "Current format (imageUrls array)",
      payload: reviewData,
    },
    {
      name: "Legacy format (single imageUrl)",
      payload: {
        ...reviewData,
        imageUrl: reviewData.imageUrls[0] || null,
      },
    },
    {
      name: "Both formats",
      payload: {
        ...reviewData,
        imageUrl: reviewData.imageUrls[0] || null,
        imageUrls: reviewData.imageUrls,
      },
    },
    {
      name: "Stringified imageUrls",
      payload: {
        ...reviewData,
        imageUrls: JSON.stringify(reviewData.imageUrls),
      },
    },
  ];

  console.log("🔍 DEBUG: Testing different review payload formats...");
  console.log("🔍 DEBUG: API_BASE_URL:", API_BASE_URL);

  for (const test of testPayloads) {
    console.log(`\n📝 Testing format: ${test.name}`);
    console.log("📝 Payload:", test.payload);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(test.payload),
      });

      console.log(`📝 Response status: ${response.status}`);
      console.log(`📝 Response ok: ${response.ok}`);

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ SUCCESS with ${test.name}:`, result);
        console.log("🎉 This format works! Use this structure.");
        return { success: true, format: test.name, result };
      } else {
        const errorText = await response.text();
        console.log(`❌ FAILED with ${test.name}: ${errorText}`);
      }
    } catch (error) {
      console.error(`❌ ERROR with ${test.name}:`, error);
    }
  }

  return { success: false };
};

/**
 * Debug utility to inspect a successful review creation response
 */
export const inspectReviewResponse = async (
  token: string | null = null,
  orderItemId: string
) => {
  try {
    console.log("🔍 DEBUG: Inspecting review response for orderItemId:", orderItemId);
    
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/orderitem/${orderItemId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("🔍 DEBUG: Review data structure:", result);
      
      if (result.data) {
        const review = result.data;
        console.log("🔍 DEBUG: Review fields present:");
        console.log("- ImageUrl:", review.ImageUrl || "NOT_PRESENT");
        console.log("- ImageUrls:", review.ImageUrls || "NOT_PRESENT");
        console.log("- imageUrl:", review.imageUrl || "NOT_PRESENT");
        console.log("- imageUrls:", review.imageUrls || "NOT_PRESENT");
        console.log("🔍 DEBUG: Full review object keys:", Object.keys(review));
        
        return review;
      }
    } else {
      console.log("🔍 DEBUG: Failed to fetch review:", response.status);
    }
  } catch (error) {
    console.error("🔍 DEBUG: Error inspecting review:", error);
  }
  
  return null;
};

/**
 * Test function to verify Firebase Storage URLs are accessible
 */
export const testFirebaseStorageUrls = async (urls: string[]) => {
  console.log("🔍 DEBUG: Testing Firebase Storage URL accessibility...");
  
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`✅ URL accessible: ${url} (Status: ${response.status})`);
    } catch (error) {
      console.log(`❌ URL not accessible: ${url}`, error);
    }
  }
};

export default {
  debugCreateReview,
  inspectReviewResponse,
  testFirebaseStorageUrls,
};