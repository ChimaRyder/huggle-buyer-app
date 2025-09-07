import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { restaurants } from '@/data/food/mockData';
import { mockStores } from '@/data/mockData';

// Mock chat conversations interface
interface ChatConversation {
  id: string;
  storeId: string;
  storeName: string;
  storeImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

// Generate mock chat conversations based on restaurants and stores
const generateMockChats = (): ChatConversation[] => {
  const mockMessages = [
    "Your order is ready for pickup!",
    "Thank you for your order. We're preparing it now.",
    "We have a special offer on organic produce today!",
    "Your delivery will arrive in 30 minutes.",
    "Welcome! How can we help you today?",
    "Your payment has been processed successfully.",
    "We're running low on this item. Would you like a substitute?",
    "Don't forget about your items in the cart!",
    "New arrivals just came in! Check them out.",
    "Your favorite items are back in stock!",
  ];

  // Combine restaurants from food data and grocery stores from main mock data
  const allStores = [
    ...restaurants.slice(0, 4).map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image,
      type: 'restaurant'
    })),
    ...mockStores.filter(store => store.storeCategory?.includes('Grocery') || store.storeCategory?.includes('Organic')).slice(0, 3).map(store => ({
      id: store.id,
      name: store.name,
      image: store.storeImageUrl,
      type: 'grocery'
    }))
  ];

  return allStores.map((store, index) => ({
    id: `chat-${store.id}`,
    storeId: store.id,
    storeName: store.name,
    storeImage: store.image,
    lastMessage: mockMessages[index % mockMessages.length] || "Welcome! How can we help you today?",
    lastMessageTime: index === 0 ? "2m ago" : index === 1 ? "1h ago" : index === 2 ? "3h ago" : index === 3 ? "1d ago" : "2d ago",
    unreadCount: index < 3 ? Math.floor(Math.random() * 4) + 1 : 0,
    isOnline: index < 4,
  }));
};

export default function ChatListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats] = useState<ChatConversation[]>(generateMockChats());

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chat: ChatConversation) => {
    router.push(`/(screens)/chat/${chat.storeId}`);
  };

  const renderChatItem = ({ item }: { item: ChatConversation }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.storeImage }} style={styles.storeAvatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.storeName}
          </Text>
          <Text style={styles.messageTime}>{item.lastMessageTime}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat List */}
      {filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          contentContainerStyle={styles.chatListContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No conversations found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.length > 0 
              ? "Try searching for a different store"
              : "Start shopping to chat with stores!"
            }
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary, // Light gray background
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  searchContainer: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    width: '100%',
    maxWidth: 400,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingVertical: spacing.xs,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  storeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.tertiary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  storeName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  messageTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lastMessage: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  unreadCount: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
});