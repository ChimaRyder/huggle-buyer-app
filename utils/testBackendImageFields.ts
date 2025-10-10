import { API_BASE_URL } from "./constants";

/**
 * Test different image field formats with your backend to see what it accepts
 */
export const testBackendImageFields = async (token: string) => {
  const testImageUrl = "https://firebasestorage.googleapis.com/v0/b/huggle-goofy-aah.firebasestorage.app/o/review_images%2Ftest.jpg?alt=media&token=test";
  
  const testPayloads = [
    {
      name: "imageUrl (lowercase, single)",
      payload: {
        productId: "test-product",
        buyerId: "test-buyer", 
        orderId: "test-order",
        orderItemId: "test-item",
        content: "Test review",
        rating: 5,
        imageUrl: testImageUrl
      }
    },
    {
      name: "ImageUrl (uppercase, single)", 
      payload: {
        productId: "test-product",
        buyerId: "test-buyer",
        orderId: "test-order", 
        orderItemId: "test-item",
        content: "Test review",
        rating: 5,
        ImageUrl: testImageUrl
      }
    },
    {
      name: "imageUrls (lowercase, array)",
      payload: {
        productId: "test-product",
        buyerId: "test-buyer",
        orderId: "test-order",
        orderItemId: "test-item", 
        content: "Test review",
        rating: 5,
        imageUrls: [testImageUrl]
      }
    },
    {
      name: "ImageUrls (uppercase, array)",
      payload: {
        productId: "test-product",
        buyerId: "test-buyer",
        orderId: "test-order",
        orderItemId: "test-item",
        content: "Test review", 
        rating: 5,
        ImageUrls: [testImageUrl]
      }
    },
    {
      name: "Both imageUrl and imageUrls",
      payload: {
        productId: "test-product",
        buyerId: "test-buyer",
        orderId: "test-order",
        orderItemId: "test-item",
        content: "Test review",
        rating: 5,
        imageUrl: testImageUrl,
        imageUrls: [testImageUrl]
      }
    },
    {
      name: "image (simple)",
      payload: {
        productId: "test-product",
        buyerId: "test-buyer",
        orderId: "test-order", 
        orderItemId: "test-item",
        content: "Test review",
        rating: 5,
        image: testImageUrl
      }
    },
    {
      name: "images (array)",
      payload: {
        productId: "test-product",
        buyerId: "test-buyer",
        orderId: "test-order",
        orderItemId: "test-item",
        content: "Test review",
        rating: 5,
        images: [testImageUrl]
      }
    }
  ];

  console.log("🔍 TESTING BACKEND IMAGE FIELD FORMATS");
  console.log("🔍 API URL:", API_BASE_URL);

  for (const test of testPayloads) {
    console.log(`\n📝 Testing: ${test.name}`);
    
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
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ SUCCESS with ${test.name}`);
        console.log("📝 Created review:", result);
        
        // Now fetch the review to see what was actually saved
        if (result.data && result.data.id) {
          try {
            const fetchResponse = await fetch(`${API_BASE_URL}/api/reviews/orderitem/${test.payload.orderItemId}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            });
            
            if (fetchResponse.ok) {
              const savedReview = await fetchResponse.json();
              console.log("📝 Saved review data:", savedReview);
              console.log("📝 Image fields in saved review:");
              
              const review = savedReview.data || savedReview;
              console.log("- imageUrl:", review.imageUrl || "NOT_PRESENT");
              console.log("- ImageUrl:", review.ImageUrl || "NOT_PRESENT");
              console.log("- imageUrls:", review.imageUrls || "NOT_PRESENT");
              console.log("- ImageUrls:", review.ImageUrls || "NOT_PRESENT");
              console.log("- image:", review.image || "NOT_PRESENT");
              console.log("- images:", review.images || "NOT_PRESENT");
              
              // If any image field is present, this format works!
              if (review.imageUrl || review.ImageUrl || review.imageUrls || review.ImageUrls || review.image || review.images) {
                console.log("🎉 THIS FORMAT WORKS! Image data was saved!");
                return { success: true, format: test.name, savedReview: review };
              }
            }
          } catch (fetchError) {
            console.log("Could not fetch created review:", fetchError);
          }
        }
        
      } else {
        const errorText = await response.text();
        console.log(`❌ FAILED with ${test.name}: ${errorText}`);
      }
    } catch (error) {
      console.error(`❌ ERROR with ${test.name}:`, error);
    }
  }

  console.log("\n❌ None of the tested formats saved image data successfully");
  return { success: false };
};

export default testBackendImageFields;