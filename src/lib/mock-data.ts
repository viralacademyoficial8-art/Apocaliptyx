// src/lib/mock-data.ts

import {
  User,
  Scenario,
  Notification,
  Item,
  ScenarioStatus,
  ScenarioCategory,
  ForumPost,
  ForumComment,
} from "@/types";

// ---------- Helpers de fecha ----------
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// ---------- Usuarios de ejemplo ----------
export const mockUsers: User[] = [
  {
    id: "user_1",
    username: "monividente",
    displayName: "Mony Vidente",
    email: "mony@apocaliptics.com",
    avatarUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=monividente&backgroundColor=0f172a",
    prophetLevel: "monividente",
    reputationScore: 1200,
    apCoins: 2500,
    scenariosCreated: 8,
    scenariosWon: 3,
    winRate: 37.5,
    followers: 120,
    following: 34,
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "user_2",
    username: "oraculo_supremo",
    displayName: "Oráculo Supremo",
    email: "oraculo@apocaliptics.com",
    avatarUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=oraculo_supremo&backgroundColor=0f172a",
    prophetLevel: "oraculo",
    reputationScore: 4200,
    apCoins: 7800,
    scenariosCreated: 20,
    scenariosWon: 11,
    winRate: 55.0,
    followers: 340,
    following: 88,
    createdAt: new Date("2023-11-15"),
  },
  {
    id: "user_3",
    username: "nostradamus_ai",
    displayName: "Nostradamus AI",
    email: "nostradamus@apocaliptics.com",
    avatarUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=nostradamus_ai&backgroundColor=0f172a",
    prophetLevel: "nostradamus",
    reputationScore: 18500,
    apCoins: 15400,
    scenariosCreated: 42,
    scenariosWon: 30,
    winRate: 71.4,
    followers: 1250,
    following: 210,
    createdAt: new Date("2023-05-10"),
  },
];

// ---------- Ítems de la tienda ----------
export const ITEMS_CATALOG: Item[] = [
  {
    id: "item_candado_12h",
    name: "Candado Temporal",
    type: "candado",
    description:
      "Bloquea tu escenario por 12 horas para que nadie te lo pueda robar.",
    priceApCoins: 150,
    durationHours: 12,
    icon: "🔒",
  },
  {
    id: "item_candado_24h",
    name: "Candado de 24h",
    type: "candado",
    description:
      "Protección completa de tu escenario durante 24 horas seguidas.",
    priceApCoins: 250,
    durationHours: 24,
    icon: "🛡️",
  },
  {
    id: "item_reloj_6h",
    name: "Reloj de Arena (+6h)",
    type: "reloj_arena",
    description:
      "Extiende el tiempo de bloqueo o de vencimiento del escenario por 6 horas.",
    priceApCoins: 120,
    durationHours: 6,
    icon: "⏳",
  },
  {
    id: "item_reloj_12h",
    name: "Reloj de Arena (+12h)",
    type: "reloj_arena",
    description:
      "Añade 12 horas extra al tiempo actual de tu escenario más crítico.",
    priceApCoins: 200,
    durationHours: 12,
    icon: "⌛",
  },
  {
    id: "item_escudo_1",
    name: "Escudo Anti-Robo",
    type: "escudo",
    description:
      "Primera defensa: el próximo intento de robo de este escenario fallará.",
    priceApCoins: 300,
    icon: "🛡️",
  },
  {
    id: "item_escudo_2",
    name: "Escudo Legendario",
    type: "escudo",
    description:
      "Protección avanzada: bloquea los próximos 2 intentos de robo.",
    priceApCoins: 500,
    icon: "🔥",
  },
];

// Alias por si el store usara otros nombres
export const MOCK_ITEMS = ITEMS_CATALOG;

// ---------- Escenarios de ejemplo ----------
const baseScenario = (overrides: Partial<Scenario>): Scenario => ({
  id: "scenario_temp",
  creatorId: "user_1",
  creatorUsername: "monividente",
  creatorAvatar:
    "https://api.dicebear.com/7.x/avataaars/svg?seed=monividente&backgroundColor=0f172a",
  currentHolderId: "user_1",
  currentHolderUsername: "monividente",
  title: "Escenario base",
  description: "Escenario de ejemplo",
  category: "tecnologia",
  // 👇 tu Scenario tiene dueDate: string
  dueDate: daysFromNow(5).toISOString(),
  creationCost: 200,
  currentPrice: 250,
  totalPot: 400,
  status: "active",
  lockUntil: null,
  isProtected: false,
  protectionUntil: null,
  // 👇 tu Scenario tiene createdAt: string
  createdAt: new Date().toISOString(),
  updatedAt: new Date(),
  transferCount: 0,
  votes: {
    yes: 10,
    no: 2,
  },
  ...overrides,
});

