import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useApi } from './ApiContext';
import { API_ENDPOINTS } from '@/constants/config';
import type { BackendPost, PostsResponse, PostResponse } from '@/types/BackendModels';
import type { PaginatedResponse } from '@/types/common';

interface PostContextType {
  // All Posts (Public Feed)
  allPosts: BackendPost[];
  isFetchingPosts: boolean;
  postsError: string | null;
  fetchPosts: (page?: number, pageSize?: number) => Promise<void>;
  refreshPosts: () => Promise<void>;
  
  // Personal Feed (Following stores)
  feedPosts: BackendPost[];
  isFetchingFeed: boolean;
  feedError: string | null;
  fetchFeed: (page?: number, pageSize?: number) => Promise<void>;
  refreshFeed: () => Promise<void>;
  
  // Single Post
  currentPost: BackendPost | null;
  isFetchingPost: boolean;
  postError: string | null;
  fetchPostById: (id: string) => Promise<void>;
  clearCurrentPost: () => void;
  
  // Store Posts
  storePosts: BackendPost[];
  isFetchingStorePosts: boolean;
  storePostsError: string | null;
  fetchPostsByStore: (storeId: string, page?: number, pageSize?: number) => Promise<void>;
  clearStorePosts: () => void;
  
  // Post Interactions
  toggleLike: (postId: string) => Promise<boolean>;
  
