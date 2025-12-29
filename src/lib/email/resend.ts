// src/lib/email/resend.ts

import { Resend } from 'resend';

// Inicializar cliente de Resend
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email por defecto (cambia cuando tengas dominio verificado)
export const FROM_EMAIL = 'Apocaliptics <onboarding@resend.dev>';

// Tipos de email
export type EmailType = 
  | 'welcome'
  | 'reset-password'
  | 'prediction-won'
  | 'scenario-resolved'
  | 'purchase-receipt';

// Función genérica para enviar emails
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}