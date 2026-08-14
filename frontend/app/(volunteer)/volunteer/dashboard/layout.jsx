"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FileBadge, IdCard, LogOut, UserCircle2, Loader2, LayoutDashboard, Menu } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { selectUser, selectIsAuthenticated, selectAuthStatus, clearUser, fetchUser } from "@/redux/features/userSlice"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import api from "@/service/api"
import { getStoredToken } from "@/lib/auth-storage"

const NAV = [
  { href: "/volunteer/dashboard", label: "My Profile", icon: UserCircle2, exact: true },
  { href: "/volunteer/dashboard/id-card", label: "ID Card", icon: IdCard },
  { href: "/volunteer/dashboard/certificates", label: "Certificates", icon: FileBadge },
]

export default function VolunteerDashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const status = useSelector(selectAuthStatus)
  const [isChecking, setIsChecking] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout")
    } catch (e) {
      console.error(e)
    } finally {
      setIsMobileMenuOpen(false)
      dispatch(clearUser())
      router.push("/volunteer/login")
    }
  }

  useEffect(() => {
    const token = getStoredToken("volunteer")
    if (!token) {
      router.replace("/volunteer/login")
      return
    }
    if (token && !isAuthenticated && status !== "loading") {
      dispatch(fetchUser("volunteer"))
    }
  }, [dispatch, isAuthenticated, status, router])

  useEffect(() => {
    if (status === "succeeded" || status === "failed") {
      setIsChecking(false)
    }
    if (status === "failed" || (status === "succeeded" && user?.role !== "volunteer")) {
      dispatch(clearUser())
      router.replace("/volunteer/login")
    }
  }, [status, router, user, dispatch])

  if (isChecking || status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-[#f3f5f8]"><Loader2 className="size-8 animate-spin text-navy" /></div>
  }

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-serif text-lg font-bold text-white">Volunteer Panel</p>
          <p className="text-[11px] uppercase tracking-wider text-white/50">Real Human Trust</p>
        </div>
        <nav className="space-y-0.5 p-3">
          {NAV.map((item) => { 
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href); 
            const Icon = item.icon; 
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", active ? "bg-white/15 font-semibold text-white" : "text-white/65 hover:bg-white/10 hover:text-white")}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
              </Link>
            ) 
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-3">
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 hover:bg-white/10 hover:text-white">
          <LayoutDashboard className="size-4" />Back to Website
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 hover:bg-white/10 hover:text-white">
          <LogOut className="size-4" />Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-dvh bg-[#f3f5f8]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-navy text-white md:flex">
        {navContent}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/60 bg-white/90 px-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-white text-navy">
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-navy p-0 text-white border-none">
                <SheetTitle className="sr-only">Volunteer menu</SheetTitle>
                {navContent}
              </SheetContent>
            </Sheet>
            <span className="font-serif font-bold text-navy">Volunteer Dashboard</span>
          </div>

          <div className="flex size-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
            {user?.fullName?.[0] || "V"}
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
