import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Image, Text, ScrollView } from 'react-native';

import { images, ImageSource } from '../assets';

interface BannerItem {
  id: string;
  image: ImageSource;
  title: string;
  subtitle: string;
}

const bannerData: BannerItem[] = [
  {
    id: '1',
    image: images.banners.promo1,
    title: 'Summer Sale',
    subtitle: 'Up to 50% Off',
  },
  {
    id: '2',
    image: images.banners.promo2,
    title: 'Fresh Deals',
    subtitle: 'Local Picks',
  },
  {
    id: '3',
    image: images.banners.promo3,
    title: 'New Arrivals',
    subtitle: 'Discover Now',
  },
];

const { width } = Dimensions.get('window');
const BANNER_WIDTH = 333;
const BANNER_HEIGHT = 143;

const PromoBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const bannerRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerData.length;
      bannerRef.current?.scrollTo({
        x: nextIndex * BANNER_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={bannerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {bannerData.map((item) => (
          <View key={item.id} style={styles.bannerItem}>
            <Image source={item.image} style={styles.bannerImage} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
      <View style={styles.pagination}>
        {bannerData.map((_, index) => {
          const inputRange = [
            (index - 1) * BANNER_WIDTH,
            index * BANNER_WIDTH,
            (index + 1) * BANNER_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[styles.dot, { width: dotWidth }]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  bannerItem: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    marginHorizontal: (width - BANNER_WIDTH) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginHorizontal: 4,
  },
});

export default PromoBanner;
