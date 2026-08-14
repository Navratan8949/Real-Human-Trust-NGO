"use client"
import { useState, useEffect } from "react"
import { AdminCrudPage } from "@/components/admin/crud-page"
import { Button } from "@/components/ui/button"
import api from "@/service/api"
import { Eye, Download } from "lucide-react"
import { getFileUrl } from "@/lib/utils"

export default function Page() {
  const schema = [
    { name: "title", label: "Certificate Title", type: "text", required: true, placeholder: "e.g., 80G Certificate" },
    { name: "certificateNo", label: "Registration Number", type: "text", required: true, placeholder: "e.g., NGD/80G/2024/001" },
    { name: "issuedBy", label: "Issued By", type: "text", required: false, placeholder: "e.g., Income Tax Department" },
    { name: "issueDate", label: "Issue Date", type: "date", required: false },
    { name: "image", label: "Certificate Image (Preview)", type: "file", required: false },
    { name: "pdf", label: "PDF Document (Optional)", type: "file", required: false },
  ]

  const columns = [
    { key: "title", label: "Title" },
    { key: "certificateNo", label: "Certificate No." },
    { key: "issuedBy", label: "Issued By" },
    { key: "issueDate", label: "Issue Date", render: (r) => r.issueDate ? new Date(r.issueDate).toLocaleDateString() : "N/A" },    {
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
      customActions={(r) => (
        <>
          {r.image?.url && (
            <Button size="sm" variant="outline" asChild className="h-7 px-2">
              <a href={getFileUrl(r.image.url)} target="_blank" rel="noopener noreferrer">
                <Eye className="size-3.5 mr-1" /> View Image
              </a>
            </Button>
          )}
          {r.pdf?.url && (
            <Button size="sm" variant="outline" asChild className="h-7 px-2">
              <a href={getFileUrl(r.pdf.url)} target="_blank" rel="noopener noreferrer">
                <Download className="size-3.5 mr-1" /> PDF
              </a>
            </Button>
          )}
        </>
      )}
    />
  )
}
