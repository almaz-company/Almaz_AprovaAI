"use client"

import type React from "react"
import { useState } from "react"
import { Eye,  } from "lucide-react"
import { SignUpPageProps } from "../../props"


const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[#1B4B7C]/50 bg-white backdrop-blur-sm transition-colors focus-within:border-[#1B4B7C]/80 ">
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
    <div className="h-[100dvh] flex flex-col md:flex-row font-sans w-[100dvw] bg-white">
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <p className="animate-element animate-delay-200 text-[#1B4B7C] text-2xl font-semibold">
              Crie sua conta
            </p>

            <form className="space-y-5" onSubmit={onSignUp} noValidate>
              <div className="animate-element animate-delay-300">
                <label className="text-md font-medium text-[#1B4B7C]">Nome Completo</label>
                <GlassInputWrapper>
                  <input
                    {...(register ? register("name") : { name: "name" })}
                    type="text"
                    placeholder="Digite seu nome completo"
                    className="w-full bg-transparent text-black text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
                {errors?.name && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.name.message)}</p>
                )}
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-md font-medium text-[#1B4B7C]">E-mail</label>
                <GlassInputWrapper>
                  <input
                    {...(register ? register("email") : { name: "email" })}
                    type="email"
                    placeholder="Digite seu e-mail"
                    className="w-full bg-transparent text-black text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
                {errors?.email && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.email.message)}</p>
                )}
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-md font-medium text-[#1B4B7C]">Senha</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      {...(register ? register("password") : { name: "password" })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
                      className="w-full bg-transparent text-black text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <Eye className="w-5 h-5 text-[#1B4B7C] hover:text-[#0F2C55] transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#1B4B7C] hover:text-[#0F2C55] transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
                {errors?.password && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.password.message)}</p>
                )}
              </div>

              <div className="animate-element animate-delay-600">
                <label className="text-md font-medium text-[#1B4B7C]">Confirmar Senha</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      {...(register ? register("confirmPassword") : { name: "confirmPassword" })}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      className="w-full bg-transparent text-black text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                       <Eye className="w-5 h-5 text-[#1B4B7C] hover:text-[#0F2C55] transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#1B4B7C] hover:text-[#0F2C55] transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
                {errors?.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.confirmPassword.message)}</p>
                )}
                <div className="mt-5 text-center bg-zinc-400 h-14 py-5 px-5">
                  Google Recaptcha
                </div>
              </div>

              <div className="animate-element animate-delay-700 flex items-start gap-3 text-md">
                <input type="checkbox" className="custom-checkbox mt-0.5" {...(register ? register("terms") : { name: "terms" })} />
                <span className="text-[#1B4B7C]/90">
                  Eu concordo com os{" "}
                  <a href="#" className="text-[#1B4B7C] hover:underline">
                    Termos de ServiÃ§o
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-[#1B4B7C] hover:underline">
                    PolÃ­tica de Privacidade
                  </a>
                </span>
              </div>
              {errors?.terms && (
                <p className="mt-1 text-sm text-red-600">{String(errors.terms.message)}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="animate-element animate-delay-800 w-full text-md rounded-2xl bg-[#1B4B7C] py-4 font-medium text-white hover:bg-[#0F2C55] transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Criando..." : "Criar Conta"}
              </button>
            </form>

            <p className="animate-element animate-delay-1100 text-center text-md text-[#1B4B7C]/80">
              JÃ¡ possui uma conta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onSignIn?.()
                }}
                className="text-[#1B4B7C] hover:underline transition-colors"
              >
                Entrar
              </a>
            </p>
          </div>
        </div>
      </section>

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
