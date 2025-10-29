
import type { FieldErrors, UseFormRegister } from "react-hook-form"

export interface SignUpPageProps {
  heroImageSrc?: string
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void
  onSignIn?: () => void
  // react-hook-form integration (optional)
  register?: UseFormRegister<any>
  errors?: FieldErrors<any>
  isSubmitting?: boolean
}

export interface SignInPageProps {
  title?: React.ReactNode
  description?: React.ReactNode
  heroImageSrc?: string
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void
  onResetPassword?: () => void
  onCreateAccount?: () => void
  // react-hook-form integration (optional)
  register?: UseFormRegister<any>
  errors?: FieldErrors<any>
  isSubmitting?: boolean
}
