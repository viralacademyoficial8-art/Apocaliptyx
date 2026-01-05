'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScenarioCard } from '@/components/ScenarioCard';
import { scenariosService, ScenarioFromDB } from '@/services/scenarios.service';
import { Loader2 } from 'lucide-react';

type ProfileTabsProps = {
  user: User;
};

// Helper para convertir ScenarioFromDB al formato esperado por ScenarioCard
function mapScenarioFromDB(s: ScenarioFromDB) {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category as any,
    status: s.status.toLowerCase() as any,
    createdAt: s.created_at,
    dueDate: s.resolution_date,
    totalPot: s.total_pool,
    currentPrice: s.min_bet,
    votes: {
      yes: s.yes_pool,
      no: s.no_pool,
    },
    creatorId: s.creator_id,
    currentHolderId: s.creator_id,
  };
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'activos' | 'historial'>('activos');
  const [scenarios, setScenarios] = useState<ScenarioFromDB[]>([]);
  const [loading, setLoading] = useState(true);

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
        onValueChange={(val) => setActiveTab(val as 'activos' | 'historial')}
        className="w-full"
      >
        {/* Tabs responsive */}
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
            Escenarios activos
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
            Historial
          </TabsTrigger>
        </TabsList>

        {/* TAB: ACTIVOS */}
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

        {/* TAB: HISTORIAL */}
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
      </Tabs>
    </div>
  );
}
