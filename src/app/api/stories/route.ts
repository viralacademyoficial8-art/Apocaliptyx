import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

interface StoryUser {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface StoryRow {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  background_color?: string;
  text_color?: string;
  font_style?: string;
  views_count: number;
  expires_at: string;
  created_at: string;
  is_highlight: boolean;
  highlight_name?: string;
  link_url?: string;
  link_preview?: {
    url: string;
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
  };
  user?: StoryUser;
}

interface StoryView {
  viewer_id: string;
}

interface UserFollow {
  following_id: string;
}

// GET /api/stories - Get stories feed
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Get specific user's stories
    const includeOwn = searchParams.get('includeOwn') === 'true';

    const user = session?.user;

    // Build query for active (non-expired) stories
    let query = supabase()
      .from('forum_stories')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    // Get followed users for prioritization
    let followingIds: string[] = [];
    if (user) {
      const { data: followingRaw } = await supabase()
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const following = followingRaw as UserFollow[] | null;
      followingIds = following?.map(f => f.following_id) || [];
    }

    if (userId) {
      // Get specific user's stories
      query = query.eq('user_id', userId);
    }
    // Note: We now show ALL active stories, but prioritize followed users in sorting

    const { data: storiesRaw, error } = await query.limit(50);

    if (error) throw error;

    const stories = storiesRaw as StoryRow[] | null;

    // Get viewed stories for current user
    let viewedStoryIds: string[] = [];
    if (user && stories && stories.length > 0) {
      const storyIds = stories.map(s => s.id);
      const { data: viewsRaw } = await supabase()
        .from('forum_story_views')
        .select('story_id')
        .eq('viewer_id', user.id)
        .in('story_id', storyIds);

      const views = viewsRaw as { story_id: string }[] | null;
      viewedStoryIds = views?.map(v => v.story_id) || [];
    }

    // Group stories by user
    const userStoriesMap = new Map<string, {
      user: StoryUser;
      stories: StoryRow[];
      hasUnviewed: boolean;
      latestAt: string;
    }>();

    stories?.forEach(story => {
      const userId = story.user_id;
      const isViewed = viewedStoryIds.includes(story.id);

      if (!userStoriesMap.has(userId)) {
        userStoriesMap.set(userId, {
          user: story.user || { id: userId },
          stories: [],
          hasUnviewed: false,
          latestAt: story.created_at,
        });
      }

      const userStories = userStoriesMap.get(userId)!;
      userStories.stories.push(story);
      if (!isViewed) {
        userStories.hasUnviewed = true;
      }
      if (story.created_at > userStories.latestAt) {
        userStories.latestAt = story.created_at;
      }
    });

    // Convert to array and sort (own stories first, then followed with unviewed, then others)
    const groupedStories = Array.from(userStoriesMap.values())
      .sort((a, b) => {
        // Current user's stories first
        if (user) {
          if (a.user.id === user.id) return -1;
          if (b.user.id === user.id) return 1;
        }

        // Check if users are followed
        const aIsFollowed = followingIds.includes(a.user.id);
        const bIsFollowed = followingIds.includes(b.user.id);

        // Followed users before non-followed
        if (aIsFollowed !== bIsFollowed) {
          return aIsFollowed ? -1 : 1;
        }

        // Then unviewed stories
        if (a.hasUnviewed !== b.hasUnviewed) {
          return a.hasUnviewed ? -1 : 1;
        }
        // Then by latest story
        return new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime();
      })
      .map(group => ({
        userId: group.user.id,
        username: group.user.username,
        displayName: group.user.display_name,
        avatarUrl: group.user.avatar_url,
        hasUnviewed: group.hasUnviewed,
        storiesCount: group.stories.length,
        stories: group.stories.map(s => ({
          id: s.id,
          content: s.content,
          mediaUrl: s.media_url,
          mediaType: s.media_type,
          backgroundColor: s.background_color,
          textColor: s.text_color,
          fontStyle: s.font_style,
          viewsCount: s.views_count,
          expiresAt: s.expires_at,
          createdAt: s.created_at,
          isViewed: viewedStoryIds.includes(s.id),
          linkUrl: s.link_url,
          linkPreview: s.link_preview,
        })),
      }));

