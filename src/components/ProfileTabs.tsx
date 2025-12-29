'use client';

import { useState } from 'react';
import type { User } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScenarioCard } from '@/components/ScenarioCard';
import { mockScenarios } from '@/lib/mock-data';

type ProfileTabsProps = {
  user: User;
};

export function ProfileTabs({ user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'activos' | 'historial'>('activos');

  // 🔹 Por ahora usamos mockScenarios (luego filtramos por user.id / username)
  const escenariosActivos = mockScenarios.slice(0, 4);
  const escenariosHistorial = mockScenarios.slice(4);

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
                <ScenarioCard key={scenario.id} scenario={scenario} />
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
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
