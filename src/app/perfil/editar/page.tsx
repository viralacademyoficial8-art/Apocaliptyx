'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import { EditProfileForm } from '@/components/perfil/EditProfileForm';

export default function EditarPerfilPage() {
  const { currentProfile } = useProfileStore();

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/perfil"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white">Editar perfil</h1>
          <p className="text-gray-400 mt-1">
            Ajusta tu nombre, bio y links. Que se vea nivel “apocalipsis premium”.
          </p>

          <div className="mt-6">
            <EditProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}
