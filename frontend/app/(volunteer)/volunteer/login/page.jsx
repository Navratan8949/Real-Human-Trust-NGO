"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { useDispatch } from "react-redux"
import { fetchUser, setUser } from "@/redux/features/userSlice"
import { loginVolunteer } from "@/service/volunteer.service"
import { clearStoredSession } from "@/lib/auth-storage"
import api from "@/service/api"

export default function VolunteerLogin() {
  const router = useRouter()
  const dispatch = useDispatch()
  
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: ""
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    clearStoredSession()
    api.get("/auth/logout", { skipAuth: true }).catch(() => {})
  }, [])

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await loginVolunteer(formData)
      if (res.success) {
        dispatch(setUser({
          user: res.user,
          token: res.token,
        }))
        await dispatch(fetchUser("volunteer")).unwrap()
        router.push("/volunteer/dashboard")
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-border/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-navy/5">
            <span className="font-serif text-2xl font-bold text-navy">V</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-navy">Volunteer Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back, helper!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 p-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Email or Mobile</label>
            <input 
              required 
              type="text" 
              name="emailOrMobile" 
              value={formData.emailOrMobile} 
              onChange={handleChange} 
              className="w-full rounded-xl border border-border/60 bg-transparent px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Password</label>
            <input 
              required 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full rounded-xl border border-border/60 bg-transparent px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy" 
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-6 h-12 w-full rounded-xl bg-navy text-base font-semibold text-white hover:bg-navy/90">
            {loading ? <Loader2 className="mr-2 size-5 animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/volunteer" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-navy">
            <ArrowLeft className="mr-2 size-4" />
            Not a volunteer yet? Apply here
          </Link>
        </div>
      </div>
    </div>
  )
}
