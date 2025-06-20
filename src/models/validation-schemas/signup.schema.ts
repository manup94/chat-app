import { z } from "zod"

export const signupSchema = z.object({
  name: z
    .string({ required_error: "El nombre de usuario es obligatorio" })
    .min(3, {
      message: "El nombre de usuario debe tener al menos 3 caracteres",
    }),
  email: z
    .string({ required_error: "El email es obligatorio" })
    .email({ message: "El email no es válido" }),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

export type SignupSchema = z.infer<typeof signupSchema>
