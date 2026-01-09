// src/lib/email/resend.ts

import { Resend } from 'resend';

// Inicializar cliente de Resend (lazy initialization para evitar errores en build)
let _resend: Resend | null = null;

export const getResend = () => {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');
  }
  return _resend;
};

export const resend = {
  emails: {
    send: async (params: Parameters<Resend['emails']['send']>[0]) => {
      return getResend().emails.send(params);
    }
  }
};

// Email por defecto (dominio verificado en Resend)
export const FROM_EMAIL = 'Apocaliptics <noreply@apocaliptyx.com>';

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