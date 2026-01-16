// src/lib/auth-utils.ts

import bcrypt from 'bcryptjs';
import prisma from './prisma';

// ============================================
// HASH PASSWORD
// ============================================
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// ============================================
// VERIFY PASSWORD
// ============================================
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================
// GENERATE UNIQUE USERNAME
// ============================================
export async function generateUniqueUsername(baseName: string): Promise<string> {
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 15);

  let username = sanitized || 'prophet';
  let counter = 0;
  const maxAttempts = 100;

  while (counter < maxAttempts) {
    const finalUsername = counter === 0 ? username : `${username}${counter}`;

    const exists = await prisma.user.findUnique({
      where: { username: finalUsername },
      select: { id: true },
    });

    if (!exists) return finalUsername;
    counter++;
  }

  // Fallback con timestamp
  return `${username}${Date.now().toString().slice(-6)}`;
}

// ============================================
// CHECK IF EMAIL EXISTS
// ============================================
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return !!user;
}

// ============================================
// CHECK IF USERNAME EXISTS
// ============================================
export async function usernameExists(username: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return !!user;
}

// ============================================
// VALIDATE PASSWORD STRENGTH
// ============================================
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Debe contener al menos una mayúscula');
  if (!/[a-z]/.test(password)) errors.push('Debe contener al menos una minúscula');
  if (!/[0-9]/.test(password)) errors.push('Debe contener al menos un número');

  return { isValid: errors.length === 0, errors };
}

// ============================================
// VALIDATE USERNAME
// ============================================
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (username.length < 3) {
    return { isValid: false, error: 'El username debe tener al menos 3 caracteres' };
  }
  if (username.length > 20) {
    return { isValid: false, error: 'El username no puede tener más de 20 caracteres' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Solo letras, números y guiones bajos' };
  }
  if (/^[0-9]/.test(username)) {
    return { isValid: false, error: 'No puede comenzar con un número' };
  }

  const reserved = ['admin', 'moderator', 'apocaliptyx', 'system', 'support', 'help'];
  if (reserved.includes(username.toLowerCase())) {
    return { isValid: false, error: 'Este username está reservado' };
  }

  return { isValid: true };
}
