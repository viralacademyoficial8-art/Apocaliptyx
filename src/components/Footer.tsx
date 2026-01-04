'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Skull,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Flame,
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
    newsletterTitle: string;
    newsletterSubtitle: string;
    newsletterPlaceholder: string;
    newsletterButton: string;
    rights: string;
    madeWith: string;
    global: string;
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
      bolsaTotal: 'Bolsa Total',
      profetas: 'Profetas',
      newsletterTitle: 'Suscríbete a nuestro newsletter',
      newsletterSubtitle: 'Recibe las mejores predicciones y novedades directamente en tu correo.',
      newsletterPlaceholder: 'tu@email.com',
      newsletterButton: 'Suscribirse',
      rights: 'Todos los derechos reservados.',
      madeWith: 'Hecho con 💀 para profetas digitales',
      global: 'Global',
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
        { href: '/contacto', label: 'Contacto' },
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
        { href: '/contacto', label: 'Contacto' },
      ],
    },
  },

  en: {
    description:
      'The prediction platform where digital prophets compete to prove who can see the future. Do you have what it takes?',
    headings: { plataforma: 'Platform', soporte: 'Support', legal: 'Legal', empresa: 'Company' },
    labels: {
      bolsaTotal: 'Total Pool',
      profetas: 'Prophets',
      newsletterTitle: 'Subscribe to our newsletter',
      newsletterSubtitle: 'Get the best predictions and updates straight to your inbox.',
      newsletterPlaceholder: 'you@email.com',
      newsletterButton: 'Subscribe',
      rights: 'All rights reserved.',
      madeWith: 'Made with 💀 for digital prophets',
      global: 'Global',
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
        { href: '/contacto', label: 'Contact' },
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
        { href: '/contacto', label: 'Contact' },
      ],
    },
  },

  pt: {
    description:
      'A plataforma de previsões onde profetas digitais competem para provar quem vê o futuro. Você tem o que é preciso?',
    headings: { plataforma: 'Plataforma', soporte: 'Suporte', legal: 'Legal', empresa: 'Empresa' },
    labels: {
      bolsaTotal: 'Bolsa Total',
      profetas: 'Profetas',
      newsletterTitle: 'Assine nossa newsletter',
      newsletterSubtitle: 'Receba as melhores previsões e novidades no seu e-mail.',
      newsletterPlaceholder: 'seu@email.com',
      newsletterButton: 'Assinar',
      rights: 'Todos os direitos reservados.',
      madeWith: 'Feito com 💀 para profetas digitais',
      global: 'Global',
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
        { href: '/contacto', label: 'Contato' },
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
        { href: '/contacto', label: 'Contato' },
      ],
    },
  },

  fr: {
    description:
      "La plateforme de prédictions où les prophètes numériques se battent pour prouver qui voit l'avenir. Es-tu prêt ?",
    headings: { plataforma: 'Plateforme', soporte: 'Support', legal: 'Mentions', empresa: 'Entreprise' },
    labels: {
      bolsaTotal: 'Cagnotte Totale',
      profetas: 'Prophètes',
      newsletterTitle: 'Abonne-toi à notre newsletter',
      newsletterSubtitle: 'Reçois les meilleures prédictions et actus directement par e-mail.',
      newsletterPlaceholder: 'toi@email.com',
      newsletterButton: "S'abonner",
      rights: 'Tous droits réservés.',
      madeWith: 'Fait avec 💀 pour les prophètes numériques',
      global: 'Global',
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
        { href: '/contacto', label: 'Contact' },
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
        { href: '/contacto', label: 'Contact' },
      ],
    },
  },

  de: {
    description:
      'Die Vorhersageplattform, auf der digitale Propheten darum kämpfen zu beweisen, wer die Zukunft sieht. Hast du das Zeug dazu?',
    headings: { plataforma: 'Plattform', soporte: 'Support', legal: 'Rechtliches', empresa: 'Unternehmen' },
    labels: {
      bolsaTotal: 'Gesamtpool',
      profetas: 'Propheten',
      newsletterTitle: 'Newsletter abonnieren',
      newsletterSubtitle: 'Erhalte die besten Vorhersagen und Updates direkt per E-Mail.',
      newsletterPlaceholder: 'du@email.com',
      newsletterButton: 'Abonnieren',
      rights: 'Alle Rechte vorbehalten.',
      madeWith: 'Gemacht mit 💀 für digitale Propheten',
      global: 'Global',
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
        { href: '/contacto', label: 'Kontakt' },
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
        { href: '/contacto', label: 'Kontakt' },
      ],
    },
  },

  ru: {
    description:
      'Платформа прогнозов, где цифровые пророки соревнуются, чтобы доказать, кто видит будущее. Готов?',
    headings: { plataforma: 'Платформа', soporte: 'Поддержка', legal: 'Право', empresa: 'Компания' },
    labels: {
      bolsaTotal: 'Общий банк',
      profetas: 'Пророки',
      newsletterTitle: 'Подпишись на рассылку',
      newsletterSubtitle: 'Получай лучшие прогнозы и новости прямо на почту.',
      newsletterPlaceholder: 'you@email.com',
      newsletterButton: 'Подписаться',
      rights: 'Все права защищены.',
      madeWith: 'Сделано с 💀 для цифровых пророков',
      global: 'Global',
    },
    links: {
      plataforma: [
        { href: '/dashboard', label: 'Сценарии' },
        { href: '/leaderboard', label: 'Лидеры' },
        { href: '/tienda', label: 'Магазин' },
        { href: '/foro', label: 'Сообщество' },
        { href: '/crear', label: 'Создать сценарий' },
      ],
      soporte: [
        { href: '/ayuda', label: 'Центр помощи' },
        { href: '/faq', label: 'FAQ' },
        { href: '/contacto', label: 'Контакт' },
        { href: '/reportar', label: 'Сообщить о проблеме' },
      ],
      legal: [
        { href: '/terminos-y-condiciones', label: 'Условия' },
        { href: '/politica-de-privacidad', label: 'Политика конфиденциальности' },
        { href: '/cookies', label: 'Cookie-политика' },
        { href: '/reglas', label: 'Правила сообщества' },
      ],
      empresa: [
        { href: '/about', label: 'О нас' },
        { href: '/blog', label: 'Блог' },
        { href: '/prensa', label: 'Пресса' },
        { href: '/careers', label: 'Карьера' },
      ],
      compact: [
        { href: '/terminos-y-condiciones', label: 'Условия' },
        { href: '/politica-de-privacidad', label: 'Конфиденциальность' },
        { href: '/contacto', label: 'Контакт' },
      ],
    },
  },
};