export const mockScenarios: Scenario[] = [
  baseScenario({
    id: "scn_1",
    title: "Apple lanza el iPhone completamente plegable antes de 2026",
    description:
      "Predicción sobre el lanzamiento de un iPhone con pantalla totalmente plegable.",
    category: "tecnologia",
    creationCost: 300,
    currentPrice: 420,
    totalPot: 1200,
    status: "active",
    // string
    dueDate: daysFromNow(30).toISOString(),
    transferCount: 3,
  }),
  baseScenario({
    id: "scn_2",
    creatorId: "user_2",
    creatorUsername: "oraculo_supremo",
    currentHolderId: "user_3",
    currentHolderUsername: "nostradamus_ai",
    title: "México gana una medalla de oro olímpica en fútbol",
    description:
      "Predicción sobre la selección mexicana en los próximos Juegos Olímpicos.",
    category: "deportes",
    creationCost: 250,
    currentPrice: 380,
    totalPot: 980,
    status: "locked",
    lockUntil: daysFromNow(2),
    isProtected: true,
    protectionUntil: daysFromNow(1),
  }),
  baseScenario({
    id: "scn_3",
    creatorId: "user_3",
    creatorUsername: "nostradamus_ai",
    currentHolderId: "user_3",
    currentHolderUsername: "nostradamus_ai",
    title: "Bitcoin supera los 120,000 USD antes de 2027",
    description:
      "Escenario financiero sobre el precio máximo de Bitcoin en los próximos años.",
    category: "economia",
    creationCost: 500,
    currentPrice: 900,
    totalPot: 3500,
    status: "completed",
    // string
    dueDate: daysFromNow(-10).toISOString(),
    // string
    createdAt: daysFromNow(-60).toISOString(),
    // updatedAt sigue siendo Date
    updatedAt: daysFromNow(-5),
    transferCount: 7,
    votes: {
      yes: 420,
      no: 130,
    },
  }),
];

export const MOCK_SCENARIOS = mockScenarios;

// ---------- Notificaciones de ejemplo ----------
export const mockNotifications: Notification[] = [
  {
    id: "notif_1",
    type: "scenario_stolen",
    title: "¡Te robaron un escenario!",
    message:
      'nostradamus_ai acaba de robar tu escenario "Bitcoin supera los 120,000 USD".',
    relatedUserId: "user_3",
    relatedScenarioId: "scn_3",
    read: false, // 👈 ahora usamos "read"
    createdAt: daysFromNow(-0.2),
  },
  {
    id: "notif_2",
    type: "scenario_won",
    title: "¡Ganaste un escenario!",
    message:
      "Tu predicción sobre Apple fue correcta. Has ganado AP Coins adicionales.",
    relatedScenarioId: "scn_1",
    read: false,
    createdAt: daysFromNow(-1),
  },
  {
    id: "notif_3",
    type: "new_follower",
    title: "Nuevo seguidor",
    message: "oraculo_supremo ahora te sigue.",
    relatedUserId: "user_2",
    read: true,
    createdAt: daysFromNow(-3),
  },
];

export const MOCK_NOTIFICATIONS = mockNotifications;

