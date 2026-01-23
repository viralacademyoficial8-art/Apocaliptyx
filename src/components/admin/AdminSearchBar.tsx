'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import {
  Search,
  X,
  Clock,
  Loader2,
  User,
  FileText,
  Flag,
  MessageSquare,
  Shield,
  TrendingUp,
  Flame
} from 'lucide-react';

interface UserResult {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  is_banned: boolean;
  ap_coins: number;
}

interface ScenarioResult {
  id: string;
  title: string;
  category: string;
  status: string;
  total_pool: number;
}

interface ReportResult {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter?: {
    username: string;
  };
}

interface ForumPostResult {
  id: string;
  title: string;
  category: string;
  author?: {
    username: string;
  };
}

export function AdminSearchBar() {
  const supabase = getSupabaseBrowser();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [localQuery, setLocalQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);
  const [reportResults, setReportResults] = useState<ReportResult[]>([]);
  const [forumResults, setForumResults] = useState<ForumPostResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Accesos rápidos del admin
  const quickActions = [
    { label: 'Usuarios baneados', query: 'banned:true', icon: Shield },
    { label: 'Escenarios activos', query: 'status:ACTIVE', icon: Flame },
    { label: 'Reportes pendientes', query: 'reports:pending', icon: Flag },
  ];

  // Cargar búsquedas recientes
  useEffect(() => {
    const saved = localStorage.getItem('adminRecentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    if (!localQuery.trim() || localQuery.length < 2) {
      setUserResults([]);
      setScenarioResults([]);
      setReportResults([]);
      setForumResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Búsqueda en paralelo en todas las entidades
        const [usersRes, scenariosRes, reportsRes, forumRes] = await Promise.all([
          // Usuarios
          supabase
            .from('users')
            .select('id, username, display_name, avatar_url, role, is_banned, ap_coins')
            .or(`username.ilike.%${localQuery}%,display_name.ilike.%${localQuery}%,email.ilike.%${localQuery}%`)
            .limit(5),

          // Escenarios
          supabase
            .from('scenarios')
            .select('id, title, category, status, total_pool')
            .or(`title.ilike.%${localQuery}%,description.ilike.%${localQuery}%`)
            .limit(5),

          // Reportes
          supabase
            .from('reports')
            .select('id, reason, status, created_at, reporter:users!reports_reporter_id_fkey(username)')
            .or(`reason.ilike.%${localQuery}%`)
            .limit(3),

          // Posts del foro
          supabase
            .from('forum_posts')
            .select('id, title, category, author:users!forum_posts_author_id_fkey(username)')
            .or(`title.ilike.%${localQuery}%,content.ilike.%${localQuery}%`)
            .limit(3)
        ]);

        setUserResults(usersRes.data || []);
        setScenarioResults(scenariosRes.data || []);
        // Transform reports data to match expected type
        const transformedReports = (reportsRes.data || []).map((r: any) => ({
          ...r,
          reporter: Array.isArray(r.reporter) ? r.reporter[0] : r.reporter
        }));
        setReportResults(transformedReports);
        // Transform forum posts data to match expected type
        const transformedPosts = (forumRes.data || []).map((p: any) => ({
          ...p,
          author: Array.isArray(p.author) ? p.author[0] : p.author
        }));
        setForumResults(transformedPosts);
      } catch (error) {
        console.error('Admin search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery]);

  // Guardar búsqueda reciente
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('adminRecentSearches', JSON.stringify(updated));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && localQuery.trim()) {
      saveRecentSearch(localQuery);
      setIsOpen(false);
      // Navegar a usuarios como búsqueda por defecto
      router.push(`/admin/usuarios?search=${encodeURIComponent(localQuery)}`);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    setUserResults([]);
    setScenarioResults([]);
    setReportResults([]);
    setForumResults([]);
    inputRef.current?.focus();
  };

  const navigateToUser = (userId: string) => {
    setIsOpen(false);
    saveRecentSearch(localQuery);
    router.push(`/admin/usuarios?userId=${userId}`);
  };

  const navigateToScenario = (scenarioId: string) => {
    setIsOpen(false);
    saveRecentSearch(localQuery);
    router.push(`/admin/escenarios?scenarioId=${scenarioId}`);
  };

  const navigateToReport = (reportId: string) => {
    setIsOpen(false);
    saveRecentSearch(localQuery);
    router.push(`/admin/reportes?reportId=${reportId}`);
  };

  const navigateToForumPost = (postId: string) => {
    setIsOpen(false);
    saveRecentSearch(localQuery);
    router.push(`/admin/foro?postId=${postId}`);
  };

  const handleQuickAction = (query: string) => {
    setIsOpen(false);
    if (query === 'banned:true') {
      router.push('/admin/usuarios?filter=banned');
    } else if (query === 'status:ACTIVE') {
      router.push('/admin/escenarios?status=ACTIVE');
    } else if (query === 'reports:pending') {
      router.push('/admin/reportes?status=PENDING');
    }
  };

  const handleRecentSearch = (search: string) => {
    setLocalQuery(search);
    setIsOpen(false);
    router.push(`/admin/usuarios?search=${encodeURIComponent(search)}`);
  };

  const hasResults = userResults.length > 0 || scenarioResults.length > 0 ||
                     reportResults.length > 0 || forumResults.length > 0;

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-500/20 text-red-400',
      ADMIN: 'bg-purple-500/20 text-purple-400',
      MODERATOR: 'bg-blue-500/20 text-blue-400',
      STAFF: 'bg-green-500/20 text-green-400',
      USER: 'bg-gray-500/20 text-muted-foreground',
    };
    return colors[role] || colors.USER;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-500/20 text-green-400',
      DRAFT: 'bg-yellow-500/20 text-yellow-400',
      RESOLVED: 'bg-blue-500/20 text-blue-400',
      CLOSED: 'bg-purple-500/20 text-purple-400',
      CANCELLED: 'bg-gray-500/20 text-muted-foreground',
      PENDING: 'bg-orange-500/20 text-orange-400',
    };
    return colors[status] || 'bg-gray-500/20 text-muted-foreground';
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar usuarios, escenarios, reportes..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-8 w-72 bg-muted border-border focus-visible:ring-purple-500"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden w-[400px] max-h-[500px] overflow-y-auto"
        >
          {/* Resultados de búsqueda */}
          {localQuery.length >= 2 && (
            <div className="border-b border-border">
              {isSearching ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                </div>
              ) : hasResults ? (
                <div className="divide-y divide-border">
                  {/* Usuarios */}
                  {userResults.length > 0 && (
                    <div className="p-3">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                        <User className="w-3 h-3" />
                        Usuarios ({userResults.length})
                      </span>
                      {userResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => navigateToUser(user.id)}
                          className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                            {user.avatar_url ? (
                              <Image
                                src={user.avatar_url}
                                alt={user.username}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="text-white text-xs font-bold">
                                {user.username[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium line-clamp-1 flex items-center gap-2">
                              {user.display_name || user.username}
                              {user.is_banned && (
                                <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">Baneado</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              @{user.username}
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${getRoleBadge(user.role)}`}>
                                {user.role}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-yellow-400 font-medium">
                            {user.ap_coins.toLocaleString()} AP
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Escenarios */}
                  {scenarioResults.length > 0 && (
                    <div className="p-3">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                        <FileText className="w-3 h-3" />
                        Escenarios ({scenarioResults.length})
                      </span>
                      {scenarioResults.map((scenario) => (
                        <button
                          key={scenario.id}
                          onClick={() => navigateToScenario(scenario.id)}
                          className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium line-clamp-1">{scenario.title}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                {scenario.category}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${getStatusBadge(scenario.status)}`}>
                                  {scenario.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-yellow-400 font-medium flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              {(scenario.total_pool || 0).toLocaleString()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reportes */}
                  {reportResults.length > 0 && (
                    <div className="p-3">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                        <Flag className="w-3 h-3" />
                        Reportes ({reportResults.length})
                      </span>
                      {reportResults.map((report) => (
                        <button
                          key={report.id}
                          onClick={() => navigateToReport(report.id)}
                          className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted transition-colors"
                        >
                          <div className="font-medium line-clamp-1">{report.reason}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            por @{report.reporter?.username || 'Anónimo'}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${getStatusBadge(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Posts del Foro */}
                  {forumResults.length > 0 && (
                    <div className="p-3">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                        <MessageSquare className="w-3 h-3" />
                        Posts del Foro ({forumResults.length})
                      </span>
                      {forumResults.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => navigateToForumPost(post.id)}
                          className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted transition-colors"
                        >
                          <div className="font-medium line-clamp-1">{post.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {post.category} · por @{post.author?.username || 'Anónimo'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No se encontraron resultados para "{localQuery}"
                </p>
              )}
            </div>
          )}

          {/* Búsquedas recientes */}
          {recentSearches.length > 0 && !localQuery && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Búsquedas recientes
                </span>
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('adminRecentSearches');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 5).map((searchText, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecentSearch(searchText)}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-muted-foreground" />
                    {searchText}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          {!localQuery && (
            <div className="p-3">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                <TrendingUp className="w-3 h-3" />
                Accesos rápidos
              </span>
              <div className="space-y-1">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action.query)}
                      className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4 text-purple-400" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
