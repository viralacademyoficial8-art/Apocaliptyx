'use client';

import { useState, useEffect } from 'react';
import { Users, Search, TrendingUp, Plus, Filter } from 'lucide-react';
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
}

export default function ComunidadesPage() {
  const { user } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined' | 'popular'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setIsLoading(true);
    // Mock data - replace with actual API call
    const mockCommunities: Community[] = [
      {
        id: '1',
        name: 'Crypto Traders',
        slug: 'crypto-traders',
        description: 'Comunidad para traders de criptomonedas. Predicciones diarias de Bitcoin, Ethereum y altcoins.',
        themeColor: '#F7931A',
        isPublic: true,
        isVerified: true,
        membersCount: 15420,
        postsCount: 8934,
        categories: ['Crypto', 'Economía'],
      },
      {
        id: '2',
        name: 'Fútbol España',
        slug: 'futbol-espana',
        description: 'La mejor comunidad para predicciones de La Liga, Champions y selección española.',
        themeColor: '#EF4444',
        isPublic: true,
        isVerified: true,
        membersCount: 28750,
        postsCount: 45230,
        categories: ['Deportes'],
      },
      {
        id: '3',
        name: 'Tech Predictions',
        slug: 'tech-predictions',
        description: 'Predicciones sobre tecnología, startups, lanzamientos de productos y más.',
        themeColor: '#8B5CF6',
        isPublic: true,
        isVerified: false,
        membersCount: 5680,
        postsCount: 2340,
        categories: ['Tecnología'],
      },
      {
        id: '4',
        name: 'Gaming Esports',
        slug: 'gaming-esports',
        description: 'Comunidad de esports y gaming. Predicciones de torneos de LoL, CS2, Valorant y más.',
        themeColor: '#22C55E',
        isPublic: true,
        isVerified: true,
        membersCount: 12300,
        postsCount: 18900,
        categories: ['Gaming', 'Entretenimiento'],
      },
    ];

    setCommunities(mockCommunities);
    setMyCommunities(['1', '4']); // Mock joined communities
    setIsLoading(false);
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }
    setMyCommunities([...myCommunities, communityId]);
    toast.success('Te has unido a la comunidad');
  };

  const handleLeaveCommunity = async (communityId: string) => {
    setMyCommunities(myCommunities.filter((id) => id !== communityId));
    toast.success('Has salido de la comunidad');
  };

  const handleCreateCommunity = async (data: {
    name: string;
    description: string;
    isPublic: boolean;
    requiresApproval: boolean;
    categories: string[];
    themeColor: string;
  }) => {
    toast.success(`Comunidad "${data.name}" creada exitosamente`);
    loadCommunities();
  };

  const filteredCommunities = communities.filter((community) => {
    if (searchQuery && !community.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filter === 'joined' && !myCommunities.includes(community.id)) {
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
                isMember={myCommunities.includes(community.id)}
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
