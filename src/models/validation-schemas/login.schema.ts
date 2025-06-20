import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string({ required_error: "El email es obligatorio" })
    .email({ message: "El email no es válido" }),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

export type LoginSchema = z.infer<typeof loginSchema>
