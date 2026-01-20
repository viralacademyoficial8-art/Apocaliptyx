// src/app/(auth)/registro/page.tsx

import { Suspense } from "react";
import { RegisterForm } from "@/components/auth";
import { Skull } from "lucide-react";
import Link from "next/link";

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header simple */}
      <header className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Skull className="w-8 h-8 text-red-500" />
          <span className="text-xl font-bold">
            <span className="text-red-500">APOCAL</span>
            <span className="text-yellow-500">IPTICS</span>
          </span>
        </Link>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <Suspense fallback={<div className="text-white">Cargando...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}