"use client"
import { useState, useEffect } from "react"
import { AdminCrudPage } from "@/components/admin/crud-page"
import { Button } from "@/components/ui/button"
import api from "@/service/api"
import { Eye, Download } from "lucide-react"

export default function Page() {
  const schema = [
    { name: "title", label: "Certificate Title", type: "text", required: true, placeholder: "e.g., 80G Certificate" },
    { name: "certificateNo", label: "Certificate Number", type: "text", required: true, placeholder: "e.g., NGD/80G/2024/001" },
    { name: "issuedBy", label: "Issued By", type: "text", required: true, placeholder: "e.g., Income Tax Department" },
    { name: "issueDate", label: "Issue Date", type: "date", required: false },
    { name: "description", label: "Description", type: "textarea", required: false },
    { name: "template", label: "Certificate Template (HTML)", type: "textarea", required: false, placeholder: "<div>Certificate body HTML...</div>" },
    { name: "sealImage", label: "Seal / Stamp Image", type: "file", required: false },
    { name: "backgroundImage", label: "Certificate Background", type: "file", required: false },
    { name: "pdf", label: "PDF Document (Optional)", type: "file", required: false },
  ]

  const columns = [
    { key: "title", label: "Title" },
    { key: "certificateNo", label: "Certificate No." },
    { key: "issuedBy", label: "Issued By" },
    { key: "issueDate", label: "Issue Date", render: (r) => r.issueDate ? new Date(r.issueDate).toLocaleDateString() : "N/A" },
    {
      key: "sealImage",
      label: "Seal",
      render: (r) => r.sealImage?.url ? (
        <img src={r.sealImage.url} alt="Seal" className="h-10 w-10 object-cover rounded-full border" />
      ) : <span className="text-xs text-muted-foreground">-</span>
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/api/v1/ngo-certificates/${r._id || r.id}/preview`, "_blank")}
            className="h-7 px-2"
          >
            <Eye className="size-3.5 mr-1" /> Preview
          </Button>
          {r.pdf?.url && (
            <Button size="sm" variant="outline" asChild className="h-7 px-2">
              <a href={r.pdf.url} target="_blank" rel="noopener noreferrer">
                <Download className="size-3.5 mr-1" /> PDF
              </a>
            </Button>
          )}
        </div>
      )
    },
    {
      key: "isActive",
      label: "Status",
      render: (r) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${r.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ]

  return (
    <AdminCrudPage
      title="NGO Certificates"
      description="Manage official NGO/Government certificate templates for public display."
      endpoint="/ngo-certificates"
      schema={schema}
      columns={columns}
      primaryAction="Add Certificate"
    />
  )
}
