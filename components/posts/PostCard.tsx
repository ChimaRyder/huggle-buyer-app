import React from 'react';
import {
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

interface PostCardProps {
  post: Post;
  size?: 'small' | 'medium' | 'large';
  showStoreInfo?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  size = 'medium', 
  showStoreInfo = false 
}) => {
  const router = useRouter();


  const handlePress = () => {
    router.push(`/(screens)/store/PostScreen?id=${post.id}`);
  };

  // Calculate size based on prop
  const getSize = () => {
    const padding = spacing.lg * 2;
    const available = width - padding;
    
    switch (size) {
      case 'small':
        return (available - spacing.sm * 2) / 3; // 3 columns
      case 'large':
        return available - spacing.sm; // Full width minus margin
      case 'medium':
      default:
        return (available - spacing.sm) / 2; // 2 columns
    }
  };

  const cardSize = getSize();

  return (
    <TouchableOpacity
      style={[
        styles.postCard,
        {
          width: cardSize,
          height: size === 'large' ? cardSize * 0.75 : cardSize,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: post.images[0] }}
        style={styles.postImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  postCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    position: 'relative',
    backgroundColor: colors.background.primary,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
});

export default PostCard;