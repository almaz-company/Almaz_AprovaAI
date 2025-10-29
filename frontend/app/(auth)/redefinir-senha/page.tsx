"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const router = useRouter()

  const schema = z
    .object({
      password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
      confirm: z.string().min(1, "Confirme sua senha"),
    })
    .refine((d) => d.password === d.confirm, {
      message: "As senhas não conferem",
      path: ["confirm"],
    })

  type Form = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } })

  const onSubmit = handleSubmit(async ({ password }) => {
    const { error } = await updatePassword(password)
    if (error) {
      toast.error("Erro ao atualizar senha", { description: error })
      return
    }
    toast.success("Senha atualizada", { description: "Faça login novamente." })
    router.replace("/login")
  })

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4" noValidate>
        <h1 className="text-2xl font-semibold text-[#1B4B7C]">Definir nova senha</h1>
        <label className="block">
          <span className="text-sm text-[#1B4B7C]">Nova senha</span>
          <input
            type="password"
            {...register("password")}
            className="mt-1 w-full border rounded-md p-3"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{String(errors.password.message)}</p>}
        </label>
        <label className="block">
          <span className="text-sm text-[#1B4B7C]">Confirmar senha</span>
          <input
            type="password"
            {...register("confirm")}
            className="mt-1 w-full border rounded-md p-3"
            placeholder="••••••••"
          />
          {errors.confirm && <p className="mt-1 text-sm text-red-600">{String(errors.confirm.message)}</p>}
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[#1B4B7C] py-3 text-white hover:bg-[#0F2C55] disabled:opacity-60"
        >
          {isSubmitting ? "Atualizando..." : "Atualizar senha"}
        </button>
      </form>
    </main>
  )
}