// ---------- FORO: Posts y Comentarios de ejemplo ----------
export const mockForumPosts: ForumPost[] = [
  {
    id: "post_1",
    authorId: "user_3",
    authorUsername: "nostradamus_ai",
    authorDisplayName: "Nostradamus AI",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=nostradamus_ai&backgroundColor=0f172a",
    authorLevel: "nostradamus",
    content:
      "¿Alguien más cree que Bitcoin va a superar los 200K USD antes de 2027? Tengo un escenario activo sobre esto y los indicadores técnicos + el halving pintan muy locos. 🚀\n\n¿Qué opinan, profetas?",
    linkedScenarioId: "scn_3",
    likes: ["user_1", "user_2"],
    commentsCount: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ["prediccion", "debate"],
  },
  {
    id: "post_2",
    authorId: "user_2",
    authorUsername: "oraculo_supremo",
    authorDisplayName: "Oráculo Supremo",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=oraculo_supremo&backgroundColor=0f172a",
    authorLevel: "oraculo",
    content:
      "🎯 GUÍA RÁPIDA PARA NUEVOS PROFETAS:\n\n1) No crees escenarios ultra obvios.\n2) Protege con candados los escenarios que están por cumplirse.\n3) Diversifica tus AP Coins.\n4) Sigue a profetas con buen win rate.\n\n¿Qué otro tip agregarían?",
    likes: ["user_1", "user_3"],
    commentsCount: 4,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    tags: ["estrategia"],
  },
  {
    id: "post_3",
    authorId: "user_1",
    authorUsername: "monividente",
    authorDisplayName: "Mony Vidente",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=monividente&backgroundColor=0f172a",
    authorLevel: "monividente",
    content:
      "Acabo de ver un escenario de que el América gana TODO esta temporada. 😂\n\nOficialmente lo clasifico como “evento apocalíptico”.",
    likes: ["user_2", "user_3"],
    commentsCount: 5,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    tags: ["humor"],
  },
  {
    id: "post_4",
    authorId: "user_2",
    authorUsername: "oraculo_supremo",
    authorDisplayName: "Oráculo Supremo",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=oraculo_supremo&backgroundColor=0f172a",
    authorLevel: "oraculo",
    content:
      "📰 NOTICIA: Nueva ola de avances de IA.\n\nMuchos escenarios de tecnología se están empezando a cumplir. Si tienes escenarios viejos de IA abandonados… revísalos, puede que estés sentado sobre oro. 🤖",
    likes: ["user_1"],
    commentsCount: 2,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    tags: ["noticia", "analisis"],
  },
  {
    id: "post_5",
    authorId: "user_1",
    authorUsername: "monividente",
    authorDisplayName: "Mony Vidente",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=monividente&backgroundColor=0f172a",
    authorLevel: "monividente",
    content:
      "Primera semana en Apocaliptics y ya soy adicta a crear escenarios 😂\n\nPerdí los primeros, pero acabo de ganar uno de economía y se siente brutal.\n\n¿Consejo clave para no quebrar mis AP Coins, comunidad?",
    likes: ["user_2"],
    commentsCount: 3,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ["debate"],
  },
];

export const mockForumComments: ForumComment[] = [
  {
    id: "comment_1",
    postId: "post_1",
    authorId: "user_2",
    authorUsername: "oraculo_supremo",
    authorDisplayName: "Oráculo Supremo",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=oraculo_supremo&backgroundColor=0f172a",
    authorLevel: "oraculo",
    content:
      "Yo sí veo posible los 200K, pero con una corrección brutal antes. Ojo con el timing del escenario.",
    likes: ["user_3"],
    createdAt: new Date(Date.now() - 90 * 60 * 1000),
  },
  {
    id: "comment_2",
    postId: "post_1",
    authorId: "user_1",
    authorUsername: "monividente",
    authorDisplayName: "Mony Vidente",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=monividente&backgroundColor=0f172a",
    authorLevel: "monividente",
    content:
      "Yo ya metí AP Coins en ese escenario. Si se cumple, nos vemos en el cementerio de profetas… pero ricos 😅",
    likes: ["user_2", "user_3"],
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: "comment_3",
    postId: "post_2",
    authorId: "user_3",
    authorUsername: "nostradamus_ai",
    authorDisplayName: "Nostradamus AI",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=nostradamus_ai&backgroundColor=0f172a",
    authorLevel: "nostradamus",
    content:
      "Gran lista. Yo agregaría: no te enamores de un solo escenario, enamórate de tu win rate.",
    likes: ["user_1"],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "comment_4",
    postId: "post_3",
    authorId: "user_2",
    authorUsername: "oraculo_supremo",
    authorDisplayName: "Oráculo Supremo",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=oraculo_supremo&backgroundColor=0f172a",
    authorLevel: "oraculo",
    content: "Confirmo: si América gana todo, desbloqueamos modo apocalipsis. 🦅",
    likes: ["user_1", "user_3"],
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
  },
  {
    id: "comment_5",
    postId: "post_5",
    authorId: "user_3",
    authorUsername: "nostradamus_ai",
    authorDisplayName: "Nostradamus AI",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=nostradamus_ai&backgroundColor=0f172a",
    authorLevel: "nostradamus",
    content:
      "Consejo: empieza con temas que domines (fútbol, política, cripto, etc.) y no uses todos tus AP Coins en un solo escenario.",
    likes: ["user_1", "user_2"],
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
  },
];
