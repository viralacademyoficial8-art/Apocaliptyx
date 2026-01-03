// src/services/forum.service.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  // Joined data
  author?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    level: number;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
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
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          link_url: linkUrl,
          image_url: imageUrl || null,
          is_read: false,
        });
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

    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        author:users!forum_posts_author_id_fkey(id, username, display_name, avatar_url, level),
        category:forum_categories(id, name, slug, icon)
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
    let posts = data || [];
    if (tag) {
      posts = posts.filter(post => post.tags?.includes(tag));
    }

    return posts;
  }

  async getPostById(postId: string): Promise<ForumPost | null> {
    const { data, error } = await supabase
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
    await supabase
      .from('forum_posts')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', postId);

    return data;
  }

  async createPost(userId: string, input: CreatePostInput): Promise<ForumPost | null> {
    const { data, error } = await supabase
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
      })
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
    const { error } = await supabase
      .from('forum_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
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
    const { error } = await supabase
      .from('forum_posts')
      .update({ status: 'deleted' })
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
    const { data: existingLike } = await supabase
      .from('forum_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Quitar like
      await supabase
        .from('forum_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // Decrementar contador
      const { data: post } = await supabase
        .from('forum_posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      const newCount = Math.max(0, (post?.likes_count || 1) - 1);
      
      await supabase
        .from('forum_posts')
        .update({ likes_count: newCount })
        .eq('id', postId);

      return { liked: false, likesCount: newCount };
    } else {
      // Agregar like
      await supabase
        .from('forum_post_likes')
        .insert({ post_id: postId, user_id: userId });

      // Incrementar contador
      const { data: post } = await supabase
        .from('forum_posts')
        .select('likes_count, author_id, title, content')
        .eq('id', postId)
        .single();

      const newCount = (post?.likes_count || 0) + 1;
      
      await supabase
        .from('forum_posts')
        .update({ likes_count: newCount })
        .eq('id', postId);

      // 🔔 NOTIFICACIÓN: Like en post (solo si no es el propio autor)
      if (post && post.author_id !== userId) {
        const { data: liker } = await supabase
          .from('users')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        if (liker) {
          const postTitle = post.title || post.content.substring(0, 30) + '...';
          await this.sendNotification(
            post.author_id,
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
    const { data } = await supabase
      .from('forum_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    return !!data;
  }

  // ==================== COMMENTS ====================

  async getComments(postId: string): Promise<ForumComment[]> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: input.post_id,
        author_id: userId,
        content: input.content,
        parent_id: input.parent_id || null,
        status: 'published',
        likes_count: 0,
      })
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
    await supabase.rpc('increment_comments_count', { post_id: input.post_id });

    // 🔔 NOTIFICACIÓN: Comentario en post
    const { data: post } = await supabase
      .from('forum_posts')
      .select('author_id, title, content')
      .eq('id', input.post_id)
      .single();

    if (post && post.author_id !== userId) {
      const { data: commenter } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();

      if (commenter) {
        const postTitle = post.title || post.content.substring(0, 30) + '...';
        await this.sendNotification(
          post.author_id,
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
      const { data: parentComment } = await supabase
        .from('forum_comments')
        .select('author_id')
        .eq('id', input.parent_id)
        .single();

      if (parentComment && parentComment.author_id !== userId) {
        const { data: replier } = await supabase
          .from('users')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        if (replier) {
          await this.sendNotification(
            parentComment.author_id,
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
    const { data: comment } = await supabase
      .from('forum_comments')
      .select('post_id')
      .eq('id', commentId)
      .single();

    const { error } = await supabase
      .from('forum_comments')
      .update({ status: 'deleted' })
      .eq('id', commentId)
      .eq('author_id', userId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    // Decrementar contador
    if (comment) {
      await supabase.rpc('decrement_comments_count', { post_id: comment.post_id });
    }

    return true;
  }

  async toggleLikeComment(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data: existingLike } = await supabase
      .from('forum_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      await supabase
        .from('forum_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);

      const { data: comment } = await supabase
        .from('forum_comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

      const newCount = Math.max(0, (comment?.likes_count || 1) - 1);
      
      await supabase
        .from('forum_comments')
        .update({ likes_count: newCount })
        .eq('id', commentId);

      return { liked: false, likesCount: newCount };
    } else {
      await supabase
        .from('forum_comment_likes')
        .insert({ comment_id: commentId, user_id: userId });

      const { data: comment } = await supabase
        .from('forum_comments')
        .select('likes_count, author_id, content')
        .eq('id', commentId)
        .single();

      const newCount = (comment?.likes_count || 0) + 1;
      
      await supabase
        .from('forum_comments')
        .update({ likes_count: newCount })
        .eq('id', commentId);

      // 🔔 NOTIFICACIÓN: Like en comentario
      if (comment && comment.author_id !== userId) {
        const { data: liker } = await supabase
          .from('users')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        if (liker) {
          const commentPreview = comment.content.substring(0, 30) + '...';
          await this.sendNotification(
            comment.author_id,
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
    const { data, error } = await supabase
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
}

export const forumService = new ForumService();