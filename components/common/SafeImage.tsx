import React from 'react';
import { Image, ImageProps } from 'react-native';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string | string[] | any } | any;
  fallbackUri?: string;
}

/**
 * SafeImage component that handles various image data types safely
 * Prevents "Value for uri cannot be cast from ReadableNativeArray to String" errors
 */
const SafeImage: React.FC<SafeImageProps> = ({ 
  source, 
  fallbackUri = 'https://via.placeholder.com/300x200?text=No+Image',
  ...props 
}) => {
  const getSafeUri = (): string => {
    // Handle direct string URI
    if (typeof source === 'string') {
      return source;
    }
    
    // Handle source object with uri property
    if (source && typeof source === 'object' && source.uri) {
      const uri = source.uri;
      
      // If uri is a string, use it directly
      if (typeof uri === 'string') {
        return uri;
      }
      
      // If uri is an array, use the first element
      if (Array.isArray(uri) && uri.length > 0) {
        return typeof uri[0] === 'string' ? uri[0] : fallbackUri;
      }
    }
    
    // Handle direct array (shouldn't happen but just in case)
    if (Array.isArray(source) && source.length > 0) {
      return typeof source[0] === 'string' ? source[0] : fallbackUri;
    }
    
    console.warn('SafeImage: Could not resolve image source, using fallback:', source);
    return fallbackUri;
  };

  const safeUri = getSafeUri();
  
  // Add additional safety check
  if (typeof safeUri !== 'string') {
    console.error('SafeImage: Final URI is not a string:', safeUri);
    return <Image source={{ uri: fallbackUri }} {...props} />;
  }

  return <Image source={{ uri: safeUri }} {...props} />;
};

export default SafeImage;