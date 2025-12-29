// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, username } = body;

    // 1️⃣ Validaciones básicas
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // 2️⃣ Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario o email ya existe' },
        { status: 409 }
      );
    }

    // 3️⃣ Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4️⃣ Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'USER',
        apCoins: 100, // bonus inicial
        level: 1,
        experience: 0,
      },
    });

    // 5️⃣ Respuesta limpia (sin password)
    return NextResponse.json(
      {
        message: 'Usuario creado correctamente',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('REGISTER_ERROR', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
