"use client"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { selectUser } from "@/redux/features/userSlice"
import { Button } from "@/components/ui/button"
import { Loader2, Printer } from "lucide-react"
import { toast } from "sonner"
import api from "@/service/api"
import { IdCard } from "@/components/shared/id-card"

export default function VolunteerIdCard() {
  const user = useSelector(selectUser)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get("/volunteers/me", { authRole: "volunteer" })
      setProfile(res.data.volunteer)
    } catch (err) {
      toast.error("Failed to load profile for ID card")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="size-8 animate-spin text-navy" /></div>

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy">My ID Card</h1>
        <p className="text-sm text-muted-foreground">View and download your official volunteer ID card.</p>
      </div>

      <div className="max-w-md rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-navy">Volunteer ID Card</h2>
          <Button onClick={() => window.print()} size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs">
            <Printer className="mr-1.5 size-3" /> Print
          </Button>
        </div>
        
        <div className="flex justify-center bg-slate-50 py-4 rounded-xl border border-dashed border-border">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * { visibility: hidden; }
              #id-card, #id-card * { visibility: visible; }
              #id-card { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
            }
          `}} />
          <IdCard 
            volunteer={profile} 
            verificationUrl={`https://realhumantrust.org/verify/volunteer/${profile?.volunteerId}`}
          />
        </div>
        
        <p className="mt-4 text-center text-xs text-muted-foreground">
          This card is officially issued by Real Human Trust.
        </p>
      </div>
    </div>
  )
}
