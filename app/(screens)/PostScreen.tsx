/**
 * Posts Screen - Instagram-style post viewing
 * Displays swipeable images, store details, caption, and interaction options
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { MockPostService, MockStoreService } from "../../data/mockServices";
import { colors, spacing, typography } from "@/constants/theme";

const { width } = Dimensions.get("window");

interface PostScreenProps {}

const PostScreen: React.FC<PostScreenProps> = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  // Helper to format date
  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get post from mock data
        const allPosts = await MockPostService.getAllPosts();
        const postData = allPosts.find(p => p.id === id);
        
        if (!postData) {
          throw new Error('Post not found');
        }
        
        setPost(postData);
        setLiked(Math.random() > 0.5); // Random liked state for demo
        setLikeCount(postData.likes || 0);
        
        // Fetch store info
        if (postData.storeId) {
          const storeData = await MockStoreService.getStoreById(postData.storeId);
          setStore(storeData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadPost();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!post) return;
    
    // Toggle like state immediately for better UX
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    
    // In a real app, would send request to backend
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err: any) {
      // Revert on error
      setLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
      setError(err.message || "Failed to update like");
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      alert("Please select a reason for reporting.");
      return;
    }
    
    setReportLoading(true);
    try {
      // Simulate report submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
      alert("Report submitted. Thank you for helping keep Huggle safe.");
    } catch (err: any) {
      alert(err.message || "Failed to submit report.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleStorePress = () => {
    if (post?.storeId) {
      router.push({
        pathname: "/(screens)/StoreHomepageScreen",
        params: { id: post.storeId },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingImage} />
          <View style={styles.loadingContent}>
            <View style={styles.loadingLine} />
            <View style={[styles.loadingLine, { width: '60%' }]} />
            <View style={[styles.loadingLine, { width: '80%' }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>
            {error || "Post not found."}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity onPress={() => setShowReportModal(true)}>
          <Ionicons name="flag-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
      
      {/* Main scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image carousel */}
        <View style={styles.imageContainer}>
          {post.images && post.images.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / width
                );
                setCurrentImageIdx(idx);
              }}
              scrollEventThrottle={16}
              style={styles.imageScrollView}
            >
              {post.images.map((img: string, idx: number) => (
                <Image
                  key={idx}
                  source={{ uri: img }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}
          
          {/* Image indicator */}
          {post.images && post.images.length > 1 && (
            <View style={styles.imageIndicator}>
              {post.images.map((_, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.indicatorDot,
                    { 
                      backgroundColor: idx === currentImageIdx 
                        ? colors.text.inverse 
                        : 'rgba(255,255,255,0.5)' 
                    }
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Post actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLikeToggle}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={28}
              color={liked ? colors.error : colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        
        {/* Like count */}
        {likeCount > 0 && (
          <View style={styles.likesContainer}>
            <Text style={styles.likesText}>
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </Text>
          </View>
        )}
        
        {/* Store info and caption */}
        <View style={styles.contentContainer}>
          <TouchableOpacity style={styles.storeInfo} onPress={handleStorePress}>
            <Image
              source={{ uri: post.storeAvatar }}
              style={styles.storeAvatar}
              resizeMode="cover"
            />
            <Text style={styles.storeName}>{post.storeName}</Text>
            <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
          </TouchableOpacity>
          
          <Text style={styles.caption}>
            <Text style={styles.storeNameInCaption}>{post.storeName}</Text>
            {' '}{post.caption}
          </Text>
        </View>
      </ScrollView>
      
      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Report Post</Text>
            
            <Text style={styles.modalLabel}>Reason</Text>
            <View style={styles.reasonContainer}>
              {["Inappropriate", "Fraud", "Spam", "Other"].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    {
                      backgroundColor:
                        reportReason === reason ? colors.primary : colors.background.secondary,
                    }
                  ]}
                  onPress={() => setReportReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      {
                        color: reportReason === reason ? colors.text.inverse : colors.text.primary
                      }
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.modalLabel}>Description (optional)</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={3}
              value={reportDescription}
              onChangeText={setReportDescription}
              placeholder="Describe the issue..."
              placeholderTextColor={colors.text.secondary}
            />
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: reportLoading ? colors.text.secondary : colors.primary
                }
              ]}
              onPress={handleReport}
              disabled={reportLoading}
            >
              <Text style={styles.submitButtonText}>
                {reportLoading ? "Submitting..." : "Submit Report"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  imageContainer: {
    width: width,
    height: width,
    position: 'relative',
  },
  imageScrollView: {
    width: '100%',
    height: '100%',
  },
  postImage: {
    width: width,
    height: width,
    backgroundColor: colors.background.secondary,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  likeButton: {
    alignSelf: 'flex-start',
  },
  likesContainer: {
    paddingHorizontal: spacing.lg,
  },
  likesText: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text.primary,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  storeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  storeName: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  caption: {
    ...typography.body2,
    color: colors.text.primary,
    lineHeight: 20,
  },
  storeNameInCaption: {
    fontWeight: '600',
  },
  // Loading states
  loadingContainer: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  loadingImage: {
    width: width,
    height: width,
    backgroundColor: colors.background.secondary,
  },
  loadingContent: {
    padding: spacing.lg,
  },
  loadingLine: {
    height: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  backButtonText: {
    ...typography.body2,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  modalLabel: {
    ...typography.body2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  reasonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  reasonButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  reasonText: {
    ...typography.caption,
    fontWeight: '600',
  },
  textInput: {
    minHeight: 80,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    marginBottom: spacing.lg,
    ...typography.body2,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submitButtonText: {
    ...typography.body2,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default PostScreen;