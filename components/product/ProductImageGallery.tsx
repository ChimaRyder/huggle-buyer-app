import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface ProductImageGalleryProps {
  images: (string | any)[];
  onClose?: () => void;
  onReport?: () => void;
  showCloseButton?: boolean;
  showReportButton?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  onClose,
  onReport,
  showCloseButton = true,
  showReportButton = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleImageScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffset / width);
    setCurrentImageIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      {/* Image Gallery */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleImageScroll}
        style={styles.imageGallery}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="start"
      >
        {images.map((imageSource, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={
                typeof imageSource === 'string' 
                  ? { uri: imageSource }
                  : imageSource
              }
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Enhanced Close Button */}
      {showCloseButton && onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
            style={styles.buttonGradient}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Enhanced Report Button */}
      {showReportButton && onReport && (
        <TouchableOpacity
          style={styles.reportButton}
          onPress={onReport}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
            style={styles.buttonGradient}
          >
            <Ionicons name="flag" size={20} color={colors.text.primary} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Enhanced Dots Indicator */}
      {images.length > 1 && (
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'transparent']}
          style={styles.dotsGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 380,
    position: 'relative',
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  imageGallery: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: '100%',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    zIndex: 2,
    ...shadows.lg,
  },
  reportButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    zIndex: 2,
    ...shadows.lg,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsGradient: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
    ...shadows.xs,
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 28,
    borderRadius: 14,
    ...shadows.sm,
  },
});

export default ProductImageGallery;