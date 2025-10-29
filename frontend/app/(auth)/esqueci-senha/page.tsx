"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const router = useRouter()

  const schema = z.object({
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  })
  type Form = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: "" } })

  const onSubmit = handleSubmit(async ({ email }) => {
    const { error } = await resetPassword(email.trim())
    if (error) {
      toast.error("Erro ao enviar e-mail", { description: error })
      return
    }
    toast.success("E-mail de recuperação enviado", { description: "Verifique sua caixa de entrada." })
    router.replace("/login")
  })

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4" noValidate>
        <h1 className="text-2xl font-semibold text-[#1B4B7C]">Recuperar senha</h1>
        <label className="block">
          <span className="text-sm text-[#1B4B7C]">E-mail</span>
          <input
            type="email"
            {...register("email")}
            className="mt-1 w-full border rounded-md p-3"
            placeholder="seu@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{String(errors.email.message)}</p>}
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[#1B4B7C] py-3 text-white hover:bg-[#0F2C55] disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
        </button>
        <button type="button" onClick={() => router.push("/login")} className="w-full text-[#1B4B7C] underline">
          Voltar para login
        </button>
      </form>
    </main>
  )
}
