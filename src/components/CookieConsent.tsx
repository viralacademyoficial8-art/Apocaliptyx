'use client';

import { useState } from 'react';
import { X, Cookie, Shield, BarChart3, Target, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';
import { cn } from '@/lib/utils';

export function CookieConsent() {
  const {
    showBanner,
    preferences,
    acceptAll,
    acceptNecessary,
    savePreferences,
    setShowBanner,
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [customPreferences, setCustomPreferences] = useState<CookiePreferences>(preferences);

  if (!showBanner) return null;

  const handleSaveCustom = () => {
    savePreferences(customPreferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setCustomPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const cookieTypes = [
    {
      key: 'necessary' as const,
      icon: Shield,
      title: 'Cookies Necesarias',
      description: 'Esenciales para el funcionamiento del sitio. Incluyen autenticacion, seguridad y preferencias basicas.',
      required: true,
    },
    {
      key: 'analytics' as const,
      icon: BarChart3,
      title: 'Cookies de Analisis',
      description: 'Nos ayudan a entender como usas el sitio para mejorar tu experiencia.',
      required: false,
    },
    {
      key: 'marketing' as const,
      icon: Target,
      title: 'Cookies de Marketing',
      description: 'Utilizadas para mostrarte anuncios relevantes basados en tus intereses.',
      required: false,
    },
    {
      key: 'preferences' as const,
      icon: Settings2,
      title: 'Cookies de Preferencias',
      description: 'Recuerdan tus configuraciones como idioma, tema y otras preferencias.',
      required: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 rounded-xl">
                <Cookie className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Tu Privacidad Importa</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Configuracion de cookies</p>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-foreground text-sm leading-relaxed mb-4">
            Usamos cookies para mejorar tu experiencia, analizar el trafico y personalizar contenido.
            Puedes aceptar todas las cookies, solo las necesarias, o personalizar tu seleccion.
          </p>

          {/* Toggle Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium mb-4 transition-colors"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ocultar detalles
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver detalles y personalizar
              </>
            )}
          </button>

          {/* Cookie Details */}
          {showDetails && (
            <div className="space-y-3 mb-6 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto pr-1 animate-in slide-in-from-top-2 duration-200">
              {cookieTypes.map((type) => {
                const Icon = type.icon;
                const isEnabled = type.required || customPreferences[type.key];

                return (
                  <div
                    key={type.key}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-200',
                      isEnabled
                        ? 'bg-muted/50 border-purple-500/30'
                        : 'bg-muted/30 border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          isEnabled ? 'bg-purple-500/20' : 'bg-muted/50'
                        )}>
                          <Icon className={cn(
                            'w-4 h-4',
                            isEnabled ? 'text-purple-400' : 'text-muted-foreground'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white text-sm">{type.title}</h3>
                            {type.required && (
                              <span className="px-2 py-0.5 text-xs bg-muted text-foreground rounded-full">
                                Requerida
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => togglePreference(type.key)}
                        disabled={type.required}
                        className={cn(
                          'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
                          type.required && 'cursor-not-allowed opacity-60',
                          isEnabled ? 'bg-purple-500' : 'bg-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                            isEnabled && 'translate-x-5'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={acceptNecessary}
              className="flex-1 px-4 py-3 text-sm font-medium text-foreground bg-muted hover:bg-muted border border-border rounded-xl transition-colors"
            >
              Solo Necesarias
            </button>
            {showDetails ? (
              <button
                onClick={handleSaveCustom}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
              >
                Guardar Preferencias
              </button>
            ) : (
              <button
                onClick={acceptAll}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
              >
                Aceptar Todas
              </button>
            )}
          </div>

          {/* Privacy Policy Link */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Al continuar navegando, aceptas nuestros{' '}
            <a href="/terminos-y-condiciones" className="text-purple-400 hover:text-purple-300 underline">
              Terminos de Servicio
            </a>{' '}
            y{' '}
            <a href="/privacidad" className="text-purple-400 hover:text-purple-300 underline">
              Politica de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
