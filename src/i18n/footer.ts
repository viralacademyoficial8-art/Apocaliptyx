export const footerI18n = {
  es: {
    brandDesc:
      'La plataforma de predicciones donde los profetas digitales compiten por demostrar quién puede ver el futuro. ¿Tienes lo que se necesita?',
    platform: 'Plataforma',
    support: 'Soporte',
    legal: 'Legal',
    company: 'Empresa',
    newsletterTitle: 'Suscríbete a nuestro newsletter',
    newsletterDesc: 'Recibe las mejores predicciones y novedades directamente en tu correo.',
    emailPlaceholder: 'tu@email.com',
    subscribe: 'Suscribirse',
    madeFor: 'Hecho con 💀 para profetas digitales',
    global: 'Global',
    totalPool: 'Bolsa Total',
    prophets: 'Profetas',
    rights: 'Todos los derechos reservados.',
  },
  en: {
    brandDesc:
      'The prediction platform where digital prophets compete to prove who can see the future. Do you have what it takes?',
    platform: 'Platform',
    support: 'Support',
    legal: 'Legal',
    company: 'Company',
    newsletterTitle: 'Subscribe to our newsletter',
    newsletterDesc: 'Get the best predictions and updates straight to your inbox.',
    emailPlaceholder: 'you@email.com',
    subscribe: 'Subscribe',
    madeFor: 'Made with 💀 for digital prophets',
    global: 'Global',
    totalPool: 'Total Pool',
    prophets: 'Prophets',
    rights: 'All rights reserved.',
  },
} as const;

export type FooterLang = keyof typeof footerI18n;
