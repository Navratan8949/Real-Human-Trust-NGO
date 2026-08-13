"use client"
import { useState, useEffect } from "react"
import { AdminCrudPage, StatusBadge } from "@/components/admin/crud-page"
import { getMembers } from "@/service/member.service"
import { getVolunteers } from "@/service/volunteer.service"
import { getFileUrl } from "@/lib/utils"

export default function Page() {
  const [recipientOptions, setRecipientOptions] = useState([])
  
  useEffect(() => {
    Promise.all([
      getMembers().catch(() => ({ members: [] })),
      getVolunteers().catch(() => ({ volunteers: [] }))
    ]).then(([memRes, volRes]) => {
      const options = []
      if (memRes.members) {
        memRes.members.forEach(m => {
          options.push({
            label: `[Member] ${m.user?.fullName || 'Unknown'} (${m.memberId})`,
            value: `member_${m._id || m.id}`
          })
        })
      }
      if (volRes.volunteers) {
        volRes.volunteers.filter(v => v.status === "approved").forEach(v => {
          options.push({
            label: `[Volunteer] ${v.fullName} (${v.volunteerId || 'Pending'})`,
            value: `volunteer_${v._id || v.id}`
          })
        })
      }
      setRecipientOptions(options)
    })
  }, [])

  const certificateSchema = [
    { 
      name: "recipient", 
      label: "Select Recipient", 
      type: "select", 
      required: true,
      options: recipientOptions
    },
    { name: "certificateNo", label: "Certificate Number", type: "text", required: true },
    { name: "title", label: "Certificate Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: false },
    { 
      name: "status", 
      label: "Status", 
      type: "select", 
      required: true,
      options: [
        { label: "Active", value: "active" },
        { label: "Cancelled", value: "cancelled" }
      ] 
    }
  ]

  const columns = [
    { key: "certificateNo", label: "Cert No." },
    { key: "title", label: "Title" },
    { 
      key: "recipient", 
      label: "Issued To",
      render: (r) => {
        if (r.member) return <span className="text-blue-700 font-medium">[Member] {r.member?.user?.fullName}</span>
        if (r.volunteer) return <span className="text-emerald-700 font-medium">[Volunteer] {r.volunteer?.fullName}</span>
        return "Unknown"
      }
    },
    { 
      key: "pdf", 
      label: "Document",
      render: (r) => {
        if (!r.pdf?.url) return <span className="text-muted-foreground text-xs">No File</span>
        const isImage = r.pdf.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
        return isImage ? (
          <div className="relative h-12 w-20 overflow-hidden rounded border">
            <img src={getFileUrl(r.pdf.url)} alt="Certificate" className="h-full w-full object-cover" />
          </div>
        ) : (
          <a href={getFileUrl(r.pdf.url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View PDF</a>
        )
      }
    },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> }
  ]

  return (
    <AdminCrudPage
      title="Certificates"
      description="Issue and manage certificates for registered members and volunteers."
      endpoint="/certificates"
      schema={certificateSchema}
      columns={columns}
      onBeforeSubmit={(data) => {
        // Parse the composite recipient value back into memberId or volunteerId
        const parsedData = { ...data }
        if (parsedData.recipient) {
          const [type, id] = parsedData.recipient.split("_")
          if (type === "member") {
            parsedData.memberId = id
            parsedData.member = id
            parsedData.volunteerId = null
          } else if (type === "volunteer") {
            parsedData.volunteerId = id
            parsedData.volunteer = id
            parsedData.memberId = null
          }
          delete parsedData.recipient
        }
        return parsedData
      }}
    />
  )
}
