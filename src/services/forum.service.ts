// src/services/forum.service.ts

import { getSupabaseClient } from '@/lib/supabase/client';

// Use the authenticated browser client
const getSupabase = () => getSupabaseClient();

// ==================== TYPES ====================

export type ReactionType = 'fire' | 'love' | 'clap' | 'mindblown' | 'sad' | 'laugh';
export type BadgeType = 'verified' | 'creator' | 'prophet' | 'og' | 'moderator' | 'apocaliptyx';
export type NotificationType = 'mention' | 'reply' | 'reaction' | 'award' | 'follow' | 'repost' | 'poll_ended' | 'story_view' | 'story_reaction' | 'badge_awarded' | 'thread_reply';

export interface ReactionCounts {
  fire: number;
  love: number;
  clap: number;
  mindblown: number;
  sad: number;
  laugh: number;
}

// ==================== POLL TYPES ====================

export interface ForumPoll {
  id: string;
  post_id: string;
  question: string;
  ends_at: string;
  multiple_choice: boolean;
  created_at: string;
  options: ForumPollOption[];
  total_votes: number;
  has_voted?: boolean;
  user_votes?: string[]; // option IDs voted by user
}

export interface ForumPollOption {
  id: string;
  poll_id: string;
  option_text: string;
  option_order: number;
  votes_count: number;
}

// ==================== AWARD TYPES ====================

export interface AwardType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  ap_cost: number;
  ap_reward: number;
}

export interface PostAward {
  id: string;
  post_id: string;
  award_type: AwardType;
  giver: {
    id: string;
    username: string;
    avatar_url: string;
  };
  message?: string;
  created_at: string;
}

// ==================== STORY TYPES ====================

export interface ForumStory {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'gif';
  background_color: string;
  text_color: string;
  font_style: string;
  views_count: number;
  expires_at: string;
  created_at: string;
  is_highlight: boolean;
  highlight_name?: string;
  // Joined
  user?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  has_viewed?: boolean;
}

export interface StoryHighlight {
  id: string;
  user_id: string;
  name: string;
  cover_url?: string;
  stories: ForumStory[];
}

// ==================== THREAD TYPES ====================

export interface ForumThread {
  id: string;
  user_id: string;
  title?: string;
  total_posts: number;
  created_at: string;
  updated_at: string;
  posts?: ForumPost[];
  user?: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

// ==================== NOTIFICATION TYPES ====================

export interface ForumNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_username?: string;
  actor_avatar?: string;
  post_id?: string;
  post_preview?: string;
  comment_id?: string;
  story_id?: string;
  content?: string;
  is_read: boolean;
  created_at: string;
}

// ==================== MENTION TYPES ====================

export interface MentionSuggestion {
  id: string;
  username: string;
  avatar_url: string;
  badges: BadgeType[];
}

// ==================== USER BADGE TYPES ====================

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  awarded_at: string;
  reason?: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string | null;
  status: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Social fields
  reactions_count?: ReactionCounts;
  bookmarks_count?: number;
  reposts_count?: number;
  shares_count?: number;
  has_media?: boolean;
  media_count?: number;
  is_repost?: boolean;
  original_post_id?: string | null;
  // Thread fields
  thread_id?: string | null;
  thread_position?: number | null;
  // GIF fields
  gif_url?: string | null;
  gif_width?: number;
  gif_height?: number;
  // Scoring fields (Reddit-style)
  hot_score?: number;
  rising_score?: number;
  controversy_score?: number;
  // User interaction state (set by UI)
  user_reactions?: ReactionType[];
  user_bookmarked?: boolean;
  user_reposted?: boolean;
  user_has_voted?: boolean;
  // Joined data
  author?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    level: number;
    badges?: BadgeType[];
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
  original_post?: ForumPost;
  media?: ForumMedia[];
  poll?: ForumPoll;
  awards?: PostAward[];
  thread?: ForumThread;
}

export interface ForumMedia {
  id: string;
  post_id: string;
  media_type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  alt_text?: string;
  sort_order: number;
}

export interface TrendingTag {
  tag: string;
  post_count: number;
  engagement_score: number;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  status: string;
  likes_count: number;
  parent_id: string | null;
  created_at: string;
  // Joined data
  author?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    level: number;
  };
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  posts_count: number;
  is_active: boolean;
  sort_order: number;
}

export interface CreatePostInput {
  title?: string;
  content: string;
  category_id?: string;
  tags?: string[];
  // GIF support
  gif_url?: string;
  gif_width?: number;
  gif_height?: number;
  // Poll support
  poll?: {
    question: string;
    options: string[];
    ends_in_hours?: number; // Default 24 hours
    multiple_choice?: boolean;
  };
  // Thread support
  thread_posts?: string[]; // Array of content for each thread post
}

export interface CreateStoryInput {
  content?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'gif';
  background_color?: string;
  text_color?: string;
}

export interface CreateCommentInput {
  post_id: string;
  content: string;
  parent_id?: string;
}

class ForumService {
  // ==================== HELPER: Enviar notificación ====================
  
