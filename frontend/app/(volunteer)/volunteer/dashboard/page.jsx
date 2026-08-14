"use client"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { selectUser } from "@/redux/features/userSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Camera, Download, Printer } from "lucide-react"
import { toast } from "sonner"
import api from "@/service/api"
import { IdCard } from "@/components/shared/id-card"

export default function VolunteerDashboard() {
  const user = useSelector(selectUser)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get("/volunteers/me")
      setProfile(res.data.volunteer)
      setFormData({
        fullName: res.data.volunteer.fullName,
        mobile: res.data.volunteer.mobile,
        address: res.data.volunteer.address,
        bloodGroup: res.data.volunteer.bloodGroup || "",
        dob: res.data.volunteer.dob || "",
        gender: res.data.volunteer.gender || "",
      })
      if (res.data.volunteer.profileImage?.url) {
        setPreviewUrl(res.data.volunteer.profileImage.url)
      }
    } catch (err) {
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key])
      })
      if (selectedFile) {
        formDataToSend.append("profileImage", selectedFile)
      }

      const res = await api.put("/volunteers/me", formDataToSend)
      setProfile(res.data.volunteer)
      toast.success("Profile updated successfully")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-navy" /></div>

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy via-navy/90 to-blue-900 p-8 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row">
          <div className="group relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-white/20 bg-white shadow-inner transition-all hover:border-white/40">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl font-bold text-navy">{profile?.fullName?.[0]}</div>
            )}
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
              <Camera className="size-8 text-white mb-2" />
              <span className="absolute bottom-4 text-xs font-medium text-white">Change</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          
          <div className="text-center sm:text-left">
            <div className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wider text-white backdrop-blur-md">
              VOLUNTEER
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{profile?.fullName}</h1>
            <p className="mt-1 text-blue-100">{profile?.email}</p>
            {profile?.volunteerId && (
              <p className="mt-2 text-sm font-medium text-white/70">ID: {profile?.volunteerId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quick Info Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/50 bg-white/50 p-6 shadow-sm backdrop-blur-xl">
            <h3 className="font-serif text-lg font-semibold text-navy">Account Status</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Registration Date</p>
                <p className="font-medium text-navy">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <span className="size-1.5 rounded-full bg-emerald-500"></span>
                  {profile?.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Active'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-border/50 bg-white p-8 shadow-sm">
            <div className="mb-6 border-b border-border/50 pb-4">
              <h2 className="font-serif text-xl font-bold text-navy">Personal Details</h2>
              <p className="text-sm text-muted-foreground mt-1">Update your personal information and contact details.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-navy font-semibold">Full Name</Label>
                  <Input name="fullName" value={formData.fullName} onChange={handleChange} required className="h-11 rounded-xl bg-slate-50/50" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-navy font-semibold">Mobile Number</Label>
                  <Input name="mobile" value={formData.mobile} onChange={handleChange} required className="h-11 rounded-xl bg-slate-50/50" />
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-navy font-semibold">Complete Address</Label>
                  <Input name="address" value={formData.address} onChange={handleChange} className="h-11 rounded-xl bg-slate-50/50" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-navy font-semibold">Date of Birth</Label>
                  <Input type="date" name="dob" value={formData.dob} onChange={handleChange} className="h-11 rounded-xl bg-slate-50/50" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-navy font-semibold">Gender</Label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className="flex h-11 w-full rounded-xl border border-input bg-slate-50/50 px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-navy font-semibold">Blood Group</Label>
                  <Input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g. O+" className="h-11 rounded-xl bg-slate-50/50" />
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-end border-t border-border/50 pt-6">
                <Button type="submit" disabled={saving} className="h-11 rounded-xl bg-navy px-8 text-base font-semibold shadow-md hover:bg-navy/90 hover:shadow-lg transition-all">
                  {saving ? (
                    <><Loader2 className="mr-2 size-5 animate-spin" /> Saving Changes...</>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
