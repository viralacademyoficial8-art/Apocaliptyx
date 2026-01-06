'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Sparkles, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollectibleCard } from '@/components/collectibles/CollectibleCard';
import { CollectibleInventory } from '@/components/collectibles/CollectibleInventory';
import { useAuthStore } from '@/lib/stores';
import toast from 'react-hot-toast';

interface Collectible {
  id: string;
  name: string;
  nameEs: string;
  description?: string;
  type: 'frame' | 'effect' | 'background' | 'badge_style' | 'emoji_pack' | 'theme';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'exclusive';
  assetUrl: string;
  previewUrl?: string;
  apCost?: number;
  isTradeable: boolean;
  isLimited: boolean;
  maxSupply?: number;
  currentSupply: number;
  isOwned?: boolean;
  isEquipped?: boolean;
}

export default function ColeccionablesPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('store');
  const [storeItems, setStoreItems] = useState<Collectible[]>([]);
  const [inventory, setInventory] = useState<Collectible[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollectibles();
  }, []);

  const loadCollectibles = async () => {
    setIsLoading(true);
    // Mock data - replace with actual API call
    const mockStore: Collectible[] = [
      {
        id: '1',
        name: 'Golden Frame',
        nameEs: 'Marco Dorado',
        description: 'Un brillante marco dorado para tu avatar',
        type: 'frame',
        rarity: 'rare',
        assetUrl: '/collectibles/frames/golden.png',
        apCost: 500,
        isTradeable: true,
        isLimited: false,
        currentSupply: 0,
      },
      {
        id: '2',
        name: 'Diamond Frame',
        nameEs: 'Marco Diamante',
        description: 'Marco con destellos de diamante',
        type: 'frame',
        rarity: 'epic',
        assetUrl: '/collectibles/frames/diamond.png',
        apCost: 1500,
        isTradeable: true,
        isLimited: true,
        maxSupply: 100,
        currentSupply: 45,
      },
      {
        id: '3',
        name: 'Fire Effect',
        nameEs: 'Efecto Fuego',
        description: 'Llamas animadas alrededor de tu perfil',
        type: 'effect',
        rarity: 'legendary',
        assetUrl: '/collectibles/effects/fire.gif',
        apCost: 3000,
        isTradeable: true,
        isLimited: true,
        maxSupply: 50,
        currentSupply: 23,
      },
      {
        id: '4',
        name: 'Galaxy Background',
        nameEs: 'Fondo Galaxia',
        description: 'Un fondo cósmico para tu perfil',
        type: 'background',
        rarity: 'epic',
        assetUrl: '/collectibles/backgrounds/galaxy.png',
        apCost: 800,
        isTradeable: true,
        isLimited: false,
        currentSupply: 0,
      },
      {
        id: '5',
        name: 'Neon Frame',
        nameEs: 'Marco Neón',
        description: 'Marco con efecto neón brillante',
        type: 'frame',
        rarity: 'rare',
        assetUrl: '/collectibles/frames/neon.gif',
        apCost: 750,
        isTradeable: true,
        isLimited: false,
        currentSupply: 0,
      },
      {
        id: '6',
        name: 'Sparkle Effect',
        nameEs: 'Efecto Brillante',
        description: 'Destellos mágicos en tu perfil',
        type: 'effect',
        rarity: 'rare',
        assetUrl: '/collectibles/effects/sparkle.gif',
        apCost: 400,
        isTradeable: true,
        isLimited: false,
        currentSupply: 0,
      },
    ];

    const mockInventory: Collectible[] = [
      {
        id: '7',
        name: 'Starter Frame',
        nameEs: 'Marco Inicial',
        type: 'frame',
        rarity: 'common',
        assetUrl: '/collectibles/frames/starter.png',
        isTradeable: false,
        isLimited: false,
        currentSupply: 0,
        isOwned: true,
        isEquipped: true,
      },
    ];

    setStoreItems(mockStore);
    setInventory(mockInventory);
    setIsLoading(false);
  };

  const handlePurchase = async (collectibleId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    const item = storeItems.find((i) => i.id === collectibleId);
    if (!item) return;

    // Mock purchase - replace with actual API call
    toast.success(`¡Has comprado ${item.nameEs}!`);
    setInventory([...inventory, { ...item, isOwned: true }]);
  };

  const handleEquip = async (collectibleId: string) => {
    setInventory(
      inventory.map((item) => ({
        ...item,
        isEquipped: item.id === collectibleId,
      }))
    );
    toast.success('Coleccionable equipado');
  };

  const filteredStoreItems = storeItems.filter((item) => {
    if (searchQuery && !item.nameEs.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Coleccionables
          </h1>
          <p className="text-gray-400 mt-1">
            Personaliza tu perfil con marcos, efectos y fondos únicos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 border-gray-700 mb-6">
            <TabsTrigger value="store" className="data-[state=active]:bg-purple-600">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Tienda
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-purple-600">
              <Package className="w-4 h-4 mr-2" />
              Mi Inventario
            </TabsTrigger>
          </TabsList>

          {/* Store Tab */}
          <TabsContent value="store">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar coleccionables..."
                  className="pl-10 bg-gray-800 border-gray-700"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'frame', 'effect', 'background'].map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type)}
                    size="sm"
                    className={selectedType === type ? 'bg-purple-600' : 'border-gray-700'}
                  >
                    {type === 'all'
                      ? 'Todos'
                      : type === 'frame'
                      ? 'Marcos'
                      : type === 'effect'
                      ? 'Efectos'
                      : 'Fondos'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Store Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : filteredStoreItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredStoreItems.map((item) => (
                  <CollectibleCard
                    key={item.id}
                    collectible={item}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No hay coleccionables disponibles</p>
              </div>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <CollectibleInventory collectibles={inventory} onEquip={handleEquip} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
