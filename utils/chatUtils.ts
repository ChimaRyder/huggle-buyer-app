import type { Channel, Message } from 'stream-chat';

export interface ChatConversation {
  id: string;
  storeId: string; // Actually represents the other participant's ID (store for buyer, customer for seller)
  storeName: string; // Actually represents the other participant's name (store name for buyer, customer name for seller)
  storeImage: string; // Actually represents the other participant's image (store image for buyer, customer image for seller)
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  channel?: Channel;
}

/**
 * Convert Stream Chat channel to our ChatConversation format
 * Dynamically determines the display name based on the other participant
 */
export function channelToChatConversation(channel: Channel, currentUserId?: string): ChatConversation {
  // Get channel members
  const members = Object.keys(channel.state?.members || {});
  const otherMember = members.find(member => member !== currentUserId) || '';

  // Determine the other participant's information based on available data
  let displayName: string;
  let participantId: string;
  let participantImage: string;

  // Check if we have explicit store information (for buyer app)
  const storeId = (channel.data?.store_id as string) || '';
  const storeName = (channel.data?.store_name as string) || '';
  const storeImage = (channel.data?.store_image as string) || '';

  // Check if we have explicit customer information (for seller app)
  const customerId = (channel.data?.customer_id as string) || '';
  const customerName = (channel.data?.customer_name as string) || '';
  const customerImage = (channel.data?.customer_image as string) || '';

  if (storeId && storeName) {
    // This is from buyer app perspective - show store info
    displayName = storeName;
    participantId = storeId;
    participantImage = storeImage || `https://api.dicebear.com/6.x/initials/svg?seed=${storeName}`;
  } else if (customerId && customerName) {
    // This is from seller app perspective - show customer info
    displayName = customerName;
    participantId = customerId;
    participantImage = customerImage || `https://api.dicebear.com/6.x/initials/svg?seed=${customerName}`;
  } else {
    // Fallback: use the other member ID as both name and ID
    displayName = otherMember || 'Unknown';
    participantId = otherMember;
    participantImage = `https://api.dicebear.com/6.x/initials/svg?seed=${otherMember}`;
  }

  // Get last message
  const messages = Object.values(channel.state.messages || {});
  const lastMessage = messages[messages.length - 1];

  const lastMessageText = lastMessage?.text || 'No messages yet';
  const lastMessageTime = lastMessage?.created_at
    ? formatMessageTime(new Date(lastMessage.created_at))
    : '';

  // Calculate unread count
  const unreadCount = channel.countUnread() || 0;

  // Check if store is online (simplified - you can implement proper presence)
  const isOnline = Math.random() > 0.3; // Mock online status

  return {
    id: channel.id || '',
    storeId: participantId, // This will be store ID for buyer app, customer ID for seller app
    storeName: displayName,  // This will be store name for buyer app, customer name for seller app
    storeImage: participantImage, // This will be store image for buyer app, customer image for seller app
    lastMessage: lastMessageText,
    lastMessageTime,
    unreadCount,
    isOnline,
    channel,
  };
}

/**
 * Format message timestamp for display
 */
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInHours = diff / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes < 1 ? 'now' : `${minutes}m`;
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days}d`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

/**
 * Format full message timestamp
 */
export function formatFullMessageTime(date: Date): string {
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === date.toDateString();

    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}

/**
 * Generate store user ID for Stream Chat
 */
export function getStoreUserId(storeId: string): string {
  return `store-${storeId}`;
}

/**
 * Generate channel ID for customer-store conversation
 */
export function generateChannelId(customerId: string, storeId: string): string {
  return `customer-${customerId}-store-${storeId}`;
}

/**
 * Check if message is from current user
 */
export function isMessageFromUser(message: Message, userId: string): boolean {
  return message.user?.id === userId;
}

/**
 * Get display name for message sender
 */
export function getMessageSenderName(message: Message, isFromCurrentUser: boolean): string {
  if (isFromCurrentUser) {
    return 'You';
  }
  return message.user?.name || 'Store';
}

/**
 * Sort channels by last message time
 */
export function sortChannelsByLastMessage(channels: Channel[]): Channel[] {
  return channels.sort((a, b) => {
    const aLastMessage = a.state.last_message_at;
    const bLastMessage = b.state.last_message_at;

    if (!aLastMessage && !bLastMessage) return 0;
    if (!aLastMessage) return 1;
    if (!bLastMessage) return -1;

    return new Date(bLastMessage).getTime() - new Date(aLastMessage).getTime();
  });
}

/**
 * Filter channels by search query
 */
export function filterChannelsByQuery(channels: Channel[], query: string): Channel[] {
  if (!query.trim()) return channels;

  const lowerQuery = query.toLowerCase();
  return channels.filter(channel => {
    const storeName = (channel.data?.store_name as string) || (channel.data?.name as string) || '';
    return storeName.toLowerCase().includes(lowerQuery);
  });
}