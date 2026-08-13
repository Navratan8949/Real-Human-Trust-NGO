"use client"

import { useState, useEffect } from "react"
import { getNGOCertificates } from "@/service/ngo-certificate.service"
import { Award, ExternalLink, Download } from "lucide-react"
import Image from "next/image"

const DEFAULT_CERTIFICATE_TEMPLATE = (cert) => `
  <div style="text-align:center; padding: 40px 30px; font-family: 'Georgia', serif;">
    <div style="border: 4px double #1a3c6c; padding: 30px; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1a3c6c; font-size: 32px; margin: 0; font-weight: bold; letter-spacing: 2px;">CERTIFICATE</h1>
        <div style="width: 80px; height: 3px; background: #d4af37; margin: 10px auto;"></div>
      </div>
      <p style="font-size: 16px; color: #555; margin-bottom: 25px;">This is to certify that</p>
      <h2 style="color: #1a3c6c; font-size: 24px; margin-bottom: 20px; font-weight: bold;">Real Human Education & Charitable Trust</h2>
      <p style="font-size: 15px; color: #444; line-height: 1.8; margin-bottom: 20px;">
        is a registered organization under the<br/>
        <strong style="color: #1a3c6c;">${cert.issuedBy || "Government Authority"}</strong><br/>
        <strong>Certificate No: ${cert.certificateNo}</strong>
      </p>
      ${cert.description ? `<p style="font-size: 14px; color: #666; margin-bottom: 25px; font-style: italic;">"${cert.description}"</p>` : ''}
      <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="text-align: left;">
          <div style="border-top: 1px solid #1a3c6c; width: 150px; padding-top: 5px; font-size: 12px; color: #666;">Date of Issue</div>
          <p style="font-weight: bold; color: #1a3c6c; margin-top: 5px;">${cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style="text-align: center;">
          ${cert.sealImage?.url ? `<img src="${cert.sealImage.url}" alt="Official Seal" style="width: 80px; height: 80px; object-fit: contain; border-radius: 50%; border: 2px solid #d4af37;" />` : '<div style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #d4af37; display: flex; align-items: center; justify-content: center; color: #d4af37; font-size: 12px; margin: 0 auto;">OFFICIAL SEAL</div>'}
          <p style="font-size: 11px; color: #888; margin-top: 5px;">Authorized Signature</p>
        </div>
      </div>
    </div>
  </div>
`

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
              <div key={cert._id || cert.id} className="group rounded-3xl border border-border bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Certificate Preview */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {cert.backgroundImage?.url ? (
                    <Image src={cert.backgroundImage.url} alt={cert.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                      <Award className="size-16 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                </div>
                
                {/* Certificate Template Render */}
                <div className="p-6">
                  <div 
                    className="certificate-template rounded-xl border border-border/60 bg-white p-6 shadow-sm"
                    dangerouslySetInnerHTML={{ __html: cert.populatedTemplate || cert.template || DEFAULT_CERTIFICATE_TEMPLATE(cert) }}
                  />
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy">{cert.title}</h3>
                      <p className="text-xs text-muted-foreground font-mono">Cert No: {cert.certificateNo}</p>
                    </div>
                    {cert.pdf?.url && (
                      <a href={cert.pdf.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-accent bg-navy/5 hover:bg-navy/10 px-3 py-1.5 rounded-lg transition-colors">
                        <Download className="size-3.5" /> PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