function getDict(lang: string): FooterDict {
  return DICT[lang] ?? DICT.es;
}

export function Footer() {
  const { language } = useLanguage();
  const t = useMemo(() => getDict(language), [language]);

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { href: 'https://twitter.com/apocaliptics', icon: Twitter, label: 'Twitter' },
    { href: 'https://instagram.com/apocaliptics', icon: Instagram, label: 'Instagram' },
    { href: 'https://youtube.com/@apocaliptics', icon: Youtube, label: 'YouTube' },
    { href: 'https://discord.gg/apocaliptics', icon: MessageCircle, label: 'Discord' },
  ];

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      {/* Sección Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo y Descripción */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Skull className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold">
                <span className="text-red-500">APOCAL</span>
                <span className="text-yellow-500">IPTICS</span>
              </span>
            </Link>

            <p className="text-gray-400 text-sm mb-6 max-w-xs">{t.description}</p>

            {/* Stats rápidos */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg">
                <Flame className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500">{t.labels.bolsaTotal}</div>
                  <div className="text-sm font-bold text-yellow-400">2.5M AP</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg">
                <Skull className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-xs text-gray-500">{t.labels.profetas}</div>
                  <div className="text-sm font-bold text-purple-400">12,847</div>
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
                    className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
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

            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder={t.labels.newsletterPlaceholder}
                className="flex-1 md:w-64 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap">
                {t.labels.newsletterButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              © {currentYear} Apocaliptics. {t.labels.rights}
            </p>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">{t.labels.madeWith}</span>
              <span className="text-gray-700">|</span>
              <div className="flex items-center gap-1 text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{t.labels.global}</span>
              </div>
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
            <Skull className="w-5 h-5 text-red-500" />
            <span className="font-bold text-foreground">APOCALIPTICS</span>
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