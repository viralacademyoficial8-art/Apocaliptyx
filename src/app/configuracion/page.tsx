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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Si no hay sesión, mostrar loading (mientras redirige)
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent-primary/20 rounded-lg">
              <Settings className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Configuración</h1>
              <p className="text-muted-foreground">
                Gestiona tu cuenta y preferencias
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Section Selector */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {sections.find((s) => s.id === activeSection)?.icon && (
                <div className="text-accent">
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
            <div className="mt-2 bg-card border border-border rounded-lg overflow-hidden">
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
                          ? 'bg-accent-primary/20 text-accent'
                          : 'hover:bg-muted'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-sm text-muted-foreground">
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
                          ? 'bg-accent-primary/20 text-accent border-l-4 border-accent'
                          : 'hover:bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-muted-foreground">
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
            <div className="bg-card/50 border border-border rounded-lg p-6 md:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
