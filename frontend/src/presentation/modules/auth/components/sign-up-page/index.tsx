"use client"

import React, { useState } from "react"
import { Eye } from "lucide-react"
import type { SignUpPageProps } from "../../props"

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[#1B4B7C]/50 bg-white backdrop-blur-sm transition-colors focus-within:border-[#1B4B7C]/80">
    {children}
  </div>
)

export const SignUpPage: React.FC<SignUpPageProps> = ({
  heroImageSrc,
  onSignUp,
  onSignIn,
  register,
  errors,
  isSubmitting,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="flex h-dvh w-dvw flex-col md:flex-row bg-white font-sans">
      {/* ========== Left Form Section ========== */}
      <section className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-200 text-2xl font-semibold text-[#1B4B7C]">
              Crie sua conta
            </h1>

            <form className="space-y-5" onSubmit={onSignUp} noValidate>
              {/* Nome completo */}
              <div className="animate-element animate-delay-300">
                <label className="text-md font-medium text-[#1B4B7C]" htmlFor="name">
                  Nome completo
                </label>
                <GlassInputWrapper>
                  <input
                    id="name"
                    {...(register ? register("name") : { name: "name" })}
                    type="text"
                    placeholder="Digite seu nome completo"
                    className="w-full rounded-2xl bg-transparent p-4 text-sm text-black focus:outline-none"
                  />
                </GlassInputWrapper>
                {errors?.name && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.name.message)}</p>
                )}
              </div>

              {/* E-mail */}
              <div className="animate-element animate-delay-400">
                <label className="text-md font-medium text-[#1B4B7C]" htmlFor="email">
                  E-mail
                </label>
                <GlassInputWrapper>
                  <input
                    id="email"
                    {...(register ? register("email") : { name: "email" })}
                    type="email"
                    placeholder="Digite seu e-mail"
                    className="w-full rounded-2xl bg-transparent p-4 text-sm text-black focus:outline-none"
                  />
                </GlassInputWrapper>
                {errors?.email && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.email.message)}</p>
                )}
              </div>

              {/* Senha */}
              <div className="animate-element animate-delay-500">
                <label className="text-md font-medium text-[#1B4B7C]" htmlFor="password">
                  Senha
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      id="password"
                      {...(register ? register("password") : { name: "password" })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
                      className="w-full rounded-2xl bg-transparent p-4 pr-12 text-sm text-black focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      <Eye className="h-5 w-5 text-[#1B4B7C] transition-colors hover:text-[#0F2C55]" />
                    </button>
                  </div>
                </GlassInputWrapper>
                {errors?.password && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.password.message)}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="animate-element animate-delay-600">
                <label
                  className="text-md font-medium text-[#1B4B7C]"
                  htmlFor="confirmPassword"
                >
                  Confirmar senha
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      {...(register ? register("confirmPassword") : { name: "confirmPassword" })}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      className="w-full rounded-2xl bg-transparent p-4 pr-12 text-sm text-black focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      <Eye className="h-5 w-5 text-[#1B4B7C] transition-colors hover:text-[#0F2C55]" />
                    </button>
                  </div>
                </GlassInputWrapper>
                {errors?.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {String(errors.confirmPassword.message)}
                  </p>
                )}
              </div>

              {/* Termos */}
              <div className="animate-element animate-delay-700 flex items-start gap-3 text-md">
                <input
                  id="terms"
                  type="checkbox"
                  {...(register ? register("terms") : { name: "terms" })}
                  className="mt-1 size-4 accent-[#1B4B7C]"
                />
                <label htmlFor="terms" className="text-[#1B4B7C]/90 leading-snug">
                  Eu concordo com os{" "}
                  <a href="#" className="text-[#1B4B7C] hover:underline">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-[#1B4B7C] hover:underline">
                    Política de Privacidade
                  </a>
                </label>
              </div>
              {errors?.terms && (
                <p className="mt-1 text-sm text-red-600">{String(errors.terms.message)}</p>
              )}

              {/* Botão de submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="animate-element animate-delay-800 w-full rounded-2xl bg-[#1B4B7C] py-4 text-md font-medium text-white transition-colors hover:bg-[#0F2C55] disabled:opacity-60"
              >
                {isSubmitting ? "Criando..." : "Criar conta"}
              </button>
            </form>

            {/* Link para login */}
            <p className="animate-element animate-delay-1100 text-center text-md text-[#1B4B7C]/80">
              Já possui uma conta?{" "}
              <button
                type="button"
                onClick={onSignIn}
                className="text-[#1B4B7C] underline-offset-2 hover:underline"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ========== Right Hero Image Section ========== */}
      {heroImageSrc && (
        <section className="relative hidden flex-1 p-4 md:block">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center shadow-md"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          />
        </section>
      )}
    </div>
  )
}
