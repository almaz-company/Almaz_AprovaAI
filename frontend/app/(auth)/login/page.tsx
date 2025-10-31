/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SignInPage } from "@/src/presentation/modules/auth/components/sign-in-page"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()

  const signInSchema = z.object({
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    rememberMe: z.boolean().optional().default(false),
  })

  type SignInForm = z.infer<typeof signInSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    //@ts-ignore
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const { error } = await signIn({ email, password })
    if (error) {
      toast.error("Erro ao entrar", { description: error })
      return
    }
    toast.success("Login realizado")
    const redirect = searchParams?.get("redirect")
    const target = redirect ? decodeURIComponent(redirect) : "/visao-geral"
    router.replace(target)
  })

  const handleResetPassword = () => {
    router.push("/esqueci-senha")
  }

  const handleCreateAccount = () => {
    router.push("/cadastro")
  }

  return (
    <SignInPage
      heroImageSrc="https://res.cloudinary.com/dotmxzn47/image/upload/v1752859202/1d9f565c5a617c8a11116594cd87719ac1dbf5a9_sww5r8.jpg"
      onSignIn={onSubmit}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  )
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
