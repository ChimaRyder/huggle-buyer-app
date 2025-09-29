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
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from '@/constants/theme';
import { usePostContext } from '@/context/PostContext';
import { useAuth } from '@clerk/clerk-expo';
import { submitPostReport } from '@/utils/reports';
import type { BackendPost } from '@/types/BackendModels';

const { width } = Dimensions.get("window");

interface PostScreenProps {}

const PostScreen: React.FC<PostScreenProps> = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getToken, userId } = useAuth();
  const { 
    currentPost, 
    isFetchingPost, 
    postError, 
    fetchPostById, 
    toggleLike 
  } = usePostContext();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Helper to format date
  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${diffWeeks}w`;
  };

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPostById(id);
    }
  }, [id, fetchPostById]);

  const handleLikeToggle = async () => {
    if (!currentPost) return;
    
    try {
      await toggleLike(currentPost.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };


  const handleReport = async () => {
    if (!reportReason) {
      alert("Please select a reason for reporting.");
      return;
    }
    
    if (!currentPost || !userId) {
      alert("Unable to submit report. Please try again.");
      return;
    }
    
    setReportLoading(true);
    try {
      const token = await getToken({ template: "seller_app" });
      
      await submitPostReport(
        userId,
        currentPost.id,
        reportReason,
        reportDescription,
        token
      );
      
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
    if (currentPost?.storeId) {
      router.push({
        pathname: "/(screens)/store/StoreHomepageScreen",
        params: { id: currentPost.storeId },
      });
    }
  };

  if (isFetchingPost) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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

  if (postError || !currentPost) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>
            {postError || "Post not found."}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
          {currentPost.imageUrls && currentPost.imageUrls.length > 0 && (
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
              {currentPost.imageUrls.map((img: string, idx: number) => (
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
          {currentPost.imageUrls && currentPost.imageUrls.length > 1 && (
            <View style={styles.imageIndicator}>
              {currentPost.imageUrls.map((_, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.indicatorDot,
                    { 
                      backgroundColor: idx === currentImageIdx 
                        ? colors.text.primaryInverted 
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
          <View style={styles.likeSection}>
            <Text style={styles.likesText}>
              {currentPost.likeCount} {currentPost.likeCount === 1 ? 'like' : 'likes'}
            </Text>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLikeToggle}
            >
              <Ionicons
                name={currentPost.isLiked ? "heart" : "heart-outline"}
                size={28}
                color={currentPost.isLiked ? colors.primary.main : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Caption */}
        <View style={styles.contentContainer}>
          <Text style={styles.caption}>
            <TouchableOpacity onPress={handleStorePress}>
              <Text style={styles.storeNameInCaption}>{currentPost.storeName || 'Store'}</Text>
            </TouchableOpacity>
            {currentPost.content ? ` ${currentPost.content}` : ''}
          </Text>
          <Text style={styles.timestamp}>{formatDate(currentPost.createdAt)}</Text>
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
                        reportReason === reason ? colors.primary.main : colors.background.secondary,
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
                  backgroundColor: reportLoading ? colors.text.secondary : colors.primary.main
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
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
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
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  likeButton: {
    alignSelf: 'flex-start',
  },
  likesText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  timestamp: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
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
    backgroundColor: colors.primary.main,
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
    backgroundColor: colors.background.tertiary,
    borderRadius: 16,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
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
    color: colors.primary.main,
    fontWeight: '600',
  },
});

export default PostScreen;