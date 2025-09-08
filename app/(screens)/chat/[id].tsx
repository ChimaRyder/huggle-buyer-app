import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { restaurants } from '@/data/food/mockData';
import { mockStores } from '@/data/mockData';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
  isRead?: boolean;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Memoize the store info to prevent unnecessary re-renders
  const store = useMemo(() => {
    const restaurant = restaurants.find(restaurant => restaurant.id === id);
    const mockStore = mockStores.find(store => store.id === id);
    
    if (restaurant) {
      return {
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.image,
        rating: restaurant.rating,
        distance: restaurant.distance,
        type: 'restaurant' as const
      };
    }
    
    if (mockStore) {
      return {
        id: mockStore.id,
        name: mockStore.name,
        image: mockStore.storeImageUrl,
        rating: mockStore.rating,
        distance: `${mockStore.city}, ${mockStore.province}`,
        type: 'store' as const
      };
    }
    
    return null;
  }, [id]);

  // Generate mock conversation
  useEffect(() => {
    if (!store) return;

    // Generate contextual messages based on store type
    const isGroceryStore = store.type === 'store' || store.name.toLowerCase().includes('market') || store.name.toLowerCase().includes('organic');
    
    const mockMessages: Message[] = [
      {
        id: '1',
        text: `Hi! Welcome to ${store.name}. How can we help you today?`,
        timestamp: '10:30 AM',
        isFromUser: false,
        isRead: true,
      },
      {
        id: '2',
        text: isGroceryStore 
          ? 'Hi! I wanted to ask about the organic produce you have available.'
          : 'Hello! I saw your menu and wanted to ask about your popular items.',
        timestamp: '10:32 AM',
        isFromUser: true,
        isRead: true,
      },
      {
        id: '3',
        text: isGroceryStore
          ? 'Great choice! We have fresh organic produce delivered daily. Our popular items include organic apples, leafy greens, and seasonal vegetables. What are you looking for specifically?'
          : 'Thanks for your interest! Our most popular items are freshly prepared and we use locally sourced ingredients. What type of cuisine are you in the mood for?',
        timestamp: '10:33 AM',
        isFromUser: false,
        isRead: true,
      },
      {
        id: '4',
        text: isGroceryStore
          ? 'Perfect! Do you have any Honeycrisp apples in stock?'
          : 'I\'d love to try something healthy and fresh. What do you recommend?',
        timestamp: '10:35 AM',
        isFromUser: true,
        isRead: true,
      },
      {
        id: '5',
        text: isGroceryStore
          ? 'Yes! We have fresh Honeycrisp apples at $3.99 per lb. They\'re crisp and sweet - perfect for snacking. Would you like me to set some aside for you?'
          : 'I recommend our fresh salad bowls with seasonal ingredients! We also have fruit smoothies made with local produce. Would you like to see our healthy menu options?',
        timestamp: '10:36 AM',
        isFromUser: false,
        isRead: false,
      },
    ];

    setMessages(mockMessages);
  }, [store]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Memoize callback functions to prevent re-renders
  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: false });
  }, []);

  const handleSendMessage = useCallback(() => {
    if (message.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromUser: true,
      isRead: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate store response after 2 seconds
    setTimeout(() => {
      const isGroceryStore = store?.type === 'store' || store?.name.toLowerCase().includes('market') || store?.name.toLowerCase().includes('organic');
      
      const responses = isGroceryStore ? [
        "Thanks for your message! Let me check our current inventory for you.",
        "I'll verify what we have in stock and get back to you shortly.",
        "Great! I'll make sure to have that ready for pickup.",
        "Perfect! Is there anything else from our fresh selection I can help you with?",
        "Let me check with our produce team about availability.",
        "I'll set that aside for you. When would you like to pick it up?",
      ] : [
        "Thanks for your message! I'll get back to you shortly.",
        "Let me check that for you with our kitchen team.",
        "I'll make sure to have that prepared for you!",
        "Great! Is there anything else from our menu I can help you with?",
        "Let me see what our chef recommends today.",
        "Perfect! Would you like to place an order or ask about ingredients?",
      ];
      
      const storeResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)] || "Thanks for your message!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromUser: false,
        isRead: false,
      };

      setMessages(prev => [...prev, storeResponse]);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 2000);
  }, [message, store]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isFromUser ? styles.userMessageContainer : styles.storeMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.isFromUser ? styles.userMessageBubble : styles.storeMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isFromUser ? styles.userMessageText : styles.storeMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          item.isFromUser ? styles.userMessageTime : styles.storeMessageTime
        ]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Store not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Image source={{ uri: store.image }} style={styles.storeAvatar} />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName} numberOfLines={1}>
                {store.name}
              </Text>
              <Text style={styles.storeStatus}>Online</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {/* Input Area */}
        <View style={[styles.inputContainer, { marginBottom: keyboardHeight }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder={`Message ${store?.name || 'store'}...`}
              placeholderTextColor={colors.text.secondary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                message.trim().length === 0 && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={message.trim().length === 0}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={message.trim().length > 0 ? colors.successDark : colors.text.tertiary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerBackButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  storeStatus: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
    marginTop: 2,
  },
  headerAction: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: spacing.sm,
  },
  messageContainer: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  storeMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radii.xs,
  },
  storeMessageBubble: {
    backgroundColor: colors.background.primary,
    borderBottomLeftRadius: radii.xs,
  },
  messageText: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  userMessageText: {
    color: colors.text.inverse,
  },
  storeMessageText: {
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
  },
  userMessageTime: {
    color: colors.text.inverse,
    opacity: 0.8,
    textAlign: 'right',
  },
  storeMessageTime: {
    color: colors.text.secondary,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background.primary,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: 'transparent',
    borderRadius: radii.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSizes.xl,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  backButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
});