'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Skull,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Flame,
  Users,
  Target,
  TrendingUp,
} from 'lucide-react';

type FooterDict = {
  description: string;

  headings: {
    plataforma: string;
    soporte: string;
    legal: string;
    empresa: string;
  };

  labels: {
    bolsaTotal: string;
    profetas: string;
    escenarios: string;
    predicciones: string;
    newsletterTitle: string;
    newsletterSubtitle: string;
    newsletterPlaceholder: string;
    newsletterButton: string;
    rights: string;
    madeWith: string;
    global: string;
    version: string;
  };

  links: {
    plataforma: Array<{ href: string; label: string }>;
    soporte: Array<{ href: string; label: string }>;
    legal: Array<{ href: string; label: string }>;
    empresa: Array<{ href: string; label: string }>;
    compact: Array<{ href: string; label: string }>;
  };
};

const DICT: Record<string, FooterDict> = {
  es: {
    description:
      'La plataforma de predicciones donde los profetas digitales compiten por demostrar quién puede ver el futuro. ¿Tienes lo que se necesita?',
    headings: { plataforma: 'Plataforma', soporte: 'Soporte', legal: 'Legal', empresa: 'Empresa' },
    labels: {
      bolsaTotal: 'AP Coins en Juego',
      profetas: 'Profetas',
      escenarios: 'Escenarios',
      predicciones: 'Predicciones',
      newsletterTitle: 'Suscríbete a nuestro newsletter',
      newsletterSubtitle: 'Recibe las mejores predicciones y novedades directamente en tu correo.',
      newsletterPlaceholder: 'tu@email.com',
      newsletterButton: 'Suscribirse',
      rights: 'Todos los derechos reservados.',
      madeWith: 'Hecho con',
      global: 'para profetas de todo el mundo',
      version: 'v1.0.0',
    },
    links: {
      plataforma: [
        { href: '/dashboard', label: 'Escenarios' },
        { href: '/leaderboard', label: 'Leaderboard' },
        { href: '/tienda', label: 'Tienda' },
        { href: '/foro', label: 'Comunidad' },
        { href: '/crear', label: 'Crear Escenario' },
      ],
      soporte: [
        { href: '/ayuda', label: 'Centro de Ayuda' },
        { href: '/faq', label: 'Preguntas Frecuentes' },
        { href: '/soporte', label: 'Soporte Técnico' },
        { href: '/reportar', label: 'Reportar Problema' },
      ],
      legal: [
        { href: '/terminos-y-condiciones', label: 'Términos de Servicio' },
        { href: '/politica-de-privacidad', label: 'Política de Privacidad' },
        { href: '/cookies', label: 'Política de Cookies' },
        { href: '/reglas', label: 'Reglas de la Comunidad' },
      ],
      empresa: [
        { href: '/about', label: 'Sobre Nosotros' },
        { href: '/blog', label: 'Blog' },
        { href: '/prensa', label: 'Prensa' },
        { href: '/careers', label: 'Trabaja con Nosotros' },
      ],
      compact: [
        { href: '/terminos-y-condiciones', label: 'Términos' },
        { href: '/politica-de-privacidad', label: 'Privacidad' },
        { href: '/soporte', label: 'Soporte' },
      ],
    },
  },

  en: {
    description:
      'The prediction platform where digital prophets compete to prove who can see the future. Do you have what it takes?',
    headings: { plataforma: 'Platform', soporte: 'Support', legal: 'Legal', empresa: 'Company' },
    labels: {
      bolsaTotal: 'AP Coins in Play',
      profetas: 'Prophets',
      escenarios: 'Scenarios',
      predicciones: 'Predictions',
      newsletterTitle: 'Subscribe to our newsletter',
      newsletterSubtitle: 'Get the best predictions and updates straight to your inbox.',
      newsletterPlaceholder: 'you@email.com',
      newsletterButton: 'Subscribe',
      rights: 'All rights reserved.',
      madeWith: 'Made with',
      global: 'for prophets worldwide',
      version: 'v1.0.0',
    },
    links: {
      plataforma: [
        { href: '/dashboard', label: 'Scenarios' },
        { href: '/leaderboard', label: 'Leaderboard' },
        { href: '/tienda', label: 'Shop' },
        { href: '/foro', label: 'Community' },
        { href: '/crear', label: 'Create Scenario' },
      ],
      soporte: [
        { href: '/ayuda', label: 'Help Center' },
        { href: '/faq', label: 'FAQ' },
        { href: '/soporte', label: 'Technical Support' },
        { href: '/reportar', label: 'Report an Issue' },
      ],
      legal: [
        { href: '/terminos-y-condiciones', label: 'Terms of Service' },
        { href: '/politica-de-privacidad', label: 'Privacy Policy' },
        { href: '/cookies', label: 'Cookie Policy' },
        { href: '/reglas', label: 'Community Rules' },
      ],
      empresa: [
        { href: '/about', label: 'About Us' },
        { href: '/blog', label: 'Blog' },
        { href: '/prensa', label: 'Press' },
        { href: '/careers', label: 'Careers' },
      ],
      compact: [
        { href: '/terminos-y-condiciones', label: 'Terms' },
        { href: '/politica-de-privacidad', label: 'Privacy' },
        { href: '/soporte', label: 'Support' },
      ],
    },
  },

  pt: {
    description:
      'A plataforma de previsões onde profetas digitais competem para provar quem vê o futuro. Você tem o que é preciso?',
    headings: { plataforma: 'Plataforma', soporte: 'Suporte', legal: 'Legal', empresa: 'Empresa' },
    labels: {
      bolsaTotal: 'AP Coins em Jogo',
      profetas: 'Profetas',
      escenarios: 'Cenários',
      predicciones: 'Previsões',
      newsletterTitle: 'Assine nossa newsletter',
      newsletterSubtitle: 'Receba as melhores previsões e novidades no seu e-mail.',
      newsletterPlaceholder: 'seu@email.com',
      newsletterButton: 'Assinar',
      rights: 'Todos os direitos reservados.',
      madeWith: 'Feito com',
      global: 'para profetas do mundo todo',
      version: 'v1.0.0',
    },
    links: {
      plataforma: [
        { href: '/dashboard', label: 'Cenários' },
        { href: '/leaderboard', label: 'Ranking' },
        { href: '/tienda', label: 'Loja' },
        { href: '/foro', label: 'Comunidade' },
        { href: '/crear', label: 'Criar Cenário' },
      ],
      soporte: [
        { href: '/ayuda', label: 'Central de Ajuda' },
        { href: '/faq', label: 'Perguntas Frequentes' },
        { href: '/soporte', label: 'Suporte Técnico' },
        { href: '/reportar', label: 'Reportar Problema' },
      ],
      legal: [
        { href: '/terminos-y-condiciones', label: 'Termos de Serviço' },
        { href: '/politica-de-privacidad', label: 'Política de Privacidade' },
        { href: '/cookies', label: 'Política de Cookies' },
        { href: '/reglas', label: 'Regras da Comunidade' },
      ],
      empresa: [
        { href: '/about', label: 'Sobre Nós' },
        { href: '/blog', label: 'Blog' },
        { href: '/prensa', label: 'Imprensa' },
        { href: '/careers', label: 'Carreiras' },
      ],
      compact: [
        { href: '/terminos-y-condiciones', label: 'Termos' },
        { href: '/politica-de-privacidad', label: 'Privacidade' },
        { href: '/soporte', label: 'Suporte' },
      ],
    },
  },

  fr: {
    description:
      "La plateforme de prédictions où les prophètes numériques se battent pour prouver qui voit l'avenir. Es-tu prêt ?",
    headings: { plataforma: 'Plateforme', soporte: 'Support', legal: 'Mentions', empresa: 'Entreprise' },
    labels: {
      bolsaTotal: 'AP Coins en Jeu',
      profetas: 'Prophètes',
      escenarios: 'Scénarios',
      predicciones: 'Prédictions',
      newsletterTitle: 'Abonne-toi à notre newsletter',
      newsletterSubtitle: 'Reçois les meilleures prédictions et actus directement par e-mail.',
      newsletterPlaceholder: 'toi@email.com',
      newsletterButton: "S'abonner",
      rights: 'Tous droits réservés.',
      madeWith: 'Fait avec',
      global: 'pour les prophètes du monde entier',
      version: 'v1.0.0',
    },
    links: {
      plataforma: [
        { href: '/dashboard', label: 'Scénarios' },
        { href: '/leaderboard', label: 'Classement' },
        { href: '/tienda', label: 'Boutique' },
        { href: '/foro', label: 'Communauté' },
        { href: '/crear', label: 'Créer un scénario' },
      ],
      soporte: [
        { href: '/ayuda', label: "Centre d'aide" },
        { href: '/faq', label: 'FAQ' },
        { href: '/soporte', label: 'Support Technique' },
        { href: '/reportar', label: 'Signaler un problème' },
      ],
      legal: [
        { href: '/terminos-y-condiciones', label: "Conditions d'utilisation" },
        { href: '/politica-de-privacidad', label: 'Politique de confidentialité' },
        { href: '/cookies', label: 'Politique des cookies' },
        { href: '/reglas', label: 'Règles de la communauté' },
      ],
      empresa: [
        { href: '/about', label: 'À propos' },
        { href: '/blog', label: 'Blog' },
        { href: '/prensa', label: 'Presse' },
        { href: '/careers', label: 'Carrières' },
      ],
      compact: [
        { href: '/terminos-y-condiciones', label: 'Conditions' },
        { href: '/politica-de-privacidad', label: 'Confidentialité' },
        { href: '/soporte', label: 'Support' },
      ],
    },
  },

  de: {
    description:
      'Die Vorhersageplattform, auf der digitale Propheten darum kämpfen zu beweisen, wer die Zukunft sieht. Hast du das Zeug dazu?',
    headings: { plataforma: 'Plattform', soporte: 'Support', legal: 'Rechtliches', empresa: 'Unternehmen' },
    labels: {
      bolsaTotal: 'AP Coins im Spiel',
      profetas: 'Propheten',
      escenarios: 'Szenarien',
      predicciones: 'Vorhersagen',
      newsletterTitle: 'Newsletter abonnieren',
      newsletterSubtitle: 'Erhalte die besten Vorhersagen und Updates direkt per E-Mail.',
      newsletterPlaceholder: 'du@email.com',
      newsletterButton: 'Abonnieren',
      rights: 'Alle Rechte vorbehalten.',
      madeWith: 'Gemacht mit',
      global: 'für Propheten weltweit',
      version: 'v1.0.0',
    },
    links: {
      plataforma: [
        { href: '/dashboard', label: 'Szenarien' },
        { href: '/leaderboard', label: 'Leaderboard' },
        { href: '/tienda', label: 'Shop' },
        { href: '/foro', label: 'Community' },
        { href: '/crear', label: 'Szenario erstellen' },
      ],
      soporte: [
        { href: '/ayuda', label: 'Hilfezentrum' },
        { href: '/faq', label: 'FAQ' },
        { href: '/soporte', label: 'Technischer Support' },
        { href: '/reportar', label: 'Problem melden' },
      ],
      legal: [
        { href: '/terminos-y-condiciones', label: 'Nutzungsbedingungen' },
        { href: '/politica-de-privacidad', label: 'Datenschutz' },
        { href: '/cookies', label: 'Cookie-Richtlinie' },
        { href: '/reglas', label: 'Community-Regeln' },
      ],
      empresa: [
        { href: '/about', label: 'Über uns' },
        { href: '/blog', label: 'Blog' },
        { href: '/prensa', label: 'Presse' },
        { href: '/careers', label: 'Karriere' },
      ],
      compact: [
        { href: '/terminos-y-condiciones', label: 'Bedingungen' },
        { href: '/politica-de-privacidad', label: 'Datenschutz' },
        { href: '/soporte', label: 'Support' },
      ],
    },
  },
};