  // Pagination
  hasMorePosts: boolean;
  hasMoreFeed: boolean;
  hasMoreStorePosts: boolean;
  currentPage: number;
  feedPage: number;
  storePostsPage: number;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

interface PostProviderProps {
  children: ReactNode;
}

export function PostProvider({ children }: PostProviderProps) {
  // All Posts state
  const [allPosts, setAllPosts] = useState<BackendPost[]>([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Feed Posts state
  const [feedPosts, setFeedPosts] = useState<BackendPost[]>([]);
  const [isFetchingFeed, setIsFetchingFeed] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [feedPage, setFeedPage] = useState(1);
  
  // Single Post state
  const [currentPost, setCurrentPost] = useState<BackendPost | null>(null);
  const [isFetchingPost, setIsFetchingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  
  // Store Posts state
  const [storePosts, setStorePosts] = useState<BackendPost[]>([]);
  const [isFetchingStorePosts, setIsFetchingStorePosts] = useState(false);
  const [storePostsError, setStorePostsError] = useState<string | null>(null);
  const [hasMoreStorePosts, setHasMoreStorePosts] = useState(true);
  const [storePostsPage, setStorePostsPage] = useState(1);
  
  const { client } = useApi();

  const fetchPosts = useCallback(async (page: number = 1, pageSize: number = 20): Promise<void> => {
    setIsFetchingPosts(true);
    setPostsError(null);
    
    try {
      console.log('🔍 PostContext: Starting fetchPosts with page:', page, 'pageSize:', pageSize);
      
      const endpoint = `${API_ENDPOINTS.posts.list}?page=${page}&pageSize=${pageSize}`;
      const response = await client.get<any>(endpoint);
      console.log('🔍 PostContext: Raw API response:', response);

      if (response.success && response.data) {
        console.log('✅ PostContext: Fetch posts response:', response.data);
        
        let postsArray: BackendPost[] = [];
        let totalCount = 0;
        
        // Handle paginated response structure
        if (response.data.data && Array.isArray(response.data.data)) {
          postsArray = response.data.data;
          totalCount = response.data.pagination?.totalCount || response.data.data.length;
        } else if (Array.isArray(response.data)) {
          postsArray = response.data;
          totalCount = response.data.length;
        }
        
        console.log('🔍 PostContext: Processed posts array:', postsArray.length, 'items');
        
        if (page === 1) {
          setAllPosts(postsArray);
          setCurrentPage(1);
        } else {
          setAllPosts(prev => [...prev, ...postsArray]);
          setCurrentPage(page);
        }
        
        // Check if there are more posts
        const totalPages = response.data.pagination?.totalPages || Math.ceil(totalCount / pageSize);
        setHasMorePosts(page < totalPages);
        
        console.log('✅ PostContext: Set allPosts to:', page === 1 ? postsArray.length : 'prev +', postsArray.length, 'items');
      } else {
        console.warn('❌ PostContext: Failed to fetch posts - success:', response.success, 'error:', response.error);
        setPostsError(response.error || 'Failed to fetch posts');
        if (page === 1) {
          setAllPosts([]);
        }
      }
    } catch (error) {
      console.error('❌ PostContext: Exception in fetchPosts:', error);
      setPostsError(error instanceof Error ? error.message : 'Unknown error occurred');
      if (page === 1) {
        setAllPosts([]);
      }
    } finally {
      setIsFetchingPosts(false);
      console.log('🔍 PostContext: fetchPosts finished');
    }
  }, [client]);

  const refreshPosts = useCallback(async (): Promise<void> => {
    await fetchPosts(1, 20);
  }, [fetchPosts]);

  const fetchFeed = useCallback(async (page: number = 1, pageSize: number = 20): Promise<void> => {
    setIsFetchingFeed(true);
    setFeedError(null);
    
    try {
      console.log('🔍 PostContext: Starting fetchFeed with page:', page, 'pageSize:', pageSize);
      
      const endpoint = `${API_ENDPOINTS.posts.feed}?page=${page}&pageSize=${pageSize}`;
      const response = await client.get<BackendPost[]>(endpoint);
      console.log('🔍 PostContext: Raw API response for feed:', response);

      if (response.success && response.data) {
        console.log('✅ PostContext: Fetch feed response:', response.data);
        
        let feedArray: BackendPost[] = [];
        
        if (Array.isArray(response.data)) {
          feedArray = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          feedArray = response.data.data;
        }
        
        console.log('🔍 PostContext: Processed feed array:', feedArray.length, 'items');
        
        if (page === 1) {
          setFeedPosts(feedArray);
          setFeedPage(1);
        } else {
          setFeedPosts(prev => [...prev, ...feedArray]);
          setFeedPage(page);
        }
        
        // For feed, we might not get pagination info, so assume more if we got full page
        setHasMoreFeed(feedArray.length === pageSize);
        
        console.log('✅ PostContext: Set feedPosts to:', page === 1 ? feedArray.length : 'prev +', feedArray.length, 'items');
      } else {
        console.warn('❌ PostContext: Failed to fetch feed - success:', response.success, 'error:', response.error);
        setFeedError(response.error || 'Failed to fetch feed');
        if (page === 1) {
          setFeedPosts([]);
        }
      }
    } catch (error) {
      console.error('❌ PostContext: Exception in fetchFeed:', error);
      setFeedError(error instanceof Error ? error.message : 'Unknown error occurred');
      if (page === 1) {
        setFeedPosts([]);
      }
    } finally {
      setIsFetchingFeed(false);
      console.log('🔍 PostContext: fetchFeed finished');
    }
  }, [client]);

  const refreshFeed = useCallback(async (): Promise<void> => {
    await fetchFeed(1, 20);
  }, [fetchFeed]);

  const fetchPostById = useCallback(async (id: string): Promise<void> => {
    setIsFetchingPost(true);
    setPostError(null);
    
    try {
      console.log('🔍 PostContext: Starting fetchPostById for id:', id);
      const response = await client.get<BackendPost>(API_ENDPOINTS.posts.byId(id));
      console.log('🔍 PostContext: Raw API response for post:', response);

      if (response.success && response.data) {
        console.log('✅ PostContext: Fetch post by ID response:', response.data);
        
        let postData: BackendPost;
        if ((response.data as any).data && typeof (response.data as any).data === 'object') {
          console.log('🔍 PostContext: Found nested data structure, extracting post');
          postData = (response.data as any).data;
        } else {
          postData = response.data as BackendPost;
        }
        
        console.log('🔍 PostContext: Processed post data:', postData);
        setCurrentPost(postData);
        
        // Also update the post in other arrays if it exists to keep them in sync
        const syncPostData = (posts: BackendPost[]) => 
          posts.map(post => 
            post.id === postData.id 
              ? { ...post, isLiked: postData.isLiked, likeCount: postData.likeCount }
              : post
          );
        
        setAllPosts(syncPostData);
        setFeedPosts(syncPostData);
        setStorePosts(syncPostData);
        
        console.log('✅ PostContext: Set currentPost and synced with other arrays:', postData);
      } else {
        console.warn('❌ PostContext: Failed to fetch post by ID - success:', response.success, 'error:', response.error);
        setPostError(response.error || 'Failed to fetch post');
        setCurrentPost(null);
      }
    } catch (error) {
      console.error('❌ PostContext: Exception in fetchPostById:', error);
      setPostError(error instanceof Error ? error.message : 'Unknown error occurred');
      setCurrentPost(null);
    } finally {
      setIsFetchingPost(false);
      console.log('🔍 PostContext: fetchPostById finished');
    }
  }, [client]);

  const clearCurrentPost = useCallback((): void => {
    setCurrentPost(null);
    setPostError(null);
  }, []);

  const fetchPostsByStore = useCallback(async (storeId: string, page: number = 1, pageSize: number = 20): Promise<void> => {
    setIsFetchingStorePosts(true);
    setStorePostsError(null);
    
    try {
      console.log('🔍 PostContext: Starting fetchPostsByStore for storeId:', storeId, 'page:', page);
      
      const endpoint = `${API_ENDPOINTS.posts.byStore(storeId)}?page=${page}&pageSize=${pageSize}`;
      const response = await client.get<any>(endpoint);
      console.log('🔍 PostContext: Raw API response for store posts:', response);

      if (response.success && response.data) {
        console.log('✅ PostContext: Fetch store posts response:', response.data);
        
        let postsArray: BackendPost[] = [];
        let totalCount = 0;
        
        if (response.data.data && Array.isArray(response.data.data)) {
          postsArray = response.data.data;
          totalCount = response.data.pagination?.totalCount || response.data.data.length;
        } else if (Array.isArray(response.data)) {
          postsArray = response.data;
          totalCount = response.data.length;
        }
        
        console.log('🔍 PostContext: Processed store posts array:', postsArray.length, 'items');
        
        if (page === 1) {
          setStorePosts(postsArray);
          setStorePostsPage(1);
        } else {
          setStorePosts(prev => [...prev, ...postsArray]);
          setStorePostsPage(page);
        }
        
        const totalPages = response.data.pagination?.totalPages || Math.ceil(totalCount / pageSize);
        setHasMoreStorePosts(page < totalPages);
        
        console.log('✅ PostContext: Set storePosts to:', page === 1 ? postsArray.length : 'prev +', postsArray.length, 'items');
      } else {
        console.warn('❌ PostContext: Failed to fetch store posts - success:', response.success, 'error:', response.error);
        setStorePostsError(response.error || 'Failed to fetch store posts');
        if (page === 1) {
          setStorePosts([]);
        }
      }
    } catch (error) {
      console.error('❌ PostContext: Exception in fetchPostsByStore:', error);
      setStorePostsError(error instanceof Error ? error.message : 'Unknown error occurred');
      if (page === 1) {
        setStorePosts([]);
      }
    } finally {
      setIsFetchingStorePosts(false);
      console.log('🔍 PostContext: fetchPostsByStore finished');
    }
  }, [client]);

  const clearStorePosts = useCallback((): void => {
    setStorePosts([]);
    setStorePostsError(null);
    setStorePostsPage(1);
    setHasMoreStorePosts(true);
  }, []);

  const toggleLike = useCallback(async (postId: string): Promise<boolean> => {
    try {
      console.log('🔍 PostContext: Toggling like for post:', postId);
      
      // Find the post in our state to check current like status
      // Check currentPost first since it's the most up-to-date on PostScreen
      let foundPost = (currentPost?.id === postId ? currentPost : null) ||
                     allPosts.find(p => p.id === postId) || 
                     feedPosts.find(p => p.id === postId) || 
                     storePosts.find(p => p.id === postId);
      
      if (!foundPost) {
        console.warn('❌ PostContext: Post not found in local state:', postId);
        return false;
      }
      
      const wasLiked = foundPost.isLiked;
      const method = wasLiked ? 'DELETE' : 'POST';
      
      // Optimistically update the UI
      const updatePostLike = (posts: BackendPost[]) => 
        posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !wasLiked, 
                likeCount: wasLiked ? post.likeCount - 1 : post.likeCount + 1 
              }
            : post
        );
      
      setAllPosts(updatePostLike);
      setFeedPosts(updatePostLike);
      setStorePosts(updatePostLike);
      // Also update currentPost if it matches
      setCurrentPost(prev => prev && prev.id === postId ? {
        ...prev,
        isLiked: !wasLiked,
        likeCount: wasLiked ? prev.likeCount - 1 : prev.likeCount + 1
      } : prev);
      
      // Make API call
      const response = await client[method.toLowerCase() as 'post' | 'delete'](API_ENDPOINTS.posts.like(postId));
      
      if (response.success) {
        console.log('✅ PostContext: Like toggled successfully for post:', postId);
        return !wasLiked;
      } else {
        console.warn('❌ PostContext: Failed to toggle like:', response.error);
        
        // WORKAROUND: Check if error is "already liked" - this means backend is inconsistent
        if (response.error?.includes('already liked') && !wasLiked) {
          console.log('🔧 PostContext: WORKAROUND - Backend says already liked but frontend shows not liked');
          console.log('🔧 PostContext: Keeping optimistic update and treating as success');
          return true; // Keep the optimistic update
        }
        
        if (response.error?.includes('Post not found') && wasLiked) {
          console.log('🔧 PostContext: WORKAROUND - Backend says not found but trying to unlike');
          console.log('🔧 PostContext: Keeping optimistic update and treating as success');
          return false; // Keep the optimistic update
        }
        
        // For other errors, revert optimistic update
        const revertPostLike = (posts: BackendPost[]) => 
          posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  isLiked: wasLiked, 
                  likeCount: wasLiked ? post.likeCount + 1 : post.likeCount - 1 
                }
              : post
          );
        
        setAllPosts(revertPostLike);
        setFeedPosts(revertPostLike);
        setStorePosts(revertPostLike);
        // Also revert currentPost if it matches
        setCurrentPost(prev => prev && prev.id === postId ? {
          ...prev,
          isLiked: wasLiked,
          likeCount: wasLiked ? prev.likeCount + 1 : prev.likeCount - 1
        } : prev);
        
        return wasLiked;
      }
    } catch (error) {
      console.error('❌ PostContext: Exception in toggleLike:', error);
      return false;
    }
  }, [client, allPosts, feedPosts, storePosts, currentPost]);

  const contextValue: PostContextType = {
    // All Posts
    allPosts,
    isFetchingPosts,
    postsError,
    fetchPosts,
    refreshPosts,
    
    // Feed
    feedPosts,
    isFetchingFeed,
    feedError,
    fetchFeed,
    refreshFeed,
    
    // Single Post
    currentPost,
    isFetchingPost,
    postError,
    fetchPostById,
    clearCurrentPost,
    
    // Store Posts
    storePosts,
    isFetchingStorePosts,
    storePostsError,
    fetchPostsByStore,
    clearStorePosts,
    
    // Interactions
    toggleLike,
    
    // Pagination
    hasMorePosts,
    hasMoreFeed,
    hasMoreStorePosts,
    currentPage,
    feedPage,
    storePostsPage,
  };

  return (
    <PostContext.Provider value={contextValue}>
      {children}
    </PostContext.Provider>
  );
}

export function usePostContext(): PostContextType {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
}

export type { PostContextType };