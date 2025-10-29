"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { SignInPageProps } from "../../props"


const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[#1B4B7C]/50 transition-colors focus-within:border-[#1B4B7C]/80">
    {children}
  </div>
)

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-[#1B4B7C] tracking-tighter text-4xl md:text-5xl">Bem-vindo</span>,
  description = "Acesse sua conta e continue sua jornada com a Grota Financiamentos",
  heroImageSrc,
  onSignIn,
  onResetPassword,
  onCreateAccount,
  register,
  errors,
  isSubmitting,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="h-dvh flex flex-col md:flex-row font-sans w-dvw bg-white">
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 font-semibold leading-tight">{title}</h1>
            <p className="animate-element animate-delay-200 text-[#1B4B7C]/80">{description}</p>
            <form className="space-y-5" onSubmit={onSignIn} noValidate>
              <div className="animate-element animate-delay-300">
                <label className="text-md font-medium text-[#1B4B7C]">E-mail</label>
                <GlassInputWrapper>
                  <input
                    {...(register ? register("email") : { name: "email" })}
                    type="email"
                    placeholder="Digite seu e-mail"
                    className="w-full bg-white text-[#1B4B7C] placeholder:text-[#1B4B7C]/50 text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
                {errors?.email && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.email.message)}</p>
                )}
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-md font-medium text-[#1B4B7C]">Senha</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      {...(register ? register("password") : { name: "password" })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      className="w-full bg-white text-[#1B4B7C] placeholder:text-[#1B4B7C]/50 text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-[#1B4B7C] hover:text-[#0F2C55] transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#1B4B7C] hover:text-[#0F2C55] transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="custom-checkbox" {...(register ? register("rememberMe") : { name: "rememberMe" })} />
                  <span className="text-[#1B4B7C]/90">Manter-me conectado</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    onResetPassword?.()
                  }}
                  className="hover:underline text-[#1B4B7C] transition-colors"
                >
                  Esqueci a senha
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="animate-element animate-delay-600 w-full rounded-2xl bg-[#1B4B7C] py-4 font-medium text-white hover:bg-[#0F2C55] transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="animate-element animate-delay-900 text-center text-sm text-[#1B4B7C]/80">
              Novo por aqui?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onCreateAccount?.()
                }}
                className="text-[#1B4B7C] hover:underline transition-colors"
              >
                Criar Conta
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          ></div>
        </section>
      )}
    </div>
  )
}
