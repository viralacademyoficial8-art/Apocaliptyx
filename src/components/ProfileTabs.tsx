'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScenarioCard } from '@/components/ScenarioCard';
import { scenariosService, ScenarioFromDB } from '@/services/scenarios.service';
import { forumService, ForumPost } from '@/services/forum.service';
import { Loader2, Bookmark, MessageSquare, Heart } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type ProfileTabsProps = {
  user: User;
  isOwnProfile?: boolean;
  currentUserId?: string;
};

// Helper para convertir ScenarioFromDB al formato que espera ScenarioCard
function mapScenarioFromDB(s: ScenarioFromDB): any {
  return {
    id: s.id,
    creatorId: s.creator_id,
    currentHolderId: s.creator_id,
    title: s.title,
    description: s.description,
    category: s.category.toLowerCase(),
    dueDate: s.resolution_date,
    creationCost: s.min_bet,
    currentPrice: s.total_pool,
    totalPot: s.total_pool,
    status: s.status.toLowerCase(),
    createdAt: s.created_at,
    updatedAt: new Date(s.updated_at),
    votes: {
      yes: s.yes_pool,
      no: s.no_pool,
    },
  };
}

export function ProfileTabs({ user, isOwnProfile = false, currentUserId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'activos' | 'historial' | 'guardados'>('activos');
  const [scenarios, setScenarios] = useState<ScenarioFromDB[]>([]);
  const [bookmarks, setBookmarks] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  useEffect(() => {
    async function loadScenarios() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await scenariosService.getByCreator(user.id);
        setScenarios(data);
      } catch (error) {
        console.error('Error loading scenarios:', error);
      } finally {
        setLoading(false);
      }
    }

    loadScenarios();
  }, [user?.id]);

  // Load bookmarks when tab changes to guardados
  useEffect(() => {
    async function loadBookmarks() {
      if (activeTab !== 'guardados' || !isOwnProfile || !currentUserId) {
        return;
      }

      setBookmarksLoading(true);
      try {
        const data = await forumService.getUserBookmarks(currentUserId);
        setBookmarks(data);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setBookmarksLoading(false);
      }
    }

    loadBookmarks();
  }, [activeTab, isOwnProfile, currentUserId]);

  const escenariosActivos = scenarios
    .filter(s => s.status === 'ACTIVE')
    .map(mapScenarioFromDB);

  const escenariosHistorial = scenarios
    .filter(s => s.status !== 'ACTIVE')
    .map(mapScenarioFromDB);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'activos' | 'historial' | 'guardados')}
        className="w-full"
      >
        <TabsList
          className="
            w-full
            bg-gray-900/70
            rounded-xl
            p-1
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:gap-0
          "
        >
          <TabsTrigger
            value="activos"
            className="
              flex-1
              text-xs sm:text-sm
              px-3 sm:px-4
              py-2
              data-[state=active]:bg-gray-800
              data-[state=active]:text-white
            "
          >
            Escenarios activos ({escenariosActivos.length})
          </TabsTrigger>
          <TabsTrigger
            value="historial"
            className="
              flex-1
              text-xs sm:text-sm
              px-3 sm:px-4
              py-2
              data-[state=active]:bg-gray-800
              data-[state=active]:text-white
            "
          >
            Historial ({escenariosHistorial.length})
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger
              value="guardados"
              className="
                flex-1
                text-xs sm:text-sm
                px-3 sm:px-4
                py-2
                data-[state=active]:bg-gray-800
                data-[state=active]:text-white
              "
            >
              <Bookmark className="w-4 h-4 mr-1 inline" />
              Guardados ({bookmarks.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="activos" className="mt-6">
          {escenariosActivos.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center">
              <p className="text-sm text-gray-300 mb-1">
                Todavía no tienes escenarios activos.
              </p>
              <p className="text-xs text-gray-500">
                Crea tu primera profecía y empieza a jugar.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                gap-4
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              {escenariosActivos.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario as any} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          {escenariosHistorial.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center">
              <p className="text-sm text-gray-300 mb-1">
                Aún no tienes historial de escenarios.
              </p>
              <p className="text-xs text-gray-500">
                Cuando se vayan resolviendo, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                gap-4
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              {escenariosHistorial.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario as any} />
              ))}
            </div>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="guardados" className="mt-6">
            {bookmarksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center">
                <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-sm text-gray-300 mb-1">
                  No tienes publicaciones guardadas.
                </p>
                <p className="text-xs text-gray-500">
                  Guarda publicaciones del foro usando el ícono de marcador.
                </p>
                <Link
                  href="/foro"
                  className="inline-block mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
                >
                  Ir al Foro
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((post) => (
                  <Link
                    key={post.id}
                    href={`/foro?post=${post.id}`}
                    className="block rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {post.author?.avatar_url ? (
                          <img
                            src={post.author.avatar_url}
                            alt={post.author.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {post.author?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-white">
                            {post.author?.display_name || post.author?.username}
                          </span>
                          <span className="text-gray-500">@{post.author?.username}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {Object.values(post.reactions_count || {}).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {post.comments_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
