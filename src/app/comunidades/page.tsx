'use client';

import { useState, useEffect } from 'react';
import { Users, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { CreateCommunityModal } from '@/components/communities/CreateCommunityModal';
import { useAuthStore } from '@/lib/stores';
import toast from 'react-hot-toast';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
  themeColor: string;
  isPublic: boolean;
  isVerified: boolean;
  membersCount: number;
  postsCount: number;
  categories: string[];
  isMember?: boolean;
}

export default function ComunidadesPage() {
  const { user } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined' | 'popular'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, [filter]);

  const loadCommunities = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'popular') params.set('sort', 'popular');
      if (filter === 'joined') params.set('filter', 'joined');

      const response = await fetch(`/api/communities?${params.toString()}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setCommunities(data.communities || []);
    } catch (error) {
      console.error('Error loading communities:', error);
      toast.error('Error al cargar comunidades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setCommunities(communities.map(c =>
        c.id === communityId
          ? { ...c, isMember: true, membersCount: c.membersCount + 1 }
          : c
      ));
      toast.success('Te has unido a la comunidad');
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Error al unirse a la comunidad');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setCommunities(communities.map(c =>
        c.id === communityId
          ? { ...c, isMember: false, membersCount: Math.max(0, c.membersCount - 1) }
          : c
      ));
      toast.success('Has salido de la comunidad');
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error('Error al salir de la comunidad');
    }
  };

  const handleCreateCommunity = async (data: {
    name: string;
    description: string;
    isPublic: boolean;
    requiresApproval: boolean;
    categories: string[];
    themeColor: string;
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.error) {
        toast.error(result.error);
        return false;
      }

      toast.success(`Comunidad "${data.name}" creada exitosamente`);
      loadCommunities();
      return true;
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Error al crear la comunidad');
      return false;
    }
  };

  const filteredCommunities = communities.filter((community) => {
    if (searchQuery && !community.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const sortedCommunities = [...filteredCommunities].sort((a, b) => {
    if (filter === 'popular') {
      return b.membersCount - a.membersCount;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-400" />
              Comunidades
            </h1>
            <p className="text-gray-400 mt-1">
              Únete a comunidades de predicciones y comparte con otros profetas
            </p>
          </div>
          {user && <CreateCommunityModal onCreateCommunity={handleCreateCommunity} />}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar comunidades..."
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-purple-600' : 'border-gray-700'}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'joined' ? 'default' : 'outline'}
              onClick={() => setFilter('joined')}
              className={filter === 'joined' ? 'bg-purple-600' : 'border-gray-700'}
            >
              Mis comunidades
            </Button>
            <Button
              variant={filter === 'popular' ? 'default' : 'outline'}
              onClick={() => setFilter('popular')}
              className={filter === 'popular' ? 'bg-purple-600' : 'border-gray-700'}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Populares
            </Button>
          </div>
        </div>

        {/* Communities Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : sortedCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                isMember={community.isMember || false}
                onJoin={handleJoinCommunity}
                onLeave={handleLeaveCommunity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No se encontraron comunidades</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="text-purple-400 mt-2"
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
