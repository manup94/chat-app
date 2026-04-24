"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { Spinner } from "./spinner"
import Link from "next/link"
import { signupSchema } from "@/models/validation-schemas/signup.schema"
import { userSignup } from "@/use-cases/user-signup"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

export const SignupForm = () => {
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
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    try {
      const response = await userSignup(data)
      if (response) {
        const res = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        })
        if (res?.error != null) {
          if (res.status === 401) {
            setShowIncorrect(true)
          }
          reset()
        } else {
          const loginRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: data.email,
                password: data.password,
              }),
            }
          )
          const loginData = await loginRes.json()
          if (loginData.token) {
            localStorage.setItem("token", loginData.token)
          }

          toast.success(`Bienvenido ${data.name}`)
          router.push("/inicio")
          reset()
        }
      }
    } catch (error) {
      console.error(error)
      reset()
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-y-4 z-3 w-[260px] sm:w-[300px]"
    >
      <motion.fieldset
        initial={{ height: "40px" }}
        animate={{ height: errors.name ? "75px" : "40px" }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-y-1"
      >
        <input
          type="text"
          placeholder="Nombre de usuario"
          autoCapitalize="none"
          {...register("name")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              setFocus("email")
            }
          }}
          className={`border  ${
            errors.name
              ? "border-red-500"
              : "border-white focus:border-purple-800"
          } p-2 rounded text-white outline-none `}
        />
        {errors.name && (
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 text-xs"
          >
            {errors.name.message}
          </motion.span>
        )}
      </motion.fieldset>
      <motion.fieldset
        initial={{ height: "40px" }}
        animate={{ height: errors.email ? "60px" : "40px" }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-y-1"
      >
        <input
          type="text"
          placeholder="Email"
          autoCapitalize="none"
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
            <span className="text-sm font-bold">Registro</span>
          )}
        </button>
        <Link
          className="text-white text-xs font-semibold text-center p-2"
          href={"/login"}
        >
          Ya tienes cuenta? Inicia sesion aquí!
        </Link>
      </motion.fieldset>
    </form>
  )
}
