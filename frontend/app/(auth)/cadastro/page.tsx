/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import { SignUpPage } from "@/src/presentation/modules/auth/components/sign-up-page";

// ============================
//  Schema e Tipagem
// ============================
const signUpSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),

    terms: z.boolean().refine((val) => val === true, {
      message: "Aceite os termos para continuar",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

// ============================
//  Componente Principal
// ============================
export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();

  // Hook Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // ============================
  // 🚀 
  // ============================

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    try {
      const { error } = await signUp({ email, password, metadata: { name } });

      if (error) {
        toast.error("Erro ao cadastrar", { description: error });
        return;
      }

      toast.success("Cadastro realizado com sucesso", {
        description: "Verifique seu e-mail para confirmar a conta.",
      });

      router.replace("/login");
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado", {
        description: "Tente novamente mais tarde.",
      });
    }
  });

  const handleSignIn = React.useCallback(() => {
    router.push("/");
  }, [router]);

  // ============================
  //  Renderização
  // ============================
  return (
    <SignUpPage
      heroImageSrc="https://res.cloudinary.com/dotmxzn47/image/upload/v1752859202/1d9f565c5a617c8a11116594cd87719ac1dbf5a9_sww5r8.jpg"
      onSignUp={onSubmit}
      onSignIn={handleSignIn}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
}
