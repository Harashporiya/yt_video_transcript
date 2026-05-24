"use client"
import { cn, isTokenValid } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { SpinnerGapIcon } from "@phosphor-icons/react"

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      if (!isTokenValid(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else {
        router.push("/dashboard");
        return;
      }
    }
    
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await axios.post<AuthResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/login`, {
        email,
        password
      })

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        const userData = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email
        };
        localStorage.setItem("user", JSON.stringify(userData))

        setSuccess("Successful login!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    } catch (err: unknown) {
      console.error("Error logging in:", err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid credentials.")
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-5 w-full", className)} {...props}>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm text-center font-medium">
            {success}
          </div>
        )}
        
        <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-12 px-4 text-base rounded-lg border-white/10 bg-[#2f2f2f] text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/30"
            />
        </div>
        
        <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-12 px-4 text-base rounded-lg border-white/10 bg-[#2f2f2f] text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/30"
            />
        </div>
        
        <Button 
            type="submit" 
            disabled={loading}
            className="h-12 w-full text-base font-bold rounded-lg bg-white hover:bg-white/90 text-black transition-colors"
        >
          {loading ? <SpinnerGapIcon className="animate-spin mr-2" size={20} /> : null}
          Continue
        </Button>
        
        <div className="text-center mt-2 text-sm text-white/60">
            Don&apos;t have an account? <Link href="/signup" className="text-white hover:underline font-bold">Sign up</Link>
        </div>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#212121] px-2 text-white/50">
            OR
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button 
            variant="outline" 
            type="button" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="h-12 w-full text-base font-medium rounded-lg border-white/20 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white transition-colors relative"
        >
          <svg className="absolute left-4 size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Continue with Google
        </Button>
      </div>
    </div>
  )
}
