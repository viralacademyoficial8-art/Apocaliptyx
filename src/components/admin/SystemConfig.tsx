'use client';

import { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { useAdminStore, SystemConfig as SystemConfigType } from '@/stores/adminStore';

export function SystemConfig() {
  const { systemConfig, updateSystemConfig } = useAdminStore();
  const [local, setLocal] = useState<SystemConfigType | null>(systemConfig);

  useEffect(() => {
    setLocal(systemConfig);
  }, [systemConfig]);

  if (!local) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-gray-400">
        No hay configuración cargada.
      </div>
    );
  }

  const save = () => {
    updateSystemConfig(local);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-purple-300" />
          <h3 className="text-white font-semibold">General</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <label className="flex items-center gap-3 bg-gray-800/40 border border-gray-700 rounded-lg p-3">
            <input
              type="checkbox"
              checked={local.maintenanceMode}
              onChange={(e) => setLocal(s => s ? ({ ...s, maintenanceMode: e.target.checked }) : s)}
            />
            <span>Modo mantenimiento</span>
          </label>

          <label className="flex items-center gap-3 bg-gray-800/40 border border-gray-700 rounded-lg p-3">
            <input
              type="checkbox"
              checked={local.registrationEnabled}
              onChange={(e) => setLocal(s => s ? ({ ...s, registrationEnabled: e.target.checked }) : s)}
            />
            <span>Registro habilitado</span>
          </label>

          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Mensaje de mantenimiento</div>
            <input
              value={local.maintenanceMessage}
              onChange={(e) => setLocal(s => s ? ({ ...s, maintenanceMessage: e.target.value }) : s)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Economía</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <div className="text-xs text-gray-500 mb-1">Mín retiro</div>
            <input
              type="number"
              value={local.minWithdrawAmount}
              onChange={(e) => setLocal(s => s ? ({ ...s, minWithdrawAmount: Number(e.target.value) }) : s)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Máx retiro diario</div>
            <input
              type="number"
              value={local.maxDailyWithdraw}
              onChange={(e) => setLocal(s => s ? ({ ...s, maxDailyWithdraw: Number(e.target.value) }) : s)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Comisiones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <div className="text-xs text-gray-500 mb-1">Fee por robo (%)</div>
            <input
              type="number"
              value={local.stealFeePercent}
              onChange={(e) => setLocal(s => s ? ({ ...s, stealFeePercent: Number(e.target.value) }) : s)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Fee al ganador (%)</div>
            <input
              type="number"
              value={local.winnerFeePercent}
              onChange={(e) => setLocal(s => s ? ({ ...s, winnerFeePercent: Number(e.target.value) }) : s)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Bonificaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
          <div>
            <div className="text-xs text-gray-500 mb-1">Bonus diario</div>
            <input
              type="number"
              value={local.dailyBonusAmount}
              onChange={(e) => setLocal(s => s ? ({ ...s, dailyBonusAmount: Number(e.target.value) }) : s)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Bonus referido</div>
            <input
              type="number"
              value={local.referralBonus}
              onChange={(e) => setLocal(s => s ? ({ ...s, referralBonus: Number(e.target.value) }) : s)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Bonus nuevo usuario</div>
            <input
              type="number"
              value={local.newUserBonus}
              onChange={(e) => setLocal(s => s ? ({ ...s, newUserBonus: Number(e.target.value) }) : s)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Banner / Anuncios</h3>
        <div className="space-y-3 text-gray-300">
          <div className="text-xs text-gray-500">Mensaje</div>
          <input
            value={local.announcementBanner ?? ''}
            onChange={(e) => setLocal(s => s ? ({ ...s, announcementBanner: e.target.value || null }) : s)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="Ej: 🎄 Promo navideña..."
          />
          <div className="text-xs text-gray-500">Tipo</div>
          <select
            value={local.announcementType ?? ''}
            onChange={(e) => setLocal(s => s ? ({ ...s, announcementType: (e.target.value || null) as any }) : s)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="">(Sin tipo)</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="ERROR">ERROR</option>
          </select>

          <div className="mt-3 bg-gray-800/40 border border-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Preview</div>
            <div className="text-white">{local.announcementBanner ?? '—'}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
        >
          <Save className="w-4 h-4" /> Guardar cambios (mock)
        </button>
      </div>
    </div>
  );
}
