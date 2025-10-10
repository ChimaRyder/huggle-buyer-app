import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import type {
  Channel,
  ChannelSort,
  ChannelFilters,
  ChannelOptions,
  User,
  Event
} from 'stream-chat';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { config } from '@/constants/config';

interface ChatContextType {
  client: StreamChat | null;
  user: User | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  channels: Channel[];
  createOrGetChannel: (storeId: string, storeName: string, storeImage?: string) => Promise<Channel | null>;
  refreshChannels: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { getToken, userId, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);

  // Initialize Stream Chat client
  useEffect(() => {
    const initializeChat = async () => {
      if (!isSignedIn || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Validate API key
        if (!config.streamChat.apiKey || config.streamChat.apiKey === 'your_stream_api_key_here') {
          throw new Error('Stream Chat API key is not configured. Please set EXPO_PUBLIC_STREAM_API_KEY in your environment variables.');
        }

        console.log('Initializing Stream Chat with API key:', config.streamChat.apiKey.slice(0, 8) + '...');

        // Create Stream Chat client
        const chatClient = StreamChat.getInstance(config.streamChat.apiKey);

        // For development, we'll use a simple token generation
        // In production, you should generate this token on your backend
        const token = chatClient.devToken(userId);

        console.log('Connecting user to Stream Chat:', userId);

        // Get customer name and image from Clerk user
        const customerName = clerkUser?.firstName && clerkUser?.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser?.firstName || `Customer ${userId.slice(0, 8)}`;
        const customerImage = clerkUser?.imageUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${customerName}`;

        // Connect user to Stream Chat
        const streamUser = await chatClient.connectUser(
          {
            id: userId,
            name: customerName,
            image: customerImage,
            role: 'customer',
          },
          token
        );

        console.log('Successfully connected to Stream Chat');

        setClient(chatClient);
        setUser(streamUser?.me || null);
        setIsConnected(true);

        // Load initial channels
        await loadChannels(chatClient);

      } catch (err) {
        console.error('Failed to initialize chat:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat';
        setError(errorMessage);

        // If it's an API key issue, provide more helpful guidance
        if (errorMessage.includes('API key') || errorMessage.includes('secret')) {
          setError('Stream Chat is not properly configured. Please check your Stream API key configuration.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (client) {
        client.disconnectUser();
        setClient(null);
        setUser(null);
        setIsConnected(false);
      }
    };
  }, [isSignedIn, userId]);

  // Load channels
  const loadChannels = async (chatClient: StreamChat) => {
    try {
      const filters: ChannelFilters = {
        type: 'messaging',
        members: { $in: [userId!] },
      };

      const sort: ChannelSort = { last_message_at: -1 };
      const options: ChannelOptions = { limit: 20 };

      const channelsResponse = await chatClient.queryChannels(filters, sort, options);
      setChannels(channelsResponse);
    } catch (err) {
      console.error('Failed to load channels:', err);
    }
  };

  // Refresh channels
  const refreshChannels = async () => {
    if (client && userId) {
      await loadChannels(client);
    }
  };

  // Create or get existing channel with a store
  const createOrGetChannel = async (storeId: string, storeName: string, storeImage?: string): Promise<Channel | null> => {
    if (!client || !userId) {
      console.error('Cannot create channel: client or userId is missing', { client: !!client, userId: !!userId, isConnected });
      return null;
    }

    if (!isConnected) {
      console.error('Cannot create channel: Stream Chat client is not connected');
      return null;
    }

    try {
      console.log('Creating/getting channel for store:', storeId, storeName);

      // Get customer details for channel data
      const customerName = clerkUser?.firstName && clerkUser?.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser?.firstName || `Customer ${userId.slice(0, 8)}`;
      const customerImage = clerkUser?.imageUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${customerName}`;

      const channel = client.channel('messaging', {
        members: [userId, storeId],
        // Custom data for channel - store both customer and seller details
        store_id: storeId,
        store_name: storeName,
        store_image: storeImage || `https://api.dicebear.com/6.x/initials/svg?seed=${storeName}`,
        customer_id: userId,
        customer_name: customerName,
        customer_image: customerImage,
      } as any);

      console.log('Watching channel with members:', [userId, storeId]);
      await channel.watch();

      console.log('Channel created/retrieved successfully');

      return channel;
    } catch (err) {
      console.error('Failed to create/get channel:', err);
      return null;
    }
  };

  // Listen for new messages and channel updates
  useEffect(() => {
    if (!client) return;

    const handleNewMessage = (event: Event) => {
      if (event.type === 'message.new') {
        // Refresh channels to update last message
        refreshChannels();
      }
    };

    const handleChannelUpdated = (event: Event) => {
      if (event.type === 'channel.updated') {
        refreshChannels();
      }
    };

    client.on('message.new', handleNewMessage);
    client.on('channel.updated', handleChannelUpdated);

    return () => {
      client.off('message.new', handleNewMessage);
      client.off('channel.updated', handleChannelUpdated);
    };
  }, [client]);

  const contextValue: ChatContextType = {
    client,
    user,
    isConnected,
    isLoading,
    error,
    channels,
    createOrGetChannel,
    refreshChannels,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export type { ChatContextType };