import { storage } from '../fbconfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a single image to Firebase Storage
 * @param uri - Local URI of the image
 * @param path - Storage path (folder structure)
 * @param filename - Name of the file
 * @returns Promise<string> - Download URL of the uploaded image
 */
export const uploadImage = async (
  uri: string, 
  path: string = 'review_images', 
  filename?: string
): Promise<string> => {
  try {
    // Generate filename if not provided
    const finalFilename = filename || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    // Create storage reference
    const storageRef = ref(storage, `${path}/${finalFilename}`);
    
    // Convert URI to blob
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    
    // Upload the blob
    console.log(`Uploading image to: ${path}/${finalFilename}`);
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`Image uploaded successfully: ${downloadURL}`);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param imageUris - Array of local URIs
 * @param path - Storage path (folder structure)
 * @returns Promise<string[]> - Array of download URLs
 */
export const uploadImages = async (
  imageUris: string[],
  path: string = 'review_images'
): Promise<string[]> => {
  try {
    const uploadPromises = imageUris.map((uri, index) => {
      const filename = `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      return uploadImage(uri, path, filename);
    });
    
    const downloadURLs = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${downloadURLs.length} images`);
    
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Upload review images specifically
 * @param imageUris - Array of local URIs
 * @param reviewId - Optional review ID for organized folder structure
 * @returns Promise<string[]> - Array of download URLs
 */
export const uploadReviewImages = async (
  imageUris: string[],
  reviewId?: string
): Promise<string[]> => {
  const path = reviewId ? `review_images/${reviewId}` : 'review_images';
  return uploadImages(imageUris, path);
};

/**
 * Delete an image from Firebase Storage
 * @param downloadURL - The download URL of the image to delete
 */
export const deleteImage = async (downloadURL: string): Promise<void> => {
  try {
    // Extract the path from the download URL
    const url = new URL(downloadURL);
    const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
    
    if (!pathMatch) {
      throw new Error('Invalid download URL format');
    }
    
    const filePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
    console.log(`Image deleted successfully: ${filePath}`);
  } catch (error) {
    console.error('Error deleting image from Firebase Storage:', error);
    throw error;
  }
};

/**
 * Delete multiple images from Firebase Storage
 * @param downloadURLs - Array of download URLs to delete
 */
export const deleteImages = async (downloadURLs: string[]): Promise<void> => {
  try {
    const deletePromises = downloadURLs.map(url => deleteImage(url));
    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${downloadURLs.length} images`);
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw error;
  }
};

/**
 * Get file size from URI (for validation)
 * @param uri - Local URI of the image
 * @returns Promise<number> - File size in bytes
 */
export const getFileSize = async (uri: string): Promise<number> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    throw error;
  }
};

/**
 * Validate image before upload
 * @param uri - Local URI of the image
 * @param maxSizeBytes - Maximum file size in bytes (default: 5MB)
 * @returns Promise<boolean> - Whether the image is valid
 */
export const validateImage = async (
  uri: string, 
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB
): Promise<boolean> => {
  try {
    const fileSize = await getFileSize(uri);
    
    if (fileSize > maxSizeBytes) {
      throw new Error(`File size ${(fileSize / 1024 / 1024).toFixed(2)}MB exceeds maximum limit of ${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB`);
    }
    
    return true;
  } catch (error) {
    console.error('Image validation failed:', error);
    throw error;
  }
};

export default {
  uploadImage,
  uploadImages,
  uploadReviewImages,
  deleteImage,
  deleteImages,
  validateImage,
  getFileSize,
};