import { ScenarioModeration } from '@/components/admin';

export default function EscenariosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Moderación de Escenarios</h1>
      <ScenarioModeration />
    </div>
  );
}