  private async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    linkUrl: string,
    imageUrl?: string
  ): Promise<void> {
    try {
      await getSupabase()
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          link_url: linkUrl,
          image_url: imageUrl || null,
          is_read: false,
        } as never);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // ==================== POSTS ====================

  async getPosts(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    sortBy?: 'recent' | 'popular' | 'comments';
    tag?: string;
  }): Promise<ForumPost[]> {
    const { limit = 20, offset = 0, category, sortBy = 'recent', tag } = options || {};

    let query = getSupabase()
      .from('forum_posts')
      .select(`
        *,
        author:users!forum_posts_author_id_fkey(id, username, display_name, avatar_url, level),
        category:forum_categories(id, name, slug, icon),
        thread:forum_threads(id, title, total_posts, user_id)
      `)
      .eq('status', 'published');

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    // Ordenar
    switch (sortBy) {
      case 'popular':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'comments':
        query = query.order('comments_count', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('is_pinned', { ascending: false })
                     .order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    // Filtrar por tag si se especifica
    let posts = (data || []) as ForumPost[];
    if (tag) {
      posts = posts.filter(post => post.tags?.includes(tag));
    }

    return posts;
  }

  async getPostById(postId: string): Promise<ForumPost | null> {
    const { data, error } = await getSupabase()
      .from('forum_posts')
      .select(`
        *,
        author:users!forum_posts_author_id_fkey(id, username, display_name, avatar_url, level),
        category:forum_categories(id, name, slug, icon)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    // Incrementar vistas
    await getSupabase()
      .from('forum_posts')
      .update({ views_count: ((data as ForumPost).views_count || 0) + 1 } as never)
      .eq('id', postId);

    return data;
  }

  async incrementViewCount(postId: string): Promise<void> {
    try {
      const { data } = await getSupabase()
        .from('forum_posts')
        .select('views_count')
        .eq('id', postId)
        .single();

      if (data) {
        await getSupabase()
          .from('forum_posts')
          .update({ views_count: ((data as { views_count?: number }).views_count || 0) + 1 } as never)
          .eq('id', postId);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  async createPost(userId: string, input: CreatePostInput): Promise<ForumPost | null> {
    const { data, error } = await getSupabase()
      .from('forum_posts')
      .insert({
        title: input.title || '',
        content: input.content,
        author_id: userId,
        category_id: input.category_id || null,
        tags: input.tags || [],
        status: 'published',
        is_pinned: false,
        is_locked: false,
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
      } as never)
      .select(`
        *,
        author:users!forum_posts_author_id_fkey(id, username, display_name, avatar_url, level)
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return null;
    }

    return data;
  }

  async updatePost(postId: string, userId: string, updates: Partial<CreatePostInput>): Promise<boolean> {
    const { error } = await getSupabase()
      .from('forum_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', postId)
      .eq('author_id', userId);

    if (error) {
      console.error('Error updating post:', error);
      return false;
    }

    return true;
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    // Soft delete - cambiar status a deleted
    const { error } = await getSupabase()
      .from('forum_posts')
      .update({ status: 'deleted' } as never)
      .eq('id', postId)
      .eq('author_id', userId);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }

    return true;
  }

  async toggleLikePost(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    // Verificar si ya existe el like
    const { data: existingLike } = await getSupabase()
      .from('forum_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Quitar like
      await getSupabase()
        .from('forum_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // Decrementar contador
      const { data: post } = await getSupabase()
        .from('forum_posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      const newCount = Math.max(0, ((post as { likes_count?: number } | null)?.likes_count || 1) - 1);
      
      await getSupabase()
        .from('forum_posts')
        .update({ likes_count: newCount } as never)
        .eq('id', postId);

      return { liked: false, likesCount: newCount };
    } else {
      // Agregar like
      await getSupabase()
        .from('forum_post_likes')
        .insert({ post_id: postId, user_id: userId } as never);

      // Incrementar contador
      const { data: post } = await getSupabase()
        .from('forum_posts')
        .select('likes_count, author_id, title, content')
        .eq('id', postId)
        .single();

      const postData = post as { likes_count?: number; author_id?: string; title?: string; content?: string } | null;
      const newCount = (postData?.likes_count || 0) + 1;
      
      await getSupabase()
        .from('forum_posts')
        .update({ likes_count: newCount } as never)
        .eq('id', postId);

      // 🔔 NOTIFICACIÓN: Like en post (solo si no es el propio autor)
      if (postData && postData.author_id !== userId) {
        const { data: likerRaw } = await getSupabase()
          .from('users')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        const liker = likerRaw as { username?: string; avatar_url?: string } | null;
        if (liker) {
          const postTitle = postData.title || (postData as { content?: string }).content?.substring(0, 30) + '...';
          await this.sendNotification(
            postData.author_id!,
            'like_received',
            'Nuevo Like ❤️',
            `A @${liker.username} le gustó tu publicación "${postTitle}"`,
            `/foro`,
            liker.avatar_url
          );
        }
      }

      return { liked: true, likesCount: newCount };
    }
  }

  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    const { data } = await getSupabase()
      .from('forum_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    return !!data;
  }

  // ==================== COMMENTS ====================

  async getComments(postId: string): Promise<ForumComment[]> {
    const { data, error } = await getSupabase()
      .from('forum_comments')
      .select(`
        *,
        author:users!forum_comments_author_id_fkey(id, username, display_name, avatar_url, level)
      `)
      .eq('post_id', postId)
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data || [];
  }

  async createComment(userId: string, input: CreateCommentInput): Promise<ForumComment | null> {
    const { data, error } = await getSupabase()
      .from('forum_comments')
      .insert({
        post_id: input.post_id,
        author_id: userId,
        content: input.content,
        parent_id: input.parent_id || null,
        status: 'published',
        likes_count: 0,
      } as never)
      .select(`
        *,
        author:users!forum_comments_author_id_fkey(id, username, display_name, avatar_url, level)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return null;
    }

    // Incrementar contador de comentarios en el post
    await (getSupabase().rpc as any)('increment_comments_count', { post_id: input.post_id });

    // 🔔 NOTIFICACIÓN: Comentario en post
    const { data: postRaw } = await getSupabase()
      .from('forum_posts')
      .select('author_id, title, content')
      .eq('id', input.post_id)
      .single();

    const post = postRaw as { author_id?: string; title?: string; content?: string } | null;
    if (post && post.author_id !== userId) {
      const { data: commenterRaw } = await getSupabase()
        .from('users')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();

      const commenter = commenterRaw as { username?: string; avatar_url?: string } | null;
      if (commenter) {
        const postTitle = post.title || post.content?.substring(0, 30) + '...';
        await this.sendNotification(
          post.author_id!,
          'comment_received',
          'Nuevo Comentario 💬',
          `@${commenter.username} comentó en tu publicación "${postTitle}"`,
          `/foro`,
          commenter.avatar_url
        );
      }
    }

    // 🔔 NOTIFICACIÓN: Respuesta a comentario (si es reply)
    if (input.parent_id) {
      const { data: parentCommentRaw } = await getSupabase()
        .from('forum_comments')
        .select('author_id')
        .eq('id', input.parent_id)
        .single();

      const parentComment = parentCommentRaw as { author_id?: string } | null;
      if (parentComment && parentComment.author_id !== userId) {
        const { data: replierRaw } = await getSupabase()
          .from('users')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        const replier = replierRaw as { username?: string; avatar_url?: string } | null;
        if (replier) {
          await this.sendNotification(
            parentComment.author_id!,
            'comment_reply',
            'Nueva Respuesta 💬',
            `@${replier.username} respondió a tu comentario`,
            `/foro`,
            replier.avatar_url
          );
        }
      }
    }

    return data;
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    // Obtener el post_id antes de eliminar
    const { data: comment } = await getSupabase()
      .from('forum_comments')
      .select('post_id')
      .eq('id', commentId)
      .single();

    const { error } = await getSupabase()
      .from('forum_comments')
      .update({ status: 'deleted' } as never)
      .eq('id', commentId)
      .eq('author_id', userId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    // Decrementar contador
    if (comment) {
      const commentData = comment as { post_id?: string } | null;
      if (commentData?.post_id) {
        await (getSupabase().rpc as any)('decrement_comments_count', { post_id: commentData.post_id });
      }
    }

    return true;
  }

  async toggleLikeComment(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data: existingLike } = await getSupabase()
      .from('forum_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      await getSupabase()
        .from('forum_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);

      const { data: comment } = await getSupabase()
        .from('forum_comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

      const newCount = Math.max(0, ((comment as { likes_count?: number } | null)?.likes_count || 1) - 1);
      
      await getSupabase()
        .from('forum_comments')
        .update({ likes_count: newCount } as never)
        .eq('id', commentId);

      return { liked: false, likesCount: newCount };
    } else {
      await getSupabase()
        .from('forum_comment_likes')
        .insert({ comment_id: commentId, user_id: userId } as never);

      const { data: comment } = await getSupabase()
        .from('forum_comments')
        .select('likes_count, author_id, content')
        .eq('id', commentId)
        .single();

      const commentData = comment as { likes_count?: number; author_id?: string; content?: string } | null;
      const newCount = (commentData?.likes_count || 0) + 1;
      
      await getSupabase()
        .from('forum_comments')
        .update({ likes_count: newCount } as never)
        .eq('id', commentId);

      // 🔔 NOTIFICACIÓN: Like en comentario
      if (commentData && commentData.author_id !== userId) {
        const { data: likerRaw } = await getSupabase()
          .from('users')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        const liker = likerRaw as { username?: string; avatar_url?: string } | null;
        if (liker) {
          const commentPreview = commentData.content?.substring(0, 30) + '...';
          await this.sendNotification(
            commentData.author_id!,
            'like_received',
            'Nuevo Like ❤️',
            `A @${liker.username} le gustó tu comentario "${commentPreview}"`,
            `/foro`,
            liker.avatar_url
          );
        }
      }

      return { liked: true, likesCount: newCount };
    }
  }

  // ==================== CATEGORIES ====================

  async getCategories(): Promise<ForumCategory[]> {
    const { data, error } = await getSupabase()
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  }

  // ==================== REACTIONS ====================

  async toggleReaction(
    postId: string,
    userId: string,
    reactionType: ReactionType
  ): Promise<{ added: boolean; counts: ReactionCounts }> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('toggle_post_reaction', {
        p_post_id: postId,
        p_user_id: userId,
        p_reaction_type: reactionType,
      });

      if (error) {
        console.error('Error toggling reaction:', error);
        // Fallback manual implementation
        return this.toggleReactionManual(postId, userId, reactionType);
      }

      const rpcData = data as { added?: boolean; counts?: ReactionCounts } | null;

      // Notify post author if reaction was added
      if (rpcData?.added) {
        const { data: postRaw } = await getSupabase()
          .from('forum_posts')
          .select('author_id, title, content')
          .eq('id', postId)
          .single();

        const post = postRaw as { author_id?: string; title?: string; content?: string } | null;
        if (post && post.author_id !== userId) {
          const { data: reactorRaw } = await getSupabase()
            .from('users')
            .select('username, avatar_url')
            .eq('id', userId)
            .single();

          const reactor = reactorRaw as { username?: string; avatar_url?: string } | null;
          if (reactor) {
            const reactionEmoji = this.getReactionEmoji(reactionType);
            const postTitle = post.title || post.content?.substring(0, 30) + '...';
            await this.sendNotification(
              post.author_id!,
              'reaction_received',
              `${reactionEmoji} Nueva Reacción`,
              `@${reactor.username} reaccionó ${reactionEmoji} a tu publicación "${postTitle}"`,
              `/foro`,
              reactor.avatar_url
            );
          }
        }
      }

      return {
        added: rpcData?.added || false,
        counts: rpcData?.counts || { fire: 0, love: 0, clap: 0, mindblown: 0, sad: 0, laugh: 0 },
      };
    } catch (error) {
      console.error('Error in toggleReaction:', error);
      return this.toggleReactionManual(postId, userId, reactionType);
    }
  }

  private async toggleReactionManual(
    postId: string,
    userId: string,
    reactionType: ReactionType
  ): Promise<{ added: boolean; counts: ReactionCounts }> {
    // Check if reaction exists
    const { data: existingRaw } = await getSupabase()
      .from('forum_post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType)
      .single();

    const existing = existingRaw as { id?: string } | null;

    const { data: postRaw } = await getSupabase()
      .from('forum_posts')
      .select('reactions_count')
      .eq('id', postId)
      .single();

    const post = postRaw as { reactions_count?: ReactionCounts } | null;
    let counts: ReactionCounts = post?.reactions_count || {
      fire: 0, love: 0, clap: 0, mindblown: 0, sad: 0, laugh: 0
    };

    if (existing) {
      // Remove reaction
      await getSupabase()
        .from('forum_post_reactions')
        .delete()
        .eq('id', existing.id!);
      counts[reactionType] = Math.max(0, counts[reactionType] - 1);
    } else {
      // Add reaction
      await getSupabase()
        .from('forum_post_reactions')
        .insert({ post_id: postId, user_id: userId, reaction_type: reactionType } as never);
      counts[reactionType] += 1;
    }

    // Update counts
    await getSupabase()
      .from('forum_posts')
      .update({ reactions_count: counts } as never)
      .eq('id', postId);

    return { added: !existing, counts };
  }

  async getUserReactions(postId: string, userId: string): Promise<ReactionType[]> {
    const { data } = await getSupabase()
      .from('forum_post_reactions')
      .select('reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId);

    return ((data || []) as { reaction_type?: string }[]).map(r => r.reaction_type as ReactionType);
  }

  private getReactionEmoji(type: ReactionType): string {
    const emojis: Record<ReactionType, string> = {
      fire: '🔥',
      love: '❤️',
      clap: '👏',
      mindblown: '🤯',
      sad: '😢',
      laugh: '😂',
    };
    return emojis[type];
  }

  // ==================== BOOKMARKS ====================

  async toggleBookmark(postId: string, userId: string): Promise<{ bookmarked: boolean; count: number }> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('toggle_bookmark', {
        p_post_id: postId,
        p_user_id: userId,
      });

      if (error) {
        console.error('Error toggling bookmark:', error);
        return this.toggleBookmarkManual(postId, userId);
      }

      const rpcData = data as { bookmarked?: boolean; count?: number } | null;
      return {
        bookmarked: rpcData?.bookmarked || false,
        count: rpcData?.count || 0,
      };
    } catch (error) {
      console.error('Error in toggleBookmark:', error);
      return this.toggleBookmarkManual(postId, userId);
    }
  }

  private async toggleBookmarkManual(
    postId: string,
    userId: string
  ): Promise<{ bookmarked: boolean; count: number }> {
    const { data: existingRaw } = await getSupabase()
      .from('forum_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    const existing = existingRaw as { id?: string } | null;

    if (existing) {
      await getSupabase().from('forum_bookmarks').delete().eq('id', existing.id!);
      const { data: postRaw } = await getSupabase()
        .from('forum_posts')
        .select('bookmarks_count')
        .eq('id', postId)
        .single();
      const post = postRaw as { bookmarks_count?: number } | null;
      const newCount = Math.max(0, (post?.bookmarks_count || 1) - 1);
      await getSupabase().from('forum_posts').update({ bookmarks_count: newCount } as never).eq('id', postId);
      return { bookmarked: false, count: newCount };
    } else {
      await getSupabase().from('forum_bookmarks').insert({ post_id: postId, user_id: userId } as never);
      const { data: postRaw } = await getSupabase()
        .from('forum_posts')
        .select('bookmarks_count')
        .eq('id', postId)
        .single();
      const post = postRaw as { bookmarks_count?: number } | null;
      const newCount = (post?.bookmarks_count || 0) + 1;
      await getSupabase().from('forum_posts').update({ bookmarks_count: newCount } as never).eq('id', postId);
      return { bookmarked: true, count: newCount };
    }
  }

  async isBookmarked(postId: string, userId: string): Promise<boolean> {
    const { data } = await getSupabase()
      .from('forum_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    return !!data;
  }

  async getUserBookmarks(userId: string): Promise<ForumPost[]> {
    const { data, error } = await getSupabase()
      .from('forum_bookmarks')
      .select(`
        post:forum_posts(
          *,
          author:users!forum_posts_author_id_fkey(id, username, display_name, avatar_url, level),
          category:forum_categories(id, name, slug, icon)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }

    return ((data as unknown as { post: ForumPost }[] || []).map((b) => b.post).filter(Boolean));
  }

  // ==================== REPOSTS ====================

  async createRepost(
    originalPostId: string,
    userId: string,
    quoteContent?: string
  ): Promise<{ success: boolean; error?: string; repost_id?: string }> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('create_repost', {
        p_original_post_id: originalPostId,
        p_user_id: userId,
        p_quote_content: quoteContent || null,
      });

      if (error) {
        console.error('Error creating repost:', error);
        return { success: false, error: error.message };
      }

      const rpcData = data as { success?: boolean; error?: string; repost_id?: string } | null;
      if (!rpcData?.success) {
        return { success: false, error: rpcData?.error };
      }

      // Notify original post author
      const { data: originalPostRaw } = await getSupabase()
        .from('forum_posts')
        .select('author_id, title, content')
        .eq('id', originalPostId)
        .single();

      const originalPost = originalPostRaw as { author_id?: string; title?: string; content?: string } | null;
      if (originalPost && originalPost.author_id !== userId) {
        const { data: reposterRaw } = await getSupabase()
          .from('users')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        const reposter = reposterRaw as { username?: string; avatar_url?: string } | null;
        if (reposter) {
          const postTitle = originalPost.title || originalPost.content?.substring(0, 30) + '...';
          await this.sendNotification(
            originalPost.author_id!,
            'repost_received',
            '🔁 Compartieron tu Post',
            `@${reposter.username} compartió tu publicación "${postTitle}"`,
            `/foro`,
            reposter.avatar_url
          );
        }
      }

      return { success: true, repost_id: rpcData?.repost_id };
    } catch (error) {
      console.error('Error in createRepost:', error);
      return { success: false, error: 'Error al compartir' };
    }
  }

  async hasReposted(postId: string, userId: string): Promise<boolean> {
    const { data } = await getSupabase()
      .from('forum_reposts')
      .select('id')
      .eq('original_post_id', postId)
      .eq('user_id', userId)
      .single();
    return !!data;
  }

  async removeRepost(postId: string, userId: string): Promise<boolean> {
    const { error } = await getSupabase()
      .from('forum_reposts')
      .delete()
      .eq('original_post_id', postId)
      .eq('user_id', userId);

    if (!error) {
      // Get current count and decrement manually
      const { data: postRaw } = await getSupabase()
        .from('forum_posts')
        .select('reposts_count')
        .eq('id', postId)
        .single();
      const post = postRaw as { reposts_count?: number } | null;
      const newCount = Math.max(0, (post?.reposts_count || 1) - 1);
      await getSupabase()
        .from('forum_posts')
        .update({ reposts_count: newCount } as never)
        .eq('id', postId);
    }

    return !error;
  }

  // ==================== MEDIA ====================

  async addMediaToPost(postId: string, media: Omit<ForumMedia, 'id' | 'post_id'>[]): Promise<boolean> {
    const mediaItems = media.map((m, index) => ({
      post_id: postId,
      media_type: m.media_type,
      url: m.url,
      thumbnail_url: m.thumbnail_url,
      width: m.width,
      height: m.height,
      alt_text: m.alt_text,
      sort_order: index,
    }));

    const { error } = await getSupabase()
      .from('forum_post_media')
      .insert(mediaItems as never[]);

    if (!error) {
      await getSupabase()
        .from('forum_posts')
        .update({
          has_media: true,
          media_count: media.length,
        } as never)
        .eq('id', postId);
    }

    return !error;
  }

  async getPostMedia(postId: string): Promise<ForumMedia[]> {
    const { data } = await getSupabase()
      .from('forum_post_media')
      .select('*')
      .eq('post_id', postId)
      .order('sort_order', { ascending: true });

    return data || [];
  }

  // ==================== TRENDING ====================

  async getTrendingTags(limit: number = 10): Promise<TrendingTag[]> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('get_trending_tags', { p_limit: limit });

      if (error) {
        console.error('Error fetching trending tags:', error);
        return this.getTrendingTagsManual(limit);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTrendingTags:', error);
      return this.getTrendingTagsManual(limit);
    }
  }

  private async getTrendingTagsManual(limit: number): Promise<TrendingTag[]> {
    // Fallback: count tags from recent posts
    const { data } = await getSupabase()
      .from('forum_posts')
      .select('tags')
      .eq('status', 'published')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (!data) return [];

    const tagCounts: Record<string, number> = {};
    (data as { tags?: string[] }[]).forEach(post => {
      (post.tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, post_count: count, engagement_score: count * 10 }))
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, limit);
  }

  // ==================== FOLLOWING FEED ====================

  async getFollowingFeed(userId: string, limit: number = 20, offset: number = 0): Promise<ForumPost[]> {
    try {
      // Get users being followed
      const { data: follows } = await getSupabase()
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (!follows || follows.length === 0) {
        return [];
      }

      const followingIds = (follows as { following_id?: string }[]).map(f => f.following_id).filter(Boolean) as string[];

      const { data, error } = await getSupabase()
        .from('forum_posts')
        .select(`
          *,
          author:users!forum_posts_author_id_fkey(id, username, display_name, avatar_url, level),
          category:forum_categories(id, name, slug, icon)
        `)
        .in('author_id', followingIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching following feed:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFollowingFeed:', error);
      return [];
    }
  }

  // ==================== USER FOLLOWS ====================

  async toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean; error?: string }> {
    if (followerId === followingId) {
      return { following: false, error: 'No puedes seguirte a ti mismo' };
    }

    try {
      const { data, error } = await (getSupabase().rpc as any)('toggle_follow_user', {
        p_follower_id: followerId,
        p_following_id: followingId,
      });

      if (error) {
        console.error('Error toggling follow:', error);
        return this.toggleFollowManual(followerId, followingId);
      }

      const rpcData = data as { following?: boolean } | null;

      // Send notification if now following
      if (rpcData?.following) {
        const { data: followerRaw } = await getSupabase()
          .from('users')
          .select('username, avatar_url')
          .eq('id', followerId)
          .single();

        const follower = followerRaw as { username?: string; avatar_url?: string } | null;
        if (follower) {
          await this.sendNotification(
            followingId,
            'new_follower',
            '👤 Nuevo Seguidor',
            `@${follower.username} comenzó a seguirte`,
            `/perfil/${followerId}`,
            follower.avatar_url
          );
        }
      }

      return { following: rpcData?.following || false };
    } catch (error) {
      console.error('Error in toggleFollow:', error);
      return this.toggleFollowManual(followerId, followingId);
    }
  }

  private async toggleFollowManual(
    followerId: string,
    followingId: string
  ): Promise<{ following: boolean }> {
    const { data: existingRaw } = await getSupabase()
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    const existing = existingRaw as { id?: string } | null;

    if (existing) {
      await getSupabase().from('user_follows').delete().eq('id', existing.id!);
      // Decrement followers_count manually
      const { data: followingUserRaw } = await getSupabase().from('users').select('followers_count').eq('id', followingId).single();
      const followingUser = followingUserRaw as { followers_count?: number } | null;
      await getSupabase().from('users').update({ followers_count: Math.max(0, (followingUser?.followers_count || 1) - 1) } as never).eq('id', followingId);
      // Decrement following_count manually
      const { data: followerUserRaw } = await getSupabase().from('users').select('following_count').eq('id', followerId).single();
      const followerUser = followerUserRaw as { following_count?: number } | null;
      await getSupabase().from('users').update({ following_count: Math.max(0, (followerUser?.following_count || 1) - 1) } as never).eq('id', followerId);
      return { following: false };
    } else {
      await getSupabase().from('user_follows').insert({ follower_id: followerId, following_id: followingId } as never);
      return { following: true };
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data } = await getSupabase()
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    return !!data;
  }

  async getFollowers(userId: string): Promise<{ id: string; username: string; display_name: string; avatar_url: string }[]> {
    const { data } = await getSupabase()
      .from('user_follows')
      .select(`
        follower:users!user_follows_follower_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('following_id', userId);

    type FollowerRow = { follower?: { id: string; username: string; display_name: string; avatar_url: string } };
    return ((data || []) as FollowerRow[]).map(f => f.follower).filter(Boolean) as any[];
  }

  async getFollowing(userId: string): Promise<{ id: string; username: string; display_name: string; avatar_url: string }[]> {
    const { data } = await getSupabase()
      .from('user_follows')
      .select(`
        following:users!user_follows_following_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('follower_id', userId);

    type FollowingRow = { following?: { id: string; username: string; display_name: string; avatar_url: string } };
    return ((data || []) as FollowingRow[]).map(f => f.following).filter(Boolean) as any[];
  }

  // ==================== SHARES TRACKING ====================

  async trackShare(postId: string, userId: string | null, shareType: 'clipboard' | 'twitter' | 'whatsapp' | 'facebook'): Promise<void> {
    await getSupabase().from('forum_shares').insert({
      post_id: postId,
      user_id: userId,
      share_type: shareType,
    } as never);

    // Increment shares_count manually
    const { data: postRaw } = await getSupabase()
      .from('forum_posts')
      .select('shares_count')
      .eq('id', postId)
      .single();
    const post = postRaw as { shares_count?: number } | null;
    await getSupabase()
      .from('forum_posts')
      .update({ shares_count: (post?.shares_count || 0) + 1 } as never)
      .eq('id', postId);
  }

  // ==================== ENRICHED POSTS ====================

  async getPostsWithUserState(
    userId: string | null,
    options?: {
      limit?: number;
      offset?: number;
      category?: string;
      sortBy?: 'recent' | 'popular' | 'comments' | 'following';
      tag?: string;
    }
  ): Promise<ForumPost[]> {
    const { sortBy = 'recent' } = options || {};

    // If following feed requested
    if (sortBy === 'following' && userId) {
      const posts = await this.getFollowingFeed(userId, options?.limit, options?.offset);
      return this.enrichPostsWithUserState(posts, userId);
    }

    // Regular feed - filter out 'following' from sortBy
    const regularOptions = options ? {
      ...options,
      sortBy: options.sortBy === 'following' ? 'recent' : options.sortBy,
    } : undefined;
    const posts = await this.getPosts(regularOptions as Parameters<typeof this.getPosts>[0]);
    return this.enrichPostsWithUserState(posts, userId);
  }

  private async enrichPostsWithUserState(posts: ForumPost[], userId: string | null): Promise<ForumPost[]> {
    if (posts.length === 0) return posts;

    const postIds = posts.map(p => p.id);

    // Get polls for all posts (visible to everyone)
    const { data: pollsData } = await getSupabase()
      .from('forum_polls')
      .select(`
        *,
        options:forum_poll_options(*)
      `)
      .in('post_id', postIds);

    type PollRow = ForumPoll & { options?: ForumPollOption[]; post_id?: string };
    const pollMap = new Map<string, ForumPoll>();

    if (pollsData) {
      for (const pollRaw of pollsData as PollRow[]) {
        if (pollRaw.post_id) {
          const totalVotes = (pollRaw.options || []).reduce((sum, opt) => sum + (opt.votes_count || 0), 0);

          // Check if user has voted (if logged in)
          let hasVoted = false;
          let userVotes: string[] = [];

          if (userId && pollRaw.id) {
            const { data: votes } = await getSupabase()
              .from('forum_poll_votes')
              .select('option_id')
              .eq('poll_id', pollRaw.id)
              .eq('user_id', userId);

            hasVoted = (votes || []).length > 0;
            userVotes = (votes || []).map((v: { option_id?: string }) => v.option_id).filter(Boolean) as string[];
          }

          pollMap.set(pollRaw.post_id, {
            ...pollRaw,
            options: pollRaw.options || [],
            total_votes: totalVotes,
            has_voted: hasVoted,
            user_votes: userVotes,
          });
        }
      }
    }

    // If no user, just add polls and return
    if (!userId) {
      return posts.map(post => ({
        ...post,
        poll: pollMap.get(post.id),
      }));
    }

    // Get user reactions
    const { data: reactions } = await getSupabase()
      .from('forum_post_reactions')
      .select('post_id, reaction_type')
      .eq('user_id', userId)
      .in('post_id', postIds);

    // Get user bookmarks
    const { data: bookmarks } = await getSupabase()
      .from('forum_bookmarks')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);

    // Get user reposts
    const { data: reposts } = await getSupabase()
      .from('forum_reposts')
      .select('original_post_id')
      .eq('user_id', userId)
      .in('original_post_id', postIds);

    type ReactionRow = { post_id?: string; reaction_type?: string };
    type BookmarkRow = { post_id?: string };
    type RepostRow = { original_post_id?: string };

    const reactionMap = new Map<string, ReactionType[]>();
    ((reactions || []) as ReactionRow[]).forEach(r => {
      if (r.post_id) {
        const existing = reactionMap.get(r.post_id) || [];
        existing.push(r.reaction_type as ReactionType);
        reactionMap.set(r.post_id, existing);
      }
    });

    const bookmarkSet = new Set(((bookmarks || []) as BookmarkRow[]).map(b => b.post_id).filter(Boolean) as string[]);
    const repostSet = new Set(((reposts || []) as RepostRow[]).map(r => r.original_post_id).filter(Boolean) as string[]);

    return posts.map(post => ({
      ...post,
      poll: pollMap.get(post.id),
      user_reactions: reactionMap.get(post.id) || [],
      user_bookmarked: bookmarkSet.has(post.id),
      user_reposted: repostSet.has(post.id),
    }));
  }

  // ==================== POLLS ====================

  async createPostWithPoll(userId: string, input: CreatePostInput): Promise<ForumPost | null> {
    // First create the post
    const { data: postRaw, error: postError } = await getSupabase()
      .from('forum_posts')
      .insert({
        title: input.title || '',
        content: input.content,
        author_id: userId,
        category_id: input.category_id || null,
        tags: input.tags || [],
        gif_url: input.gif_url || null,
        gif_width: input.gif_width || null,
        gif_height: input.gif_height || null,
        status: 'published',
      } as never)
      .select('*')
      .single();

    const post = postRaw as ForumPost | null;
    if (postError || !post) {
      console.error('Error creating post:', postError);
      return null;
    }

    // If there's a poll, create it
    if (input.poll) {
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + (input.poll.ends_in_hours || 24));

      const { data: pollRaw, error: pollError } = await getSupabase()
        .from('forum_polls')
        .insert({
          post_id: post.id,
          question: input.poll.question,
          ends_at: endsAt.toISOString(),
          multiple_choice: input.poll.multiple_choice || false,
        } as never)
        .select('*')
        .single();

      if (pollError) {
        console.error('Error creating poll:', pollError);
        // Still return the post, but log the error
      }

      const poll = pollRaw as { id?: string } | null;
      if (poll?.id) {
        // Create poll options
        const options = input.poll.options.map((opt, idx) => ({
          poll_id: poll.id,
          option_text: opt,
          option_order: idx,
          votes_count: 0,
        }));

        const { error: optionsError } = await getSupabase().from('forum_poll_options').insert(options as never[]);
        if (optionsError) {
          console.error('Error creating poll options:', optionsError);
        }
      }
    }

    return post;
  }

  async getPollForPost(postId: string, userId?: string): Promise<ForumPoll | null> {
    const { data: pollRaw, error } = await getSupabase()
      .from('forum_polls')
      .select(`
        *,
        options:forum_poll_options(*)
      `)
      .eq('post_id', postId)
      .single();

    if (error || !pollRaw) return null;

    type PollRow = ForumPoll & { options?: ForumPollOption[] };
    const poll = pollRaw as PollRow;

    // Calculate total votes
    const totalVotes = (poll.options || []).reduce((sum: number, opt: ForumPollOption) => sum + (opt.votes_count || 0), 0);

    // Check if user has voted
    let hasVoted = false;
    let userVotes: string[] = [];

    if (userId && poll.id) {
      const { data: votes } = await getSupabase()
        .from('forum_poll_votes')
        .select('option_id')
        .eq('poll_id', poll.id)
        .eq('user_id', userId);

      type VoteRow = { option_id?: string };
      hasVoted = (votes || []).length > 0;
      userVotes = ((votes || []) as VoteRow[]).map(v => v.option_id).filter(Boolean) as string[];
    }

    return {
      ...poll,
      total_votes: totalVotes,
      has_voted: hasVoted,
      user_votes: userVotes,
    };
  }

  async voteOnPoll(pollId: string, optionId: string, userId: string): Promise<{ success: boolean; error?: string; options?: ForumPollOption[] }> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('vote_on_poll', {
        p_poll_id: pollId,
        p_option_id: optionId,
        p_user_id: userId,
      });

      if (error) {
        console.error('Error voting on poll:', error);
        return { success: false, error: error.message };
      }

      return data || { success: true };
    } catch (error) {
      console.error('Error in voteOnPoll:', error);
      return { success: false, error: 'Error al votar' };
    }
  }

  // ==================== AWARDS ====================

  async getAwardTypes(): Promise<AwardType[]> {
    const { data, error } = await getSupabase()
      .from('forum_award_types')
      .select('*')
      .order('ap_cost', { ascending: true });

    if (error) {
      console.error('Error fetching award types:', error);
      return [];
    }

    return data || [];
  }

  async giveAward(
    postId: string,
    awardTypeId: string,
    giverId: string,
    message?: string
  ): Promise<{ success: boolean; error?: string; award_name?: string; ap_spent?: number }> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('give_post_award', {
        p_post_id: postId,
        p_award_type_id: awardTypeId,
        p_giver_id: giverId,
        p_message: message || null,
      });

      if (error) {
        console.error('Error giving award:', error);
        return { success: false, error: error.message };
      }

      return data || { success: true };
    } catch (error) {
      console.error('Error in giveAward:', error);
      return { success: false, error: 'Error al dar premio' };
    }
  }

  async getPostAwards(postId: string): Promise<PostAward[]> {
    const { data, error } = await getSupabase()
      .from('forum_post_awards')
      .select(`
        *,
        award_type:forum_award_types(*),
        giver:profiles!forum_post_awards_giver_id_fkey(id, username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching post awards:', error);
      return [];
    }

    type AwardRow = {
      id?: string;
      post_id?: string;
      award_type?: AwardType;
      giver?: { id: string; username: string; avatar_url: string };
      message?: string;
      created_at?: string;
    };

    return ((data || []) as AwardRow[]).map(a => ({
      id: a.id!,
      post_id: a.post_id!,
      award_type: a.award_type!,
      giver: a.giver!,
      message: a.message,
      created_at: a.created_at!,
    }));
  }

  // ==================== STORIES ====================

  async createStory(userId: string, input: CreateStoryInput): Promise<{ success: boolean; story_id?: string; error?: string }> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('create_story', {
        p_user_id: userId,
        p_content: input.content || null,
        p_media_url: input.media_url || null,
        p_media_type: input.media_type || null,
        p_background_color: input.background_color || '#1a1a2e',
        p_text_color: input.text_color || '#ffffff',
      });

      if (error) {
        console.error('Error creating story:', error);
        return { success: false, error: error.message };
      }

      return data || { success: true };
    } catch (error) {
      console.error('Error in createStory:', error);
      return { success: false, error: 'Error al crear historia' };
    }
  }

  async getFollowingStories(userId: string): Promise<ForumStory[]> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('get_following_stories', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching stories:', error);
        return [];
      }

      // Group by user
      return data || [];
    } catch (error) {
      console.error('Error in getFollowingStories:', error);
      return [];
    }
  }

  async viewStory(storyId: string, viewerId: string): Promise<boolean> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('view_story', {
        p_story_id: storyId,
        p_viewer_id: viewerId,
      });

      const rpcData = data as { success?: boolean } | null;
      return rpcData?.success || false;
    } catch (error) {
      console.error('Error viewing story:', error);
      return false;
    }
  }

  async reactToStory(storyId: string, userId: string, reaction: string): Promise<boolean> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('react_to_story', {
        p_story_id: storyId,
        p_user_id: userId,
        p_reaction: reaction,
      });

      const rpcData = data as { success?: boolean } | null;
      return rpcData?.success || false;
    } catch (error) {
      console.error('Error reacting to story:', error);
      return false;
    }
  }

  async getStoryViewers(storyId: string): Promise<{ id: string; username: string; avatar_url: string; viewed_at: string }[]> {
    const { data, error } = await getSupabase()
      .from('forum_story_views')
      .select(`
        viewed_at,
        viewer:profiles!forum_story_views_viewer_id_fkey(id, username, avatar_url)
      `)
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false });

    if (error) {
      console.error('Error fetching story viewers:', error);
      return [];
    }

    type ViewerRow = {
      viewed_at?: string;
      viewer?: { id: string; username: string; avatar_url: string };
    };

    return ((data || []) as ViewerRow[]).map(v => ({
      ...(v.viewer || { id: '', username: '', avatar_url: '' }),
      viewed_at: v.viewed_at || '',
    }));
  }

  // ==================== THREADS ====================

  async createThread(userId: string, title: string, posts: { content: string; tags?: string[]; gif_url?: string }[]): Promise<{ success: boolean; thread_id?: string; post_ids?: string[]; error?: string }> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('create_thread', {
        p_user_id: userId,
        p_title: title,
        p_posts: JSON.stringify(posts),
      });

      if (error) {
        console.error('Error creating thread:', error);
        return { success: false, error: error.message };
      }

      return data || { success: true };
    } catch (error) {
      console.error('Error in createThread:', error);
      return { success: false, error: 'Error al crear hilo' };
    }
  }

  async getThreadPosts(threadId: string): Promise<ForumPost[]> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('get_thread_posts', {
        p_thread_id: threadId,
      });

      if (error) {
        console.error('Error fetching thread posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getThreadPosts:', error);
      return [];
    }
  }

  // ==================== NOTIFICATIONS ====================

  async getNotifications(userId: string, limit: number = 50, unreadOnly: boolean = false): Promise<ForumNotification[]> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('get_user_notifications', {
        p_user_id: userId,
        p_limit: limit,
        p_unread_only: unreadOnly,
      });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return [];
    }
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const { count, error } = await getSupabase()
      .from('forum_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }

    return count || 0;
  }

  async markNotificationsRead(userId: string, notificationIds?: string[]): Promise<boolean> {
    try {
      const { error } = await (getSupabase().rpc as any)('mark_notifications_read', {
        p_user_id: userId,
        p_notification_ids: notificationIds || null,
      });

      return !error;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return false;
    }
  }

  // ==================== MENTIONS ====================

  async searchUsersForMention(query: string, limit: number = 10): Promise<MentionSuggestion[]> {
    try {
      const { data, error } = await (getSupabase().rpc as any)('search_users_for_mention', {
        p_query: query,
        p_limit: limit,
      });

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchUsersForMention:', error);
      return [];
    }
  }

  // ==================== BADGES ====================

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await getSupabase()
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data || [];
  }

  getBadgeInfo(badgeType: BadgeType): { icon: string; color: string; label: string } {
    const badges: Record<BadgeType, { icon: string; color: string; label: string }> = {
      verified: { icon: '✓', color: '#1DA1F2', label: 'Verificado' },
      creator: { icon: '★', color: '#FFD700', label: 'Creador' },
      prophet: { icon: '🔮', color: '#9B59B6', label: 'Profeta' },
      og: { icon: '👑', color: '#2ECC71', label: 'OG' },
      moderator: { icon: '🛡️', color: '#E74C3C', label: 'Moderador' },
      apocaliptyx: { icon: '⚡', color: '#FF6B6B', label: 'Apocaliptyx' },
    };
    return badges[badgeType];
  }

  // ==================== HOT/RISING/CONTROVERSIAL SORTING ====================

  async getPostsBySorting(
    sortType: 'hot' | 'rising' | 'controversial',
    options?: { limit?: number; offset?: number; category?: string; userId?: string }
  ): Promise<ForumPost[]> {
    const { limit = 20, offset = 0, category, userId } = options || {};

    let query = getSupabase()
      .from('forum_posts')
      .select(`
        *,
        author:users!forum_posts_author_id_fkey(id, username, display_name, avatar_url, level),
        category:forum_categories(id, name, slug, icon),
        thread:forum_threads(id, title, total_posts, user_id)
      `)
      .eq('status', 'published');

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    // Sort by the appropriate score
    switch (sortType) {
      case 'hot':
        query = query.order('hot_score', { ascending: false });
        break;
      case 'rising':
        query = query.order('rising_score', { ascending: false });
        break;
      case 'controversial':
        query = query.order('controversy_score', { ascending: false });
        break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts by sorting:', error);
      return [];
    }

    // Enrich posts with polls and user state
    return this.enrichPostsWithUserState(data || [], userId || null);
  }

  // ==================== GIF SEARCH (GIPHY/TENOR) ====================

  async searchGifs(query: string, limit: number = 20): Promise<{ id: string; url: string; preview_url: string; width: number; height: number }[]> {
    // This would integrate with GIPHY or Tenor API
    // For now, return empty array - user would need to add API key
    try {
      const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
      if (!GIPHY_API_KEY) {
        console.warn('GIPHY API key not configured');
        return [];
      }

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=pg-13`
      );
      const data = await response.json();

      return (data.data || []).map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview_url: gif.images.fixed_width.url,
        width: parseInt(gif.images.original.width),
        height: parseInt(gif.images.original.height),
      }));
    } catch (error) {
      console.error('Error searching GIFs:', error);
      return [];
    }
  }

  async getTrendingGifs(limit: number = 20): Promise<{ id: string; url: string; preview_url: string; width: number; height: number }[]> {
    try {
      const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
      if (!GIPHY_API_KEY) {
        return [];
      }

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=pg-13`
      );
      const data = await response.json();

      return (data.data || []).map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview_url: gif.images.fixed_width.url,
        width: parseInt(gif.images.original.width),
        height: parseInt(gif.images.original.height),
      }));
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
      return [];
    }
  }
}

export const forumService = new ForumService();