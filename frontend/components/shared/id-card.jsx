import { QRCodeSVG } from "qrcode.react"
import { getFileUrl } from "@/lib/utils"

export function IdCard({ member, user, volunteer, verificationUrl }) {
  if (!member && !volunteer) return null

  const isVolunteer = !!volunteer
  const profileImageUrl = isVolunteer ? volunteer.profileImage?.url : (member?.profileImage?.url || user?.profileImage?.url)
  const profileImage = getFileUrl(profileImageUrl)
  const fullName = isVolunteer ? volunteer.fullName : user?.fullName
  const initial = fullName?.[0] || "?"
  const idNumber = isVolunteer ? volunteer.volunteerId : member?.memberId
  const bloodGroup = isVolunteer ? volunteer.bloodGroup : member?.bloodGroup
  const typeLabel = isVolunteer ? "Volunteer" : member?.membershipType
  
  return (
    <div className="flex justify-center w-full">
      <div id="id-card" className="relative w-full max-w-[380px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-border/60">
        {/* Card Header */}
        <div className={`p-4 text-center text-white ${isVolunteer ? "bg-emerald-600" : "bg-navy"}`}>
          <h2 className="font-serif text-base font-bold tracking-tight">REAL HUMAN EDUCATION & CHARITABLE TRUST</h2>
          <p className={`text-[9px] uppercase tracking-widest mt-0.5 ${isVolunteer ? "text-emerald-100" : "text-accent"}`}>
            Govt. Regd. NGO
          </p>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className={`flex h-full w-full items-center justify-center font-serif text-xl font-bold ${isVolunteer ? "text-emerald-700" : "text-navy"}`}>
                  {initial}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div>
                <p className="text-[9px] font-semibold uppercase text-muted-foreground">Name</p>
                <p className="text-[13px] font-bold text-navy leading-none truncate">{fullName}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase text-muted-foreground">{isVolunteer ? "Volunteer ID" : "Member ID"}</p>
                <p className="text-[13px] font-bold font-mono text-slate-700 leading-none">{idNumber || "Pending"}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase text-muted-foreground">Blood</p>
                  <p className="text-[12px] font-bold text-rose-600 leading-none">{bloodGroup || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase text-muted-foreground">Type</p>
                  <p className="text-[12px] font-bold text-slate-700 leading-none capitalize truncate">{typeLabel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-dashed border-slate-200 pt-3">
            <div>
              <p className="text-[8px] font-medium text-slate-500 truncate">Contact: +91 8735899909</p>
              <p className="text-[8px] font-medium text-slate-500 truncate">Address: Rajkot, Gujarat</p>
            </div>
            {/* Dynamic QR Code */}
            <div className="size-12 shrink-0 rounded bg-white p-0.5 border border-slate-200">
              <QRCodeSVG value={verificationUrl || "https://realhumantrust.org"} size={44} className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
