import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/constants/theme';

// Mock conversation data
const mockMessages = [
  {
    id: '1',
    text: "Hi there! Are you interested in the organic vegetables I have available today?",
    sender: 'seller',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    text: "Yes, I'd like to get some tomatoes and carrots. How much are they?",
    sender: 'buyer',
    timestamp: '10:32 AM',
  },
  {
    id: '3',
    text: "Tomatoes are $3/lb and carrots are $2/lb. They're all organic and freshly harvested this morning!",
    sender: 'seller',
    timestamp: '10:33 AM',
  },
  {
    id: '4',
    text: "That sounds great! I'll take 2 lbs of tomatoes and 3 lbs of carrots. When can I pick them up?",
    sender: 'buyer',
    timestamp: '10:35 AM',
  },
  {
    id: '5',
    text: "Your order is ready for pickup anytime today between 2-6 PM. Just let me know when you're on your way!",
    sender: 'seller',
    timestamp: '10:36 AM',
  },
  {
    id: '6',
    text: "Perfect! I'll be there around 4 PM.",
    sender: 'buyer',
    timestamp: '10:37 AM',
  },
];

const sellerInfo = {
  name: 'Green Garden Store',
  avatar: 'https://placehold.co/100x100/548C2F/FFFFFF?text=GGS',
};

export default function ChatDetailScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const renderMessage = ({ item }: { item: typeof mockMessages[0] }) => {
    const isSeller = item.sender === 'seller';
    
    return (
      <View style={[
        styles.messageContainer,
        isSeller ? styles.sellerMessageContainer : styles.buyerMessageContainer
      ]}>
        {isSeller && (
          <Image source={{ uri: sellerInfo.avatar }} style={styles.avatar} />
        )}
        
        <View style={[
          styles.messageBubble,
          isSeller ? styles.sellerBubble : styles.buyerBubble
        ]}>
          {!isSeller && (
            <Text style={styles.senderName}>
              {isSeller ? sellerInfo.name : 'You'}
            </Text>
          )}
          <Text style={[
            styles.messageText,
            isSeller ? styles.sellerText : styles.buyerText
          ]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  const sendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message to the backend
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.sellerInfo}>
          <Image source={{ uri: sellerInfo.avatar }} style={styles.headerAvatar} />
          <Text style={styles.sellerName}>{sellerInfo.name}</Text>
        </View>
        <MaterialIcons name="more-vert" size={24} color={colors.text.primary} />
      </View>
      
      <FlatList
        data={mockMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <MaterialIcons 
            name="send" 
            size={20} 
            color={message.trim() ? colors.white : colors.text.tertiary} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: spacing.sm,
  },
  sellerName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.text.primary,
  },
  messagesContainer: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
  },
  sellerMessageContainer: {
    justifyContent: 'flex-start',
  },
  buyerMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  sellerBubble: {
    backgroundColor: colors.background.tertiary,
    borderBottomLeftRadius: 4,
  },
  buyerBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  sellerText: {
    color: colors.text.primary,
  },
  buyerText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
});