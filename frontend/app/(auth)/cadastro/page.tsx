/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { useRouter } from "next/navigation"
import { SignUpPage } from "@/src/presentation/modules/auth/components/sign-up-page"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

export default function SignUp() {
  const router = useRouter()
  const { signUp } = useAuth()

  const signUpSchema = z
    .object({
      name: z.string().min(2, "Informe seu nome"),
      email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
      password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
      confirmPassword: z.string().min(1, "Confirme sua senha"),
      //@ts-ignore
      terms: z.literal(true, { errorMap: () => ({ message: "Aceite os termos para continuar" }) }),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: "As senhas não conferem",
      path: ["confirmPassword"],
    })

  type SignUpForm = z.infer<typeof signUpSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", terms: false },
  })

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    const { error } = await signUp({ email, password, metadata: { name } })
    if (error) {
      toast.error("Erro ao cadastrar", { description: error })
      return
    }
    toast.success("Cadastro realizado", { description: "Verifique seu e-mail para confirmar a conta." })
    router.replace("/login")
  })

  const handleSignIn = () => {
    router.push("/login")
  }

  return (
    <SignUpPage
      heroImageSrc="https://res.cloudinary.com/dx1659yxu/image/upload/v1760451243/linda-mulher-comprando-um-carro_lp9oo0.jpg"
      onSignUp={onSubmit}
      onSignIn={handleSignIn}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  )
}
