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
import { LinearGradient } from 'expo-linear-gradient';
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

interface PostScreenProps { }

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
        {/* Post Header (Instagram style) */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.headerUser}
            onPress={handleStorePress}
          >
            <View style={styles.headerAvatarContainer}>
              <LinearGradient
                colors={[colors.primary.main + '20', colors.primary.main + '10']}
                style={styles.headerAvatar}
              >
                <Ionicons name="storefront" size={16} color={colors.primary.main} />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.headerStoreName}>{currentPost.storeName || 'Store'}</Text>
              <Text style={styles.headerLocation}>Suggested for you</Text>
            </View>
          </TouchableOpacity>
        </View>

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
            <Text
              style={styles.storeNameInCaption}
              onPress={handleStorePress}
            >
              {currentPost.storeName || 'Store'}
            </Text>
            {currentPost.content ? ` ${currentPost.content}` : ''}
          </Text>
          <Text style={styles.timestamp}>{formatDate(currentPost.createdAt)}</Text>
        </View>



      </ScrollView>

      {/* Report Modal - Improved UI/UX */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReportModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header with icon */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="flag" size={24} color={colors.error} />
              </View>
              <Text style={styles.modalTitle}>Report Post</Text>
              <Text style={styles.modalSubtitle}>Help us keep Huggle safe</Text>
            </View>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReportModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>

            <Text style={styles.modalLabel}>What's the issue?</Text>
            <View style={styles.reasonContainer}>
              {[
                { key: "Inappropriate", icon: "warning-outline" },
                { key: "Fraud", icon: "alert-circle-outline" },
                { key: "Spam", icon: "mail-outline" },
                { key: "Other", icon: "ellipsis-horizontal-outline" }
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.reasonButton,
                    reportReason === item.key && styles.reasonButtonActive,
                  ]}
                  onPress={() => setReportReason(item.key)}
                >
                  <Ionicons
                    name={reportReason === item.key ? "checkmark-circle" : item.icon as any}
                    size={18}
                    color={reportReason === item.key ? colors.text.inverse : colors.text.secondary}
                    style={styles.reasonIcon}
                  />
                  <Text
                    style={[
                      styles.reasonText,
                      reportReason === item.key && styles.reasonTextActive,
                    ]}
                  >
                    {item.key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Additional details (optional)</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={3}
              value={reportDescription}
              onChangeText={setReportDescription}
              placeholder="Tell us more about the issue..."
              placeholderTextColor={colors.text.tertiary}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                !reportReason && styles.submitButtonDisabled,
              ]}
              onPress={handleReport}
              disabled={reportLoading || !reportReason}
            >
              {reportLoading ? (
                <Text style={styles.submitButtonText}>Submitting...</Text>
              ) : (
                <View style={styles.submitButtonContent}>
                  <Ionicons name="send" size={18} color={colors.text.inverse} style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </View>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView >
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarContainer: {
    marginRight: spacing.sm,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStoreName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  headerLocation: {
    fontSize: 11,
    color: colors.text.tertiary,
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
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  timestamp: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  caption: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    lineHeight: 22,
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
    fontSize: typography.fontSizes.md,
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
    fontSize: typography.fontSizes.sm,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  // Modal styles - Improved
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  reasonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.primary,
  },
  reasonButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  reasonIcon: {
    marginRight: 6,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  reasonTextActive: {
    color: colors.text.inverse,
  },
  textInput: {
    minHeight: 100,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border.primary,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 15,
    color: colors.text.primary,
    textAlignVertical: 'top',
    backgroundColor: colors.background.secondary,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});

export default PostScreen;