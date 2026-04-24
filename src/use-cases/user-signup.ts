export const userSignup = async (data: {
  name: string
  email: string
  password: string
}) => {
  const { name, email, password } = data

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  })

  if (!res.ok) {
    throw new Error("Error en el registro")
  }

  const user = await res.json()
  return user
}
