import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Ingresar",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-[#1A0902] via-[#2A0E04] to-[#3a1608] px-4">
      {/* Glow naranja */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[#FF6B1A]/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-52 -right-32 h-[420px] w-[420px] rounded-full bg-[#FF6B1A]/10 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-4">
          <Image
            src="/voolkia.svg"
            alt="Voolkia"
            width={220}
            height={50}
            priority
            className="h-12 w-auto"
          />
          <p className="text-sm font-medium tracking-wide text-[#FFF6EE]/70">
            CRM · Programa de Partners Estratégicos
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
          <h1 className="mb-1 text-xl font-bold text-white">Ingresar</h1>
          <p className="mb-6 text-sm text-[#FFF6EE]/60">
            Accedé con tu cuenta de Voolkia
          </p>
          <LoginForm />
        </div>

        <p className="mt-8 text-center text-xs text-[#FFF6EE]/40">
          Uso interno — Voolkia S.A. © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