    // Add current user at the beginning if they have no stories (for "Add story" UI)
    if (user && !groupedStories.some(g => g.userId === user.id)) {
      const { data: userData } = await supabase()
        .from('users')
        .select('id, username, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (userData) {
        const userDataTyped = userData as StoryUser;
        groupedStories.unshift({
          userId: user.id,
          username: userDataTyped.username,
          displayName: userDataTyped.display_name,
          avatarUrl: userDataTyped.avatar_url,
          hasUnviewed: false,
          storiesCount: 0,
          stories: [],
        });
      }
    }

    return NextResponse.json({ stories: groupedStories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Error al obtener stories' },
      { status: 500 }
    );
  }
}

// POST /api/stories - Create a new story
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user;
    const contentType = request.headers.get('content-type') || '';

    let content: string | undefined;
    let mediaUrl: string | undefined;
    let mediaType: string | undefined;
    let backgroundColor: string = '#1a1a2e';
    let textColor: string = '#ffffff';
    let fontStyle: string = 'normal';
    let linkUrl: string | undefined;
    let linkPreview: any | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      content = formData.get('content') as string | undefined;
      backgroundColor = formData.get('backgroundColor') as string || '#1a1a2e';
      textColor = formData.get('textColor') as string || '#ffffff';
      fontStyle = formData.get('fontStyle') as string || 'normal';

      if (file) {
        // Only allow images (no videos)
        if (file.type.startsWith('image/')) {
          mediaType = file.type.includes('gif') ? 'gif' : 'image';
        } else {
          return NextResponse.json(
            { error: 'Solo se permiten imágenes' },
            { status: 400 }
          );
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'La imagen es demasiado grande. Máximo 10MB.' },
            { status: 400 }
          );
        }

        // Convert File to Buffer for server-side upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileExt = file.name.split('.').pop();
        const fileName = `stories/${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Try uploading to forum-images bucket first
        let uploadResult = await supabase().storage
          .from('forum-images')
          .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          });

        // If forum-images doesn't exist, try stories bucket
        if (uploadResult.error) {
          uploadResult = await supabase().storage
            .from('stories')
            .upload(fileName, buffer, {
              contentType: file.type,
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadResult.error) {
            console.error('Story upload error:', uploadResult.error);
            return NextResponse.json(
              { error: `Error al subir imagen: ${uploadResult.error.message}` },
              { status: 400 }
            );
          }

          const { data: { publicUrl } } = supabase().storage
            .from('stories')
            .getPublicUrl(fileName);
          mediaUrl = publicUrl;
        } else {
          const { data: { publicUrl } } = supabase().storage
            .from('forum-images')
            .getPublicUrl(fileName);
          mediaUrl = publicUrl;
        }
      }
    } else {
      // Handle JSON body (text-only story or link story)
      const body = await request.json();
      content = body.content;
      backgroundColor = body.backgroundColor || '#1a1a2e';
      textColor = body.textColor || '#ffffff';
      fontStyle = body.fontStyle || 'normal';
      linkUrl = body.linkUrl;
      linkPreview = body.linkPreview;

      // If there's a link preview with an image, use it as media
      if (linkPreview?.image) {
        mediaUrl = linkPreview.image;
        mediaType = 'link_preview';
      }
    }

    if (!content && !mediaUrl && !linkUrl) {
      return NextResponse.json(
        { error: 'Se requiere contenido, imagen o link' },
        { status: 400 }
      );
    }

    // Create story data
    const storyData: any = {
      user_id: user.id,
      content,
      media_url: mediaUrl,
      media_type: mediaType,
      background_color: backgroundColor,
      text_color: textColor,
      font_style: fontStyle,
    };

    // Add link fields if present
    if (linkUrl) {
      storyData.link_url = linkUrl;
    }
    if (linkPreview) {
      storyData.link_preview = linkPreview;
    }

    // Create story
    const { data: story, error: createError } = await supabase()
      .from('forum_stories')
      .insert(storyData as never)
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      story,
      message: 'Story publicado exitosamente',
    });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Error al crear story' },
      { status: 500 }
    );
  }
}
