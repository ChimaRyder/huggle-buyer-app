# Chat Feature Setup - Stream Chat Integration

This document explains how to set up and use the Stream Chat integration in the Huggle Buyer App.

## Overview

The chat feature allows customers to message stores directly about products, orders, and general inquiries. It's built using Stream Chat for reliable real-time messaging with proper software architecture.

## File Structure

```
📁 context/
  └── ChatContext.tsx          # Stream Chat context provider
📁 utils/
  └── chatUtils.ts             # Chat utility functions
📁 app/
  └── (tabs)/
      └── ChatListScreen.tsx   # List of chat conversations
  └── (screens)/
      └── chat/
          └── [id].tsx         # Individual chat conversation
📁 constants/
  └── config.ts               # Stream Chat API configuration
```

## Setup Instructions

### 1. Get Stream Chat API Key

1. Sign up at [getstream.io](https://getstream.io)
2. Create a new app for chat
3. Get your API key from the dashboard

### 2. Configure API Key

Add your Stream Chat API key in one of these ways:

**Option A: Environment Variable (Recommended)**
```bash
# In your .env file
EXPO_PUBLIC_STREAM_API_KEY=your_stream_api_key_here
```

**Option B: Update config directly**
```typescript
// In constants/config.ts
streamChat: {
  apiKey: "your_actual_api_key_here",
}
```

### 3. Provider Setup

The ChatProvider is already integrated into the app layout at `/app/_layout.tsx`. It wraps the app with Stream Chat functionality.

## Features

### ChatListScreen
- **Location**: `app/(tabs)/ChatListScreen.tsx`
- **Features**:
  - Display list of chat conversations with stores
  - Search functionality
  - Real-time unread count
  - Pull-to-refresh
  - Loading and error states
  - Online status indicators

### Individual Chat Screen
- **Location**: `app/(screens)/chat/[id].tsx`
- **Features**:
  - Real-time messaging
  - Message timestamps
  - Message status indicators
  - Keyboard handling
  - Auto-scroll to new messages
  - Loading states

### Context & State Management
- **ChatContext**: Manages Stream Chat client, user authentication, and channels
- **Automatic channel creation**: Creates channels between customers and stores
- **Real-time updates**: Listens for new messages and channel updates

## Usage

### Starting a Chat with a Store

```typescript
// Example: Start chat from a store page
import { useChat } from '@/context/ChatContext';
import { useRouter } from 'expo-router';

const { createOrGetChannel } = useChat();
const router = useRouter();

const handleChatWithStore = async (storeId: string, storeName: string) => {
  const channel = await createOrGetChannel(storeId, storeName);
  if (channel) {
    router.push(`/(screens)/chat/${storeId}`);
  }
};
```

### Accessing Chat Context

```typescript
import { useChat } from '@/context/ChatContext';

const MyComponent = () => {
  const {
    client,        // Stream Chat client instance
    user,          // Current user
    isConnected,   // Connection status
    isLoading,     // Loading state
    error,         // Error state
    channels,      // List of channels
    createOrGetChannel, // Function to create/get channel
    refreshChannels     // Function to refresh channels
  } = useChat();

  // Your component logic
};
```

## Architecture

### Channel Naming Convention
- Channel Type: `messaging`
- Channel ID: `customer-{customerId}-store-{storeId}`
- Members: `[customerId, store-{storeId}]`

### User ID Format
- Customer: Uses Clerk user ID directly
- Store: `store-{storeId}`

### Message Flow
1. Customer sends message via Stream Chat
2. Real-time delivery to store users
3. Automatic channel updates
4. Unread count management

## Development vs Production

### Development
- Uses `client.devToken()` for easy testing
- API key can be hardcoded (not recommended for production)

### Production
- Implement backend token generation
- Use environment variables for API key
- Implement proper user authentication flow
- Set up webhooks for advanced features

## Store Integration

To enable stores to receive and respond to messages, you'll need to:

1. **Store App Integration**: Integrate Stream Chat in your store app
2. **User Management**: Create store users with ID format `store-{storeId}`
3. **Permissions**: Configure channel permissions for stores
4. **Notifications**: Set up push notifications for new messages

## Customization

### Styling
All components use the existing theme system from `@/constants/theme`. You can customize:
- Colors
- Typography
- Spacing
- Component styles

### Message Types
Currently supports text messages. You can extend to support:
- Images
- Files
- Location sharing
- Order references

## Troubleshooting

### Common Issues

**1. "API key not found" error**
- Ensure your Stream API key is correctly set in the config
- Check environment variables are properly loaded

**2. Connection issues**
- Verify internet connection
- Check Stream Chat dashboard for API status
- Ensure user authentication is working

**3. Messages not appearing**
- Check if channels are properly created
- Verify user permissions
- Look for JavaScript errors in console

### Debug Mode
Enable debug logging by adding to your ChatContext:

```typescript
// In ChatContext.tsx
const chatClient = StreamChat.getInstance(config.streamChat.apiKey);
chatClient.setLogLevel('debug'); // Add this line
```

## Next Steps

1. **Backend Integration**: Implement server-side token generation
2. **Push Notifications**: Set up notifications for new messages
3. **File Sharing**: Add support for images and files
4. **Message Reactions**: Add reaction support
5. **Typing Indicators**: Show when users are typing
6. **Message Search**: Implement message search functionality

## Support

For Stream Chat specific issues, refer to:
- [Stream Chat React Native Documentation](https://getstream.io/chat/sdk/react-native/)
- [Stream Chat API Reference](https://getstream.io/chat/docs/react-native/)

For app-specific issues, check the implementation in the context and components files.