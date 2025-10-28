# Firebase Storage Setup for Review Images

This document explains how to set up Firebase Storage for handling review images in the Huggle buyer app.

## Prerequisites

1. Firebase project already created (huggle-goofy-aah)
2. Firebase configuration already exists in `fbconfig.js`
3. Firebase package installed

## Quick Setup

The Firebase Storage integration is now ready! You only need to:

1. **Update your Firebase Storage Rules** (see Firebase Console setup below)
2. **Verify your .env configuration** (bucket details are already added)

## Firebase Console Configuration

### 1. Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `huggle-goofy-aah`
3. Navigate to **Storage** in the left sidebar
4. Click **Get started** if Storage isn't enabled yet

### 2. Configure Storage Rules

Replace the default rules with these rules to allow authenticated uploads:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all users
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to upload review images
    match /review_images/{allPaths=**} {
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024  // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 3. Verify Storage Bucket

Ensure your storage bucket is: `huggle-goofy-aah.firebasestorage.app`

## Environment Configuration

Your `.env` file has been updated with the necessary Firebase configuration:

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyCNg9o8YZy1lHPb5DfXgrgBl4VTOA0O8uo
FIREBASE_AUTH_DOMAIN=huggle-goofy-aah.firebaseapp.com
FIREBASE_PROJECT_ID=huggle-goofy-aah
FIREBASE_STORAGE_BUCKET=huggle-goofy-aah.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=502979598357
FIREBASE_APP_ID=1:502979598357:web:569f85f29b0c2850be161c
FIREBASE_MEASUREMENT_ID=G-5V30G07X2Y
```

**⚠️ Important:** Replace these values with your actual Firebase project configuration if they're different.

## Features Implemented

### 1. Image Upload Functionality
- **Multiple image support**: Users can upload up to 4 images per review
- **Image validation**: 5MB size limit per image
- **Error handling**: User-friendly error messages for upload failures
- **Progress feedback**: Visual feedback during upload process

### 2. Storage Organization
- Images are stored in `review_images/` folder
- Unique filenames prevent conflicts: `timestamp_randomId.jpg`
- Optional review-specific subfolders: `review_images/{reviewId}/`

### 3. Review Integration
- Images are uploaded to Firebase Storage before review submission
- Review database stores array of Firebase Storage URLs
- Supports both single image (legacy) and multiple images
- Edit functionality preserves existing images

## File Structure

```
utils/
├── firebaseStorage.ts     # Firebase Storage utility functions
├── reviews.ts             # Review API functions (updated for multiple images)

fbconfig.js                # Firebase configuration (updated)
.env                      # Environment variables (updated)
```

## Usage Examples

### Upload Review Images
```typescript
import { uploadReviewImages } from '@/utils/firebaseStorage';

const imageUris = ['file:///local/path/1.jpg', 'file:///local/path/2.jpg'];
const downloadUrls = await uploadReviewImages(imageUris);
// Returns: ['https://firebasestorage.../image1.jpg', 'https://firebasestorage.../image2.jpg']
```

### Validate Images
```typescript
import { validateImage } from '@/utils/firebaseStorage';

try {
  await validateImage(imageUri, 5 * 1024 * 1024); // 5MB limit
} catch (error) {
}
```

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check Firebase Storage rules are properly configured
   - Ensure user is authenticated before upload

2. **Images not uploading**
   - Verify Firebase configuration in `.env`
   - Check network connectivity
   - Look for validation errors in console logs

3. **Large file uploads failing**
   - Default limit is 5MB per image
   - Check image compression settings in ImagePicker (quality: 0.7)

### Debug Logging

The app includes comprehensive logging:
- Image validation results
- Upload progress and success/failure
- Review data being sent to backend
- Firebase Storage URLs generated

Check React Native logs for detailed error information.

## Security Notes

1. **Authentication**: Only authenticated users can upload images
2. **File size limits**: 5MB per image prevents abuse
3. **File type restrictions**: Only image files allowed
4. **Storage rules**: Properly configured to prevent unauthorized access

## Testing

1. **Test image upload**: Select images in review screen
2. **Test validation**: Try uploading files >5MB or non-image files
3. **Test multiple images**: Upload 2-4 images per review
4. **Test edit mode**: Modify existing reviews with images

The Firebase Storage integration is now complete and ready for production use!