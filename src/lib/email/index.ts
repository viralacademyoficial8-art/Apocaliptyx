// src/lib/email/index.ts

export { resend, sendEmail, FROM_EMAIL } from './resend';
export { getWelcomeEmailHtml, getWelcomeEmailText } from './templates/welcome';
export { getResetPasswordEmailHtml, getResetPasswordEmailText } from './templates/reset-password';
export { getPredictionWonEmailHtml, getPredictionWonEmailText } from './templates/prediction-won';
export { getPurchaseReceiptEmailHtml, getPurchaseReceiptEmailText } from './templates/purchase-receipt';
export { getNotificationEmailHtml, getNotificationEmailText } from './templates/notification';
export type { NotificationEmailData } from './templates/notification';

// Funciones de alto nivel para enviar emails específicos
import { sendEmail } from './resend';
import { getWelcomeEmailHtml, getWelcomeEmailText } from './templates/welcome';
import { getResetPasswordEmailHtml, getResetPasswordEmailText } from './templates/reset-password';
import { getPredictionWonEmailHtml, getPredictionWonEmailText } from './templates/prediction-won';
import { getPurchaseReceiptEmailHtml, getPurchaseReceiptEmailText } from './templates/purchase-receipt';
import { getNotificationEmailHtml, getNotificationEmailText, NotificationEmailData } from './templates/notification';

export async function sendWelcomeEmail(to: string, username: string) {
  return sendEmail({
    to,
    subject: '🎉 ¡Bienvenido a Apocaliptyx! Tu bono de 1,000 AP Coins te espera',
    html: getWelcomeEmailHtml({ username }),
    text: getWelcomeEmailText({ username }),
  });
}

export async function sendResetPasswordEmail(to: string, username: string, resetLink: string) {
  return sendEmail({
    to,
    subject: '🔑 Recuperar contraseña - Apocaliptyx',
    html: getResetPasswordEmailHtml({ username, resetLink }),
    text: getResetPasswordEmailText({ username, resetLink }),
  });
}

export async function sendPredictionWonEmail(
  to: string,
  data: {
    username: string;
    scenarioTitle: string;
    prediction: 'YES' | 'NO';
    amountWon: number;
    totalBalance: number;
  }
) {
  return sendEmail({
    to,
    subject: `🎉 ¡Ganaste ${data.amountWon.toLocaleString()} AP Coins! - Apocaliptyx`,
    html: getPredictionWonEmailHtml(data),
    text: getPredictionWonEmailText(data),
  });
}

export async function sendPurchaseReceiptEmail(
  to: string,
  data: {
    username: string;
    itemName: string;
    itemPrice: number;
    quantity: number;
    totalPaid: number;
    remainingBalance: number;
  }
) {
  return sendEmail({
    to,
    subject: '🛒 Recibo de compra - Apocaliptyx',
    html: getPurchaseReceiptEmailHtml(data),
    text: getPurchaseReceiptEmailText(data),
  });
}

// Función genérica para enviar notificaciones por email
export async function sendNotificationEmail(to: string, data: NotificationEmailData) {
  return sendEmail({
    to,
    subject: `🔔 ${data.title} - Apocaliptyx`,
    html: getNotificationEmailHtml(data),
    text: getNotificationEmailText(data),
  });
}