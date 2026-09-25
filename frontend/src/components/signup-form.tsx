"use client"
import { cn, isTokenValid } from "@/lib/utils"
import { AuthField, PasswordField, FormAlert, SubmitButton, GoogleButton, OrDivider } from "@/components/auth-fields"
import Link from "next/link"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState<string>("")
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
      const nextAuthToken = (session as any)?.backendToken;
      if (nextAuthToken && isTokenValid(nextAuthToken)) {
        router.push("/dashboard");
      } else if (nextAuthToken) {
        signOut({ redirect: false });
      }
    }
  }, [status, session, router]);

  const signup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await axios.post<AuthResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/signup`, {
        name,
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

        setSuccess("Account created. Taking you to your dashboard…")

        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }

      setName("")
      setEmail("")
      setPassword("")
    } catch (err: unknown) {
      console.error("Error signing up:", err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong during signup.")
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <GoogleButton />
      <OrDivider />

      <form onSubmit={signup} className="flex flex-col gap-4">
        {error && <FormAlert type="error">{error}</FormAlert>}
        {success && <FormAlert type="success">{success}</FormAlert>}

        <AuthField
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          disabled={loading}
        />

        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />

        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>

      <p className="text-center text-sm text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-white hover:text-brand transition-colors">Log in</Link>
      </p>
    </div>
  )
}
