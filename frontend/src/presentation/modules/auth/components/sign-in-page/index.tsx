"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { SignInPageProps } from "../../props";
import Image from "next/image";

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[#1B4B7C]/50 bg-white transition-colors focus-within:border-[#1B4B7C]/80">
    {children}
  </div>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <Image
      src="https://res.cloudinary.com/dotmxzn47/image/upload/v1747757959/Prancheta_1_tqouze.png"
      alt="logo"
      width={150}
      height={150}
    />
  ),
  description = "Acesse sua conta e continue sua jornada com a Almaz Digital inovação e tecnologia conectando resultados.",
  heroImageSrc,
  onSignIn,
  onResetPassword,
  onCreateAccount,
  register,
  errors,
  isSubmitting,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-dvh w-dvw flex-col md:flex-row bg-white font-sans">
      {/* ===== LEFT: Login Form ===== */}
      <section className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Título */}
            <h1 className="animate-element animate-delay-100 font-semibold leading-tight">
              {title}
            </h1>
            <p className="animate-element animate-delay-200 text-[#1B4B7C]/80">
              {description}
            </p>

            {/* Formulário */}
            <form className="space-y-5" onSubmit={onSignIn} noValidate>
              {/* E-mail */}
              <div className="animate-element animate-delay-300">
                <label
                  htmlFor="email"
                  className="text-md font-medium text-[#1B4B7C]"
                >
                  E-mail
                </label>
                <GlassInputWrapper>
                  <input
                    id="email"
                    {...(register ? register("email") : { name: "email" })}
                    type="email"
                    placeholder="Digite seu e-mail"
                    className="w-full rounded-2xl bg-transparent p-4 text-sm text-[#1B4B7C] placeholder:text-[#1B4B7C]/50 focus:outline-none"
                  />
                </GlassInputWrapper>
                {errors?.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="animate-element animate-delay-400">
                <label
                  htmlFor="password"
                  className="text-md font-medium text-[#1B4B7C]"
                >
                  Senha
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      id="password"
                      {...(register
                        ? register("password")
                        : { name: "password" })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      className="w-full rounded-2xl bg-transparent p-4 pr-12 text-sm text-[#1B4B7C] placeholder:text-[#1B4B7C]/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-[#1B4B7C] transition-colors hover:text-[#0F2C55]" />
                      ) : (
                        <Eye className="h-5 w-5 text-[#1B4B7C] transition-colors hover:text-[#0F2C55]" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
                {errors?.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              {/* Lembrar e Esqueci a senha */}
              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label
                  htmlFor="rememberMe"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...(register
                      ? register("rememberMe")
                      : { name: "rememberMe" })}
                    className="size-4 accent-[#1B4B7C]"
                  />
                  <span className="text-[#1B4B7C]/90">Manter-me conectado</span>
                </label>
                <button
                  type="button"
                  onClick={onResetPassword}
                  className="text-[#1B4B7C] hover:underline transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>

              {/* Botão de login */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="animate-element animate-delay-600 w-full rounded-2xl bg-[#1B4B7C] py-4 text-md font-medium text-white transition-colors hover:bg-[#0F2C55] disabled:opacity-60"
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>
            </form>

            {/* Link para criar conta */}
            <p className="animate-element animate-delay-900 text-center text-sm text-[#1B4B7C]/80">
              Novo por aqui?{" "}
              <button
                type="button"
                onClick={onCreateAccount}
                className="text-[#1B4B7C] underline-offset-2 hover:underline transition-colors"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ===== RIGHT: Hero Image ===== */}
      {heroImageSrc && (
        <section className="relative hidden flex-1 p-4 md:block">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center shadow-md"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          />
        </section>
      )}
    </div>
  );
};
