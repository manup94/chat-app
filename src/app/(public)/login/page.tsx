import { AnimatedTitle } from "@/components/animated-login-title"
import { LoginForm } from "@/components/login-form"
import Orb from "@/components/orb"

export default function LoginPage() {
  return (
    <div className="flex flex-col sm:rounded-lg items-center justify-center gap-y-6 bg-black sm:min-w-xl w-full sm:w-fit h-screen sm:h-[calc(100vh-10rem)] px-6 relative overflow-hidden">
      <AnimatedTitle title="Iniciar sesión" />
      <LoginForm />
      <div className="w-[600px] h-[600px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Orb
          hoverIntensity={0}
          rotateOnHover={false}
          hue={20}
          forceHoverState={false}
        />
      </div>
    </div>
  )
}
