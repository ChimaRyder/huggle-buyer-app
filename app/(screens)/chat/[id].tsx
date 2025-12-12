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
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { useChat } from '@/context/ChatContext';
import {
  formatFullMessageTime,
  isMessageFromUser,
  getMessageSenderName
} from '@/utils/chatUtils';
import type { Channel, Message } from 'stream-chat';

export default function ChatScreen() {
  const router = useRouter();
  const { id, storeName, storeImage } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChannel, setIsLoadingChannel] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  const {
    client,
    user,
    isConnected,
    createOrGetChannel,
    channels
  } = useChat();

  const storeId = id as string;

  // Find existing channel or create new one
  useEffect(() => {
    const initializeChannel = async () => {
      if (!storeId) {
        console.error('No store ID provided');
        setIsLoadingChannel(false);
        return;
      }

      if (!client || !user) {
        console.error('Chat client or user not available');
        setIsLoadingChannel(false);
        return;
      }

      if (!isConnected) {
        console.error('Chat client not connected');
        setIsLoadingChannel(false);
        return;
      }

      if (isInitializing) {
        console.log('Channel initialization already in progress');
        return;
      }

      if (currentChannel) {
        console.log('Channel already initialized');
        setIsLoadingChannel(false);
        return;
      }

      try {
        setIsInitializing(true);
        setIsLoadingChannel(true);

        // Try to find existing channel first
        const existingChannel = channels.find(channel =>
          channel.data?.store_id === storeId
        );

        let channel: Channel;
        if (existingChannel) {
          console.log('Found existing channel for store:', storeId);
          channel = existingChannel;
        } else {
          // Create new channel with store
          // Use store name from params or default
          const channelStoreName = (storeName as string) || `Store ${storeId}`;
          const channelStoreImage = (storeImage as string) || '';

          console.log('Creating new channel for store:', storeId, channelStoreName);

          const newChannel = await createOrGetChannel(storeId, channelStoreName, channelStoreImage);
          if (!newChannel) {
            throw new Error('Failed to create channel. Please check your internet connection and try again.');
          }
          channel = newChannel;
        }

        // Watch for channel updates
        await channel.watch();
        setCurrentChannel(channel);

        // Query channel messages to ensure they're loaded
        const messagesResponse = await channel.query({
          messages: { limit: 50 }
        });

        // Load existing messages from the response and sort by created_at
        const channelMessages = messagesResponse.messages || [];
        const sortedMessages = channelMessages.sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeB - timeA;
        });
        setMessages(sortedMessages);

        console.log('Loaded messages for channel:', channelMessages.length, 'messages');

        // Mark channel as read
        await channel.markRead();

      } catch (error) {
        console.error('Failed to initialize channel:', error);
      } finally {
        setIsLoadingChannel(false);
        setIsInitializing(false);
      }
    };

    initializeChannel();
  }, [client, user, isConnected, storeId, createOrGetChannel, storeName, storeImage]);

  // Listen for new messages in current channel
  useEffect(() => {
    if (!currentChannel || !client) return;

    const handleNewMessage = (event: any) => {
      if (event.message && event.channel_id === currentChannel.id) {
        console.log('New message received:', event.message.text);
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(msg => msg.id === event.message.id);
          if (messageExists) return prev;

          // Add new message and sort by created_at
          const newMessages = [...prev, event.message];
          return newMessages.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          });
        });

        // Auto-scroll to bottom for new messages
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    client.on('message.new', handleNewMessage);

    return () => {
      client.off('message.new', handleNewMessage);
    };
  }, [currentChannel, client]);

  // Other participant info (store for buyer app, customer for seller app)
  const otherParticipant = useMemo(() => {
    if (!currentChannel) return null;

    // Get the display information for the other participant
    const storeInfo = {
      id: currentChannel.data?.store_id || storeId,
      name: currentChannel.data?.store_name || (storeName as string) || `Store ${storeId}`,
      image: currentChannel.data?.store_image || (storeImage as string) || `https://api.dicebear.com/6.x/initials/svg?seed=${storeId}`,
    };

    const customerInfo = {
      id: currentChannel.data?.customer_id || '',
      name: currentChannel.data?.customer_name || '',
      image: currentChannel.data?.customer_image || '',
    };

    // For buyer app, show store info. For seller app, show customer info.
    // Since this is buyer app, prioritize store info
    if (storeInfo.name && storeInfo.name !== `Store ${storeId}`) {
      return {
        id: storeInfo.id,
        name: storeInfo.name,
        image: storeInfo.image,
        type: 'store' as const
      };
    } else if (customerInfo.name) {
      return {
        id: customerInfo.id,
        name: customerInfo.name,
        image: customerInfo.image,
        type: 'customer' as const
      };
    } else {
      // Fallback
      return {
        id: storeId,
        name: (storeName as string) || `Store ${storeId}`,
        image: (storeImage as string) || `https://api.dicebear.com/6.x/initials/svg?seed=${storeId}`,
        type: 'store' as const
      };
    }
  }, [currentChannel, storeId, storeName, storeImage]);

  // Memoize callback functions to prevent re-renders
  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: false });
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (message.trim().length === 0 || !currentChannel) {
      console.log('Cannot send message: empty message or no channel');
      return;
    }

    try {
      console.log('Sending message:', message.trim());

      // Send message through Stream Chat
      const response = await currentChannel.sendMessage({
        text: message.trim(),
      });

      console.log('Message sent successfully:', response);

      // Clear input
      setMessage('');

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Failed to send message:', error);
      // You could show an error toast here
    }
  }, [message, currentChannel]);

  const renderMessage = ({ item }: { item: Message }) => {
    if (!item || !item.id) {
      console.log('Invalid message item:', item);
      return null;
    }

    const isFromCurrentUser = user ? isMessageFromUser(item, user.id) : false;
    const messageTime = item.created_at ? formatFullMessageTime(new Date(item.created_at)) : '';
    const messageText = item.text || '';

    return (
      <View style={[
        styles.messageContainer,
        isFromCurrentUser ? styles.userMessageContainer : styles.storeMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isFromCurrentUser ? styles.userMessageBubble : styles.storeMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isFromCurrentUser ? styles.userMessageText : styles.storeMessageText
          ]}>
            {messageText}
          </Text>
          <Text style={[
            styles.messageTime,
            isFromCurrentUser ? styles.userMessageTime : styles.storeMessageTime
          ]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoadingChannel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!otherParticipant || !currentChannel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Unable to load conversation</Text>
          <Text style={styles.errorSubtext}>
            {!isConnected
              ? 'Chat service is not connected. Please check your Stream Chat configuration and internet connection.'
              : !client || !user
                ? 'Chat service is not initialized. Please restart the app and try again.'
                : 'Store not found'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Image source={{ uri: otherParticipant.image }} style={styles.storeAvatar} />
              <View style={styles.storeInfo}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {otherParticipant.name}
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
            ListEmptyComponent={() => (
              <View style={styles.emptyMessagesContainer}>
                <Text style={styles.emptyMessagesText}>
                  {isLoadingChannel ? 'Loading messages...' : 'No messages yet. Start the conversation!'}
                </Text>
              </View>
            )}
            inverted={messages.length > 0}
          />

          {/* Input Area */}
          <View style={[styles.inputContainer]}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={message}
                onChangeText={setMessage}
                placeholder={`Message ${otherParticipant?.name || 'participant'}...`}
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
                  color={message.trim().length > 0 ? colors.primary.main : colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    backgroundColor: colors.primary.main,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  backButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyMessagesText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});