function getDict(lang: string): FooterDict {
  return DICT[lang] ?? DICT.es;
}

interface PublicStats {
  users: { value: string; raw: number };
  totalPool: { value: string; raw: number };
  scenarios: { value: string; raw: number };
  predictions: { value: string; raw: number };
}

export function Footer() {
  const { language } = useLanguage();
  const t = useMemo(() => getDict(language), [language]);
  const currentYear = new Date().getFullYear();

  const [stats, setStats] = useState<PublicStats>({
    users: { value: "...", raw: 0 },
    totalPool: { value: "...", raw: 0 },
    scenarios: { value: "...", raw: 0 },
    predictions: { value: "...", raw: 0 },
  });

  // Newsletter state
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setNewsletterStatus('error');
      setNewsletterMessage(language === 'es' ? 'Por favor ingresa un email válido' : 'Please enter a valid email');
      return;
    }

    setNewsletterStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterMessage(language === 'es' ? '¡Gracias por suscribirte!' : 'Thanks for subscribing!');
        setEmail('');
      } else {
        const data = await res.json();
        setNewsletterStatus('error');
        setNewsletterMessage(data.error || (language === 'es' ? 'Error al suscribirse' : 'Subscription error'));
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage(language === 'es' ? 'Error de conexión' : 'Connection error');
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setNewsletterStatus('idle');
      setNewsletterMessage('');
    }, 5000);
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats/public");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchStats();
  }, []);

  const socialLinks = [
    { href: 'https://twitter.com/apocaliptyx', icon: Twitter, label: 'Twitter' },
    { href: 'https://instagram.com/apocaliptyx', icon: Instagram, label: 'Instagram' },
    { href: 'https://youtube.com/@apocaliptyx', icon: Youtube, label: 'YouTube' },
    { href: 'https://discord.gg/apocaliptyx', icon: MessageCircle, label: 'Discord' },
  ];

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      {/* Sección Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo y Descripción */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/apocaliptyx-logo.png"
                alt="Apocaliptyx"
                width={160}
                height={45}
                className="h-12 w-auto"
              />
            </Link>

            <p className="text-gray-400 text-sm mb-6 max-w-xs">{t.description}</p>

            {/* Stats en tiempo real */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-2.5 rounded-lg border border-gray-800">
                <Flame className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 truncate">{t.labels.bolsaTotal}</div>
                  <div className="text-sm font-bold text-yellow-400">{stats.totalPool.value} AP</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-2.5 rounded-lg border border-gray-800">
                <Users className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 truncate">{t.labels.profetas}</div>
                  <div className="text-sm font-bold text-purple-400">{stats.users.value}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-2.5 rounded-lg border border-gray-800">
                <Target className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 truncate">{t.labels.escenarios}</div>
                  <div className="text-sm font-bold text-blue-400">{stats.scenarios.value}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-2.5 rounded-lg border border-gray-800">
                <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 truncate">{t.labels.predicciones}</div>
                  <div className="text-sm font-bold text-green-400">{stats.predictions.value}</div>
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-gray-800"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links - Plataforma */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.headings.plataforma}</h3>
            <ul className="space-y-3">
              {t.links.plataforma.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Soporte */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.headings.soporte}</h3>
            <ul className="space-y-3">
              {t.links.soporte.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.headings.legal}</h3>
            <ul className="space-y-3">
              {t.links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Empresa */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.headings.empresa}</h3>
            <ul className="space-y-3">
              {t.links.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-semibold mb-1">{t.labels.newsletterTitle}</h3>
              <p className="text-gray-400 text-sm">{t.labels.newsletterSubtitle}</p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col w-full md:w-auto gap-2">
              <div className="flex w-full md:w-auto gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.labels.newsletterPlaceholder}
                  disabled={newsletterStatus === 'loading'}
                  className="flex-1 md:w-64 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  {newsletterStatus === 'loading' ? '...' : t.labels.newsletterButton}
                </button>
              </div>
              {newsletterMessage && (
                <p className={`text-sm ${newsletterStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {newsletterMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Copyright - Mejorado */}
      <div className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>© {currentYear}</span>
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Apocaliptyx
              </Link>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{t.labels.rights}</span>
            </div>

            {/* Centro */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t.labels.madeWith}</span>
              <Image
                src="/apocaliptyx-logo.png"
                alt="Apocaliptyx"
                width={24}
                height={24}
                className="h-5 w-auto"
              />
              <span className="text-gray-500">{t.labels.global}</span>
            </div>

            {/* Derecha */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>CDMX, México</span>
              </div>
              <span className="text-gray-700">•</span>
              <span className="text-gray-600 font-mono text-xs">{t.labels.version}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Footer compacto para zonas "app" (dashboard/admin/auth)
 */
export function FooterCompact() {
  const { language } = useLanguage();
  const t = useMemo(() => getDict(language), [language]);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/apocaliptyx-logo.png"
              alt="Apocaliptyx"
              width={120}
              height={35}
              className="h-8 w-auto"
            />
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-4">
            {t.links.compact.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm text-muted-foreground">© {currentYear}</p>
        </div>
      </div>
    </footer>
  );
}