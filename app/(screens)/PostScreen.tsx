import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { fetchPostById, upvotePost, reportPost } from "../../utils/postApi";
import { fetchStoreById } from "../../utils/stores";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { likePost, unlikePost, isPostLiked } from "../../utils/posts";

const { width } = Dimensions.get("window");

export default function PostScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getToken, userId } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Helper to format date
  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken({ template: "seller_app" });
        const postData = await fetchPostById(id as string, token);
        setPost(postData);
        // Fetch store info
        if (postData.storeId) {
          const storeData = await fetchStoreById(postData.storeId, token);
          setStore(storeData);
        }
        // Check if liked
        if (id) {
          try {
            const likedRes = await isPostLiked(id as string, token);
            setLiked(!!likedRes);
          } catch (e) {
            setLiked(false);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadPost();
  }, [id]);

  const handleUpvote = async () => {
    if (!post || upvoting) return;
    setUpvoting(true);
    try {
      const token = await getToken({ template: "seller_app" });
      await upvotePost(post.id, token);
      setPost({ ...post, upvotes: (post.upvotes || 0) + 1 });
    } catch (err: any) {
      setError(err.message || "Failed to upvote");
    } finally {
      setUpvoting(false);
    }
  };

  const handleReport = async () => {
    if (!userId || !post) {
      alert("You must be logged in to report a post.");
      return;
    }
    if (!reportReason) {
      alert("Please select a reason for reporting.");
      return;
    }
    setReportLoading(true);
    try {
      const token = await getToken({ template: "seller_app" });
      await reportPost(post.id, userId, reportReason, reportDescription, token);
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

  const handleLikeToggle = async () => {
    if (!post || likeLoading) return;
    setLikeLoading(true);
    try {
      const token = await getToken({ template: "seller_app" });
      if (liked) {
        await unlikePost(post.id, token);
        setLiked(false);
        setPost({
          ...post,
          interactions: Math.max((post.interactions || 1) - 1, 0),
        });
      } else {
        await likePost(post.id, token);
        setLiked(true);
        setPost({ ...post, interactions: (post.interactions || 0) + 1 });
      }
    } catch (err: any) {
      setError(err.message || "Failed to update like");
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
    // Minimal wireframe loading screen for PostScreen
    return (
      <View style={styles.loadingWireframeContainer}>
        <View style={styles.wfImage} />
        <View style={styles.wfContent}>
          <View style={styles.wfTitle} />
          <View style={styles.wfSection} />
          <View style={styles.wfSection} />
        </View>
      </View>
    );
  }
  if (error || !post) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#d32f2f", fontSize: 16 }}>
          {error || "Post not found."}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: "#fff" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Huggle</Text>
        <TouchableOpacity onPress={() => setShowReportModal(true)}>
          <MaterialIcons name="flag" size={28} color="#d32f2f" />
        </TouchableOpacity>
      </View>
      {/* Main scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Image carousel with swipe, padding, gaps, and centering */}
        <View style={styles.imageBox}>
          {post.imageUrls && post.imageUrls.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: "center",
              }}
              onScroll={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / (width * 0.7 + 16)
                );
                setCurrentImageIdx(idx);
              }}
              scrollEventThrottle={16}
              style={{ width: "100%", height: "100%" }}
            >
              {post.imageUrls.map((img: string, idx: number) => (
                <View
                  key={idx}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: width,
                  }}
                >
                  <Image
                    source={{ uri: img }}
                    style={{
                      width: "90%",
                      height: "90%",
                      borderRadius: 18,
                      backgroundColor: "#eee",
                    }}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          )}
          <View style={styles.imageIndexBox}>
            <Text style={styles.imageIndexText}>
              {post.imageUrls
                ? `${currentImageIdx + 1}/${post.imageUrls.length}`
                : "1/1"}
            </Text>
          </View>
        </View>
        {/* Upvote, date, store */}
        <View style={styles.infoRow}>
          <TouchableOpacity
            style={styles.upvoteRow}
            onPress={handleLikeToggle}
            disabled={likeLoading}
          >
            <MaterialIcons
              name="favorite"
              size={22}
              color={liked ? "#FF6B6B" : "#ccc"}
            />
            <Text style={styles.upvoteText}>{post.interactions || 0}</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate(post.createdAt)}</Text>
        </View>
        <TouchableOpacity
          style={styles.storeRow}
          onPress={() =>
            router.push({
              pathname: "/(screens)/StoreHomepageScreen",
              params: { id: post.storeId },
            })
          }
        >
          {store?.storeImageUrl ? (
            <Image
              source={{ uri: store.storeImageUrl }}
              style={styles.storeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.storeCircle} />
          )}
          <Text style={styles.storeText}>
            {store?.name || post.storeId || "Store"}
          </Text>
        </TouchableOpacity>
        {/* Caption */}
        <View style={styles.captionBox}>
          <Text style={styles.captionText}>{post.content}</Text>
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
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Report Post</Text>
            <Text style={{ marginBottom: 8 }}>Reason</Text>
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              {["Inappropriate", "Fraud", "Spam", "Other"].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={{
                    backgroundColor:
                      reportReason === reason ? "#F9A620" : "#eee",
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                  onPress={() => setReportReason(reason)}
                >
                  <Text
                    style={{ color: reportReason === reason ? "#fff" : "#333" }}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ marginBottom: 8 }}>Description (optional)</Text>
            <TextInput
              style={{
                minHeight: 60,
                padding: 8,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                marginBottom: 16,
              }}
              multiline
              numberOfLines={3}
              value={reportDescription}
              onChangeText={setReportDescription}
              placeholder="Describe the issue..."
            />
            <TouchableOpacity
              style={{
                backgroundColor: reportLoading ? "#ccc" : "#F9A620",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={handleReport}
              disabled={reportLoading}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {reportLoading ? "Submitting..." : "Submit Report"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 12, alignItems: "center" }}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={{ color: "#F9A620" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 24,
    paddingHorizontal: 0,
    justifyContent: "flex-start",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  image: {},
  imageIndexBox: {
    position: "absolute",
    top: 12,
    right: 18,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  imageIndexText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  upvoteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  upvoteText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 6,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  storeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eee",
    marginRight: 14,
  },
  storeImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: "#eee",
  },
  storeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  captionBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    margin: 20,
    padding: 18,
    minHeight: 120,
    justifyContent: "center",
  },
  captionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backBtn: {
    backgroundColor: "#548C2F",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  // Wireframe loading styles
  loadingWireframeContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 24,
  },
  wfImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
  },
  wfContent: {
    width: "92%",
    alignSelf: "center",
  },
  wfTitle: {
    width: "60%",
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginBottom: 16,
  },
  wfSection: {
    width: "100%",
    height: 18,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginBottom: 10,
  },
});
