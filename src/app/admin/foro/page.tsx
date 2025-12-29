'use client';

import { useState } from 'react';
import { AdminHeader, ForumPostsTable, ForumCategoriesManager } from '@/components/admin';
import { 
  mockForumPosts, 
  mockForumComments, 
  mockForumCategories,
  ForumPost,
  ForumComment,
  ForumCategory
} from '@/lib/admin-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

export default function AdminForo() {
  const [posts, setPosts] = useState<ForumPost[]>(mockForumPosts);
  const [comments, setComments] = useState<ForumComment[]>(mockForumComments);
  const [categories, setCategories] = useState<ForumCategory[]>(mockForumCategories);

  // Posts
  const handlePublishPost = (post: ForumPost) => {
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'published' } : p));
    toast.success('Post publicado');
  };

  const handleHidePost = (post: ForumPost) => {
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'hidden' } : p));
    toast.success('Post oculto');
  };

  const handleDeletePost = (post: ForumPost) => {
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'deleted' } : p));
    toast.success('Post eliminado');
  };

  const handlePinPost = (post: ForumPost) => {
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isPinned: !p.isPinned } : p));
    toast.success(post.isPinned ? 'Post desfijado' : 'Post fijado');
  };

  const handleLockPost = (post: ForumPost) => {
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isLocked: !p.isLocked } : p));
    toast.success(post.isLocked ? 'Post desbloqueado' : 'Post bloqueado');
  };

  // Comments
  const handleHideComment = (comment: ForumComment) => {
    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, status: 'hidden' } : c));
    toast.success('Comentario oculto');
  };

  const handleDeleteComment = (comment: ForumComment) => {
    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, status: 'deleted' } : c));
    toast.success('Comentario eliminado');
  };

  // Categories
  const handleAddCategory = (category: Partial<ForumCategory>) => {
    const newCategory: ForumCategory = {
      id: `cat-${Date.now()}`,
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || '💬',
      color: category.color || 'gray',
      postsCount: 0,
      isActive: true,
      order: categories.length + 1,
      createdAt: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleEditCategory = (category: ForumCategory) => {
    setCategories(prev => prev.map(c => c.id === category.id ? category : c));
  };

  const handleDeleteCategory = (category: ForumCategory) => {
    setCategories(prev => prev.filter(c => c.id !== category.id));
    toast.success('Categoría eliminada');
  };

  const handleToggleCategory = (category: ForumCategory) => {
    setCategories(prev => prev.map(c => 
      c.id === category.id ? { ...c, isActive: !c.isActive } : c
    ));
    toast.success(category.isActive ? 'Categoría desactivada' : 'Categoría activada');
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Gestión del Foro" 
        subtitle="Modera posts, comentarios y categorías"
      />

      <div className="p-6">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <ForumPostsTable
              posts={posts}
              comments={comments}
              onPublishPost={handlePublishPost}
              onHidePost={handleHidePost}
              onDeletePost={handleDeletePost}
              onPinPost={handlePinPost}
              onLockPost={handleLockPost}
              onHideComment={handleHideComment}
              onDeleteComment={handleDeleteComment}
            />
          </TabsContent>

          <TabsContent value="categories">
            <ForumCategoriesManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onToggleCategory={handleToggleCategory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
