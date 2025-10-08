import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radii } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  storeId: string;
  storeName: string;
  storeAvatar: string;
  images: string[];
  caption: string;
  likes: number;
  createdAt: string;
}

interface FeaturedPostCardProps {
  post: Post;
}

const FeaturedPostCard: React.FC<FeaturedPostCardProps> = ({ post }) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePress = () => {
    router.push(`/(screens)/store/PostScreen?id=${post.id}`);
  };

  return (
    <View style={styles.containerWrapper}>
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.95}>
        {/* Image */}
        <Image 
          source={{ uri: post.images[currentImageIndex] }} 
          style={styles.postImage} 
          resizeMode="cover" 
        />
        
        {/* Image indicator dots */}
        {post.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {post.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  postImage: {
    width: width - (spacing.md * 2),
    height: width - (spacing.md * 2),
    backgroundColor: colors.background.tertiary,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs / 2,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

export default FeaturedPostCard;