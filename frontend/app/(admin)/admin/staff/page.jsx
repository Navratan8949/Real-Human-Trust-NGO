"use client"
import { AdminCrudPage } from "@/components/admin/crud-page"
import Image from "next/image"

const staffSchema = [
  { name: "fullName", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "mobile", label: "Mobile Number", type: "text", required: true },
  { name: "password", label: "Password (Required for new staff)", type: "text", required: true, placeholder: "Set a password" },
  { 
    name: "role", 
    label: "Staff Role", 
    type: "select", 
    required: true,
    options: [
      { label: "Admin", value: "admin" },
      { label: "Manager", value: "manager" },
      { label: "Coordinator", value: "coordinator" }
    ] 
  },
  {
    name: "profileImage",
    label: "Profile Photo",
    type: "file",
    required: false,
  },
  {
    name: "isActive",
    label: "Account Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive (Deactivated)", value: "false" }
    ]
  }
]

export default function Page() {
  return (
    <AdminCrudPage
      title="Staff Management"
      description="Manage Admins, Managers, and Coordinators. Only Super Admins can add or edit staff members."
      endpoint="/users"
      schema={staffSchema}
      disableActions={(row) => row.role === 'super_admin'}
      columns={[
        { key: "fullName", label: "Name", render: (r) => (
          <div className="flex items-center gap-3">
            {r.profileImage?.url ? (
              <Image src={r.profileImage.url} alt={r.fullName} width={36} height={36} className="rounded-full object-cover shrink-0 border" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-navy/10 flex items-center justify-center text-sm font-bold text-navy shrink-0">
                {r.fullName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <span className="font-semibold">{r.fullName}</span>
          </div>
        )},
        { key: "email", label: "Email" },
        { key: "mobile", label: "Mobile" },
        { key: "role", label: "Role", render: (r) => <span className="capitalize font-semibold text-navy">{r.role}</span> },
        { key: "status", label: "Status", render: (r) => (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${r.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {r.isActive ? 'Active' : 'Inactive'}
          </span>
        )}
      ]}
    />
  )
}
