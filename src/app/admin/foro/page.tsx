'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus,
  MessageSquare,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Power,
  Pin,
  Lock,
  Eye,
  EyeOff,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  posts_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string;
  status: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-500/20 text-green-400',
  hidden: 'bg-yellow-500/20 text-yellow-400',
  deleted: 'bg-red-500/20 text-red-400',
};

export default function AdminForoPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '💬',
    color: 'blue',
    is_active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar categorías
      const { data: categoriesData } = await supabase
        .from('forum_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      setCategories(categoriesData || []);

      // Cargar posts
      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setPosts(postsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Category handlers
  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      icon: '💬',
      color: 'blue',
      is_active: true,
    });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category: ForumCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      is_active: category.is_active,
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-');

    setActionLoading('saving');

    if (editingCategory) {
      const { error } = await supabase
        .from('forum_categories')
        .update({ ...categoryForm, slug })
        .eq('id', editingCategory.id);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        setShowCategoryModal(false);
        loadData();
      }
    } else {
      const { error } = await supabase
        .from('forum_categories')
        .insert({ ...categoryForm, slug, sort_order: categories.length + 1 });

      if (error) {
        alert('Error: ' + error.message);
      } else {
        setShowCategoryModal(false);
        loadData();
      }
    }

    setActionLoading(null);
  };

  const handleToggleCategory = async (category: ForumCategory) => {
    setActionLoading(category.id);
    const { error } = await supabase
      .from('forum_categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadData();
    }
    setActionLoading(null);
  };

  const handleDeleteCategory = async (category: ForumCategory) => {
    if (!confirm('¿Eliminar esta categoría? Los posts asociados quedarán huérfanos.')) return;

    setActionLoading(category.id);
    const { error } = await supabase
      .from('forum_categories')
      .delete()
      .eq('id', category.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadData();
    }
    setActionLoading(null);
  };

  // Post handlers
  const handlePostAction = async (post: ForumPost, action: string) => {
    setActionLoading(post.id);
    let updateData = {};

    switch (action) {
      case 'publish':
        updateData = { status: 'published' };
        break;
      case 'hide':
        updateData = { status: 'hidden' };
        break;
      case 'delete':
        updateData = { status: 'deleted' };
        break;
      case 'pin':
        updateData = { is_pinned: !post.is_pinned };
        break;
      case 'lock':
        updateData = { is_locked: !post.is_locked };
        break;
    }

    const { error } = await supabase
      .from('forum_posts')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', post.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadData();
    }
    setActionLoading(null);
  };

  // Stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.is_active).length;
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Gestión del Foro" 
        subtitle="Modera posts, comentarios y categorías"
      />

      <div className="p-6">
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalCategories}</p>
                    <p className="text-xs text-muted-foreground">Total Categorías</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Power className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeCategories}</p>
                    <p className="text-xs text-muted-foreground">Activas</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalPosts}</p>
                    <p className="text-xs text-muted-foreground">Total Posts</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Eye className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{publishedPosts}</p>
                    <p className="text-xs text-muted-foreground">Publicados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Category Button */}
            <PermissionGate permission="admin.shop.create">
              <Button onClick={openNewCategoryModal} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </PermissionGate>

            {/* Categories Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay categorías</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Slug</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Posts</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.icon}</span>
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-xs text-muted-foreground">{category.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="text-sm bg-muted px-2 py-1 rounded">{category.slug}</code>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {category.posts_count || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {category.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={actionLoading === category.id}>
                                  {actionLoading === category.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <MoreVertical className="w-4 h-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => openEditCategoryModal(category)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleCategory(category)}>
                                  <Power className="w-4 h-4 mr-2" />
                                  {category.is_active ? 'Desactivar' : 'Activar'}
                                </DropdownMenuItem>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem onClick={() => handleDeleteCategory(category)} className="text-red-400">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay posts en el foro</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Post</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vistas</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {post.is_pinned && <Pin className="w-4 h-4 text-yellow-400" />}
                              {post.is_locked && <Lock className="w-4 h-4 text-red-400" />}
                              <div>
                                <p className="font-medium truncate max-w-[300px]">{post.title}</p>
                                <p className="text-xs text-muted-foreground">{post.comments_count} comentarios</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[post.status] || 'bg-gray-500/20 text-gray-400'}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {post.views_count || 0}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={actionLoading === post.id}>
                                  {actionLoading === post.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <MoreVertical className="w-4 h-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handlePostAction(post, 'pin')}>
                                  <Pin className="w-4 h-4 mr-2" />
                                  {post.is_pinned ? 'Desfijar' : 'Fijar'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePostAction(post, 'lock')}>
                                  <Lock className="w-4 h-4 mr-2" />
                                  {post.is_locked ? 'Desbloquear' : 'Bloquear'}
                                </DropdownMenuItem>
                                <div className="h-px bg-border my-1" />
                                {post.status !== 'published' && (
                                  <DropdownMenuItem onClick={() => handlePostAction(post, 'publish')}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Publicar
                                  </DropdownMenuItem>
                                )}
                                {post.status !== 'hidden' && (
                                  <DropdownMenuItem onClick={() => handlePostAction(post, 'hide')}>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Ocultar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handlePostAction(post, 'delete')} className="text-red-400">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Ícono</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-2xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Color</label>
                  <select
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm(f => ({ ...f, color: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="blue">Azul</option>
                    <option value="purple">Púrpura</option>
                    <option value="green">Verde</option>
                    <option value="yellow">Amarillo</option>
                    <option value="red">Rojo</option>
                    <option value="gray">Gris</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Nombre *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Slug (auto-generado si vacío)</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="ejemplo-categoria"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Categoría activa</span>
              </label>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveCategory}
                disabled={actionLoading === 'saving'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {actionLoading === 'saving' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}