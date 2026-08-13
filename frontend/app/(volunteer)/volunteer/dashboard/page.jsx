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

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="size-8 animate-spin text-navy" /></div>

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy">My Profile & ID Card</h1>
        <p className="text-sm text-muted-foreground">Manage your volunteer details and download your ID card.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-semibold text-navy">Personal Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-border bg-slate-50">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl font-bold text-navy/20">{profile?.fullName?.[0]}</div>
                  )}
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                    <Camera className="size-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-navy">{profile?.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Mobile Number</Label>
                  <Input name="mobile" value={formData.mobile} onChange={handleChange} required />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Address</Label>
                  <Input name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label>Blood Group</Label>
                  <Input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g. O+" />
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
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
      </div>
    </div>
  )
}
