'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { usersService } from '@/services';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Users,
  Search,
  Trophy,
  TrendingUp,
  Flame,
  Target,
  Award,
  Loader2,
  AlertCircle,
  UserPlus,
  Filter,
  LayoutGrid,
  List,
  Crown,
  Medal,
} from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  ap_coins: number;
  level: number;
  total_predictions: number;
  correct_predictions: number;
  total_earnings: number;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
}

type SortOption = 'ap_coins' | 'level' | 'recent' | 'predictions';
type ViewMode = 'grid' | 'list';

export default function ComunidadPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('ap_coins');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all users
  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true);
        const data = await usersService.getLeaderboard(100);
        setUsers(data);
        setFilteredUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Error al cargar los usuarios');
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  // Filter and sort users
  useEffect(() => {
    let result = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          (u.display_name && u.display_name.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'ap_coins':
          return b.ap_coins - a.ap_coins;
        case 'level':
          return b.level - a.level;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'predictions':
          return b.correct_predictions - a.correct_predictions;
        default:
          return 0;
      }
    });

    setFilteredUsers(result);
  }, [users, searchQuery, sortBy]);

  // Stats
  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.is_verified).length;
  const premiumUsers = users.filter((u) => u.is_premium).length;
  const avgLevel = users.length > 0
    ? (users.reduce((sum, u) => sum + u.level, 0) / users.length).toFixed(1)
    : '0';

  const sortOptions = [
    { id: 'ap_coins' as SortOption, label: 'AP Coins', icon: Award, color: 'text-yellow-400' },
    { id: 'level' as SortOption, label: 'Nivel', icon: Flame, color: 'text-orange-400' },
    { id: 'predictions' as SortOption, label: 'Aciertos', icon: Target, color: 'text-green-400' },
    { id: 'recent' as SortOption, label: 'Recientes', icon: UserPlus, color: 'text-blue-400' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando comunidad...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Comunidad</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Conoce a todos los profetas de Apocaliptyx
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/leaderboard')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Ver Rankings</span>
          </button>
        </header>

        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-muted-foreground">Total Profetas</span>
            </div>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 flex items-center justify-center text-blue-400">✓</span>
              <span className="text-xs text-muted-foreground">Verificados</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{verifiedUsers}</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 flex items-center justify-center text-yellow-400">★</span>
              <span className="text-xs text-muted-foreground">Premium</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{premiumUsers}</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-muted-foreground">Nivel Promedio</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">{avgLevel}</div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre o username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Sort Options */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-muted border-border'
                      : 'bg-card border-border hover:border-border'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? option.color : 'text-muted-foreground'}`} />
                  <span className={isActive ? 'text-white' : 'text-muted-foreground'}>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-muted text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-muted text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredUsers.length} de {totalUsers} profetas
        </div>

        {/* Users Grid/List */}
        {viewMode === 'grid' ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUsers.map((user, index) => {
              const winRate = user.total_predictions > 0
                ? ((user.correct_predictions / user.total_predictions) * 100).toFixed(1)
                : '0.0';
              const globalRank = users.findIndex((u) => u.id === user.id) + 1;

              return (
                <div
                  key={user.id}
                  onClick={() => router.push(`/perfil/${user.username}`)}
                  className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-border hover:bg-muted/50 transition-all group"
                >
                  {/* Top Badge for Top 3 */}
                  {globalRank <= 3 && (
                    <div className="flex justify-end mb-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                        globalRank === 1
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : globalRank === 2
                            ? 'bg-gray-400/20 text-foreground'
                            : 'bg-amber-600/20 text-amber-500'
                      }`}>
                        {globalRank === 1 ? <Crown className="w-3 h-3" /> : <Medal className="w-3 h-3" />}
                        Top #{globalRank}
                      </div>
                    </div>
                  )}

                  {/* Avatar and Info */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.display_name || user.username}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-800 group-hover:ring-purple-500/30 transition-all"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-gray-800 group-hover:ring-purple-500/30 transition-all">
                          {(user.display_name || user.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Level Badge */}
                      <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-purple-600 rounded-full text-xs font-bold">
                        Lvl {user.level}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {user.display_name || user.username}
                      </span>
                      {user.is_verified && (
                        <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-white">✓</span>
                        </span>
                      )}
                      {user.is_premium && (
                        <span className="text-yellow-400 text-sm">★</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">@{user.username}</div>

                    {/* Stats */}
                    <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-border">
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold text-sm">{user.ap_coins.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">AP Coins</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold text-sm ${
                          parseFloat(winRate) >= 60 ? 'text-green-400' :
                          parseFloat(winRate) >= 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {winRate}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <section className="space-y-2">
            {filteredUsers.map((user, index) => {
              const winRate = user.total_predictions > 0
                ? ((user.correct_predictions / user.total_predictions) * 100).toFixed(1)
                : '0.0';
              const globalRank = users.findIndex((u) => u.id === user.id) + 1;

              return (
                <div
                  key={user.id}
                  onClick={() => router.push(`/perfil/${user.username}`)}
                  className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-border hover:bg-muted/50 transition-all flex items-center gap-4"
                >
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    globalRank === 1
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : globalRank === 2
                        ? 'bg-gray-400/20 text-foreground'
                        : globalRank === 3
                          ? 'bg-amber-600/20 text-amber-500'
                          : 'bg-muted text-muted-foreground'
                  }`}>
                    #{globalRank}
                  </div>

                  {/* Avatar */}
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.display_name || user.username}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {(user.display_name || user.username).charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">
                        {user.display_name || user.username}
                      </span>
                      {user.is_verified && (
                        <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-white">✓</span>
                        </span>
                      )}
                      {user.is_premium && (
                        <span className="text-yellow-400 text-sm">★</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-purple-400 font-bold">Lvl {user.level}</div>
                      <div className="text-[10px] text-muted-foreground">Nivel</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold">{user.ap_coins.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">AP Coins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-bold">{user.correct_predictions}/{user.total_predictions}</div>
                      <div className="text-[10px] text-muted-foreground">Aciertos</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${
                        parseFloat(winRate) >= 60 ? 'text-green-400' :
                        parseFloat(winRate) >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {winRate}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">Win Rate</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-muted-foreground">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* No Results */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-card/50 rounded-xl border border-border">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron profetas</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-sm text-purple-400 hover:text-purple-300"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
