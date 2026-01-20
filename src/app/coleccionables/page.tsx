'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Sparkles, Search } from 'lucide-react';
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
  const { user, refreshBalance } = useAuthStore();
  const [activeTab, setActiveTab] = useState('store');
  const [storeItems, setStoreItems] = useState<Collectible[]>([]);
  const [inventory, setInventory] = useState<Collectible[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollectibles();
  }, [activeTab]);

  const loadCollectibles = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'store') {
        const response = await fetch('/api/collectibles?type=store');
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setStoreItems(data.collectibles || []);
      } else {
        const response = await fetch('/api/collectibles?type=inventory');
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setInventory(data.collectibles || []);
      }
    } catch (error) {
      console.error('Error loading collectibles:', error);
      toast.error('Error al cargar coleccionables');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (collectibleId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    const item = storeItems.find((i) => i.id === collectibleId);
    if (!item) return;

    try {
      const response = await fetch('/api/collectibles/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectibleId }),
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      toast.success(`¡Has comprado ${item.nameEs}!`);
      // Reload both store and inventory
      loadCollectibles();
      // Actualizar balance de AP coins
      await refreshBalance();
    } catch (error: unknown) {
      console.error('Error purchasing collectible:', error);
      toast.error(error instanceof Error ? error.message : 'Error al comprar');
    }
  };

  const handleEquip = async (collectibleId: string) => {
    try {
      const response = await fetch('/api/collectibles/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectibleId }),
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setInventory(
        inventory.map((item) => ({
          ...item,
          isEquipped: item.id === collectibleId ? true :
            (item.type === inventory.find(i => i.id === collectibleId)?.type ? false : item.isEquipped),
        }))
      );
      toast.success('Coleccionable equipado');
    } catch (error) {
      console.error('Error equipping collectible:', error);
      toast.error('Error al equipar');
    }
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
    <div className="min-h-screen bg-background text-foreground pb-20">
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
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : (
              <CollectibleInventory collectibles={inventory} onEquip={handleEquip} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
