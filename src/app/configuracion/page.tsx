'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { ConfigProfile } from '@/components/ConfigProfile';
import { ConfigNotifications } from '@/components/ConfigNotifications';
import { ConfigSecurity } from '@/components/ConfigSecurity';
import { ConfigAppearance } from '@/components/ConfigAppearance';
import { Button } from '@/components/ui/button';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  ArrowLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

type ConfigSection = 'profile' | 'notifications' | 'security' | 'appearance';

export default function ConfiguracionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<ConfigSection>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirigir si no está autenticado (después de que cargue la sesión)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Si no hay sesión, mostrar loading (mientras redirige)
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const sections = [
    {
      id: 'profile' as ConfigSection,
      label: 'Perfil',
      icon: User,
      description: 'Tu información personal',
    },
    {
      id: 'notifications' as ConfigSection,
      label: 'Notificaciones',
      icon: Bell,
      description: 'Preferencias de alertas',
    },
    {
      id: 'security' as ConfigSection,
      label: 'Seguridad',
      icon: Shield,
      description: 'Contraseña y sesiones',
    },
    {
      id: 'appearance' as ConfigSection,
      label: 'Apariencia',
      icon: Palette,
      description: 'Tema y colores',
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ConfigProfile />;
      case 'notifications':
        return <ConfigNotifications />;
      case 'security':
        return <ConfigSecurity />;
      case 'appearance':
        return <ConfigAppearance />;
      default:
        return <ConfigProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Settings className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Configuración</h1>
              <p className="text-gray-400">
                Gestiona tu cuenta y preferencias
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Section Selector */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {sections.find((s) => s.id === activeSection)?.icon && (
                <div className="text-purple-400">
                  {(() => {
                    const Icon =
                      sections.find((s) => s.id === activeSection)!.icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
              )}
              <span className="font-semibold">
                {sections.find((s) => s.id === activeSection)?.label}
              </span>
            </div>
            <ChevronRight
              className={`w-5 h-5 transition-transform ${
                isMobileMenuOpen ? 'rotate-90' : ''
              }`}
            />
          </button>

          {isMobileMenuOpen && (
            <div className="mt-2 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 p-4 text-left transition-colors
                      ${
                        activeSection === section.id
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-sm text-gray-500">
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Desktop only */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <nav className="space-y-2 sticky top-24">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                      ${
                        activeSection === section.id
                          ? 'bg-purple-500/20 text-purple-400 border-l-4 border-purple-500'
                          : 'hover:bg-gray-800/50 text-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-gray-500">
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 md:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}