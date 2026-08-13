"use client"

import { useState, useEffect } from "react"
import { getNGOCertificates } from "@/service/ngo-certificate.service"
import { Award, Download, Eye } from "lucide-react"
import Image from "next/image"
import { getFileUrl, forceDownload } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const DEFAULT_CERTIFICATE_TEMPLATE = (cert) => ``

export default function Page() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNGOCertificates()
      .then(res => {
        if (res.success) setCertificates(res.certificates || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-navy/5 blur-[100px]" />

      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="text-center mb-12">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-navy mx-auto">
            <Award className="size-3.5" />
            Our Credentials
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-navy md:text-5xl">
            NGO Certificates
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We are proud to be recognized by various government bodies and institutions. Here are our official certificates and accreditations.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Award className="size-12 mx-auto mb-4 opacity-30" />
            <p>No certificates available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.filter(c => c.isActive !== false).map((cert) => (
              <div key={cert._id || cert.id} className="group flex flex-col rounded-2xl border border-border/60 bg-white shadow-soft hover:shadow-md transition-all duration-300">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                      <Award className="size-5" />
                    </div>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Active
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-lg font-bold text-navy leading-tight">{cert.title}</h3>
                  
                  <div className="mt-5 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 font-mono border-b border-slate-100 pb-2">
                      <span>Cert No:</span>
                      <span className="font-semibold text-slate-800">{cert.certificateNo}</span>
                    </div>
                    {cert.issueDate && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                        <span>Issue Date:</span>
                        <span className="font-semibold text-slate-800">{new Date(cert.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                    {cert.issuedBy && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500">
                        <span>Issued By:</span>
                        <span className="font-semibold text-slate-800 text-right max-w-[150px] truncate" title={cert.issuedBy}>{cert.issuedBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-dashed border-border/60 bg-slate-50 p-4 flex items-center gap-3 rounded-b-2xl">
                  {cert.image?.url ? (
                    <Dialog>
                      <DialogTrigger className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent/90">
                        <Eye className="size-4" /> View
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none" showCloseButton={false}>
                        <div className="relative rounded-2xl bg-black/90 p-4 shadow-2xl flex items-center justify-center min-h-[400px]">
                          <img src={getFileUrl(cert.image.url)} alt={cert.title} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : cert.pdf?.url ? (
                    <a 
                      href={getFileUrl(cert.pdf.url)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent/90"
                    >
                      <Eye className="size-4" /> View
                    </a>
                  ) : (
                    <button disabled className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-400 cursor-not-allowed">
                      <Eye className="size-4" /> View
                    </button>
                  )}

                  {(cert.pdf?.url || cert.image?.url) && (
                    <button 
                      onClick={() => forceDownload(getFileUrl(cert.pdf?.url || cert.image?.url), cert.title)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy/90"
                      title="Download"
                    >
                      <Download className="size-4" /> Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
