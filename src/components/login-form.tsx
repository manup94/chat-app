"use client"

import { loginSchema } from "@/models/validation-schemas/login.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import { getSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Spinner } from "./spinner"
import Link from "next/link"
import { toast } from "sonner"

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showIncorrect, setShowIncorrect] = useState(false)
  const router = useRouter()

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    setFocus,
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      }).then(async (res) => {
        if (res?.error != null) {
          if (res.status === 401) {
            setShowIncorrect(true)
            toast.error("Email o contraseña incorrectos")
          }
          reset()
        } else {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
          })

          const session = await getSession()
          toast.success(`Bienvenido ${session?.user?.name}`)
          router.push("/inicio")
          reset()
        }
      })
    } catch (error) {
      toast.error("Ha ocurrido un error al iniciar sesión")
      console.error(error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-y-4 z-3 w-[260px] sm:w-[300px]"
    >
      <motion.fieldset
        initial={{ height: "40px" }}
        animate={{ height: errors.email ? "60px" : "40px" }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-y-1"
      >
        <input
          type="text"
          autoCapitalize="none"
          placeholder="Email"
          {...register("email")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              setFocus("password")
            }
          }}
          className={`border  ${
            errors.email
              ? "border-red-500"
              : "border-white focus:border-purple-800"
          } p-2 rounded text-white outline-none `}
        />
        {errors.email && (
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 text-xs"
          >
            {errors.email.message}
          </motion.span>
        )}
      </motion.fieldset>
      <motion.fieldset
        initial={{ height: "40px" }}
        animate={{ height: errors.password ? "60px" : "40px" }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-y-1"
      >
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            autoCapitalize="none"
            {...register("password")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSubmit(onSubmit)()
              }
            }}
            className={`border ${
              errors.password
                ? "border-red-500"
                : "border-white focus:border-purple-800"
            } p-2 rounded text-white outline-none w-full pr-10`}
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
          >
            {showPassword ? <Eye /> : <EyeOff />}
          </span>
        </div>
        {errors.password && (
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 text-xs"
          >
            {errors.password.message}
          </motion.span>
        )}
      </motion.fieldset>
      <motion.fieldset
        initial={{ height: "40px" }}
        animate={{ height: errors.password ? "60px" : "40px" }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-y-1"
      >
        {showIncorrect && (
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 text-xs"
          >
            {showIncorrect && "Email o contraseña incorrectos"}
          </motion.span>
        )}
        <button
          disabled={isSubmitting}
          type="submit"
          className="bg-purple-800 text-white p-2 rounded hover:bg-purple-900 mt-2 transform transition duration-200 hover:cursor-pointer flex items-center justify-center"
        >
          {isSubmitting ? (
            <Spinner />
          ) : (
            <span className="text-sm font-bold">Login</span>
          )}
        </button>
        <Link
          className="text-white text-xs font-semibold text-center p-2"
          href={"/signup"}
        >
          ¿No tienes cuenta? Unete!
        </Link>
      </motion.fieldset>
    </form>
  )
}
