"use client"
import { useState } from "react"
import { AdminCrudPage, StatusBadge } from "@/components/admin/crud-page"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Eye, Printer, FileBadge, XCircle, Loader2 } from "lucide-react"
import { IdCard } from "@/components/shared/id-card"
import api from "@/service/api"

const volunteerSchema = [
  { name: "fullName", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "mobile", label: "Mobile Number", type: "text", required: true },
  { name: "password", label: "Password", type: "text", required: true, placeholder: "Create a password for this volunteer" },
  { name: "address", label: "Address", type: "text" },
  { name: "message", label: "Message / Skills", type: "textarea" },
  { name: "profileImage", label: "Profile Image", type: "file" },
  { 
    name: "status", 
    label: "Status", 
    type: "select", 
    required: true,
    options: [
      { label: "Pending", value: "pending" },
      { label: "Approved", value: "approved" },
      { label: "Rejected", value: "rejected" }
    ] 
  }
]

export default function Page() {
  const [selectedVolunteer, setSelectedVolunteer] = useState(null)
  const [idCardVolunteer, setIdCardVolunteer] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [volunteerCertificates, setVolunteerCertificates] = useState([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  const loadDetails = async (volunteer) => {
    setLoadingDetails(true)
    try {
      const res = await api.get(`/certificates?volunteerId=${volunteer._id || volunteer.id}`)
      setVolunteerCertificates(res.data?.data || res.data?.certificates || [])
    } catch (e) {
      setVolunteerCertificates([])
    }
    setLoadingDetails(false)
  }

  const handleView = async (volunteer, tab = "details") => {
    setSelectedVolunteer(volunteer)
    setActiveTab(tab)
    if (tab === "certificates") {
      await loadDetails(volunteer)
    }
  }

  const handleAction = async (action, id) => {
    if (action === 'approve') {
      if (!confirm(`Are you sure you want to approve this volunteer? They will receive an email with login instructions.`)) return;
    }
    
    setIsProcessing(true)
    try {
      await api.put(`/volunteers/${id}/status`, { status: action })
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || "Action failed")
      setIsProcessing(false)
    }
  }

  return (
    <>
      <AdminCrudPage
        title="Volunteers"
        description="Manage all volunteer applications and registrations."
        endpoint="/volunteers"
        schema={volunteerSchema}
        columns={[
          { key: "volunteerId", label: "Volunteer ID", render: (r) => r.volunteerId || "-" },
          { key: "fullName", label: "Name" },
          { key: "email", label: "Email" },
          { key: "mobile", label: "Mobile" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleView(r, "details")} className="rounded-lg h-7 px-3 bg-navy/5 text-navy hover:bg-navy hover:text-white border-navy/20">
                  <Eye className="size-3.5 mr-1.5" /> View
                </Button>
                {r.status === 'approved' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setIdCardVolunteer(r)} className="rounded-lg h-7 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200">
                      <Printer className="size-3.5 mr-1.5" /> ID Card
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleView(r, "certificates")} className="rounded-lg h-7 px-3 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border-blue-200">
                      <FileBadge className="size-3.5 mr-1.5" /> Certificate
                    </Button>
                  </>
                )}
              </div>
            )
          }
        ]}
      />

      {idCardVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * { visibility: hidden; }
              #id-card, #id-card * { visibility: visible; }
              #id-card { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
            }
          `}} />
          <div className="w-full max-w-md rounded-2xl bg-slate-50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border/50 bg-white px-6 py-4 shrink-0">
              <h3 className="font-serif text-xl font-bold text-navy">Volunteer ID Card</h3>
              <button onClick={() => setIdCardVolunteer(null)} className="text-muted-foreground hover:text-navy transition-colors">
                <XCircle className="size-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-100/50 flex justify-center">
              <IdCard 
                volunteer={idCardVolunteer} 
                verificationUrl={`${typeof window !== "undefined" ? window.location.origin : "https://realhumantrust.org"}/verify/volunteer/${idCardVolunteer.volunteerId}`} 
              />
            </div>
            
            <div className="bg-white px-6 py-4 border-t border-border/50 shrink-0 flex gap-4">
              <Button onClick={() => window.print()} className="flex-1 bg-navy text-white hover:bg-navy/90 h-10 rounded-xl font-bold">
                <Printer className="size-4 mr-2" /> Print Card
              </Button>
              <Button variant="outline" onClick={() => setIdCardVolunteer(null)} className="flex-1 h-10 rounded-xl font-semibold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedVolunteer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border/50 bg-slate-50 px-6 py-4 shrink-0">
              <h3 className="font-serif text-xl font-bold text-navy">Volunteer Details</h3>
              <button onClick={() => !isProcessing && setSelectedVolunteer(null)} className="text-muted-foreground hover:text-navy transition-colors">
                <XCircle className="size-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
                <div className="mb-4 flex space-x-2 border-b">
                  <button className={`pb-2 px-1 text-sm font-semibold ${activeTab === 'details' ? 'border-b-2 border-navy text-navy' : 'text-slate-500'}`} onClick={() => setActiveTab('details')}>Details</button>
                  {selectedVolunteer.status === "approved" && (
                     <button className={`pb-2 px-1 text-sm font-semibold ${activeTab === 'certificates' ? 'border-b-2 border-navy text-navy' : 'text-slate-500'}`} onClick={() => handleView(selectedVolunteer, 'certificates')}>Certificates</button>
                  )}
                </div>

                {activeTab === 'details' && (
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    {selectedVolunteer.profileImage?.url && (
                      <div className="col-span-2 mb-2">
                        <img src={selectedVolunteer.profileImage.url} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-border/50" />
                      </div>
                    )}
                    <div><p className="text-[10px] font-bold uppercase text-slate-500">Full Name</p><p className="font-semibold text-slate-800">{selectedVolunteer.fullName}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-500">Volunteer ID</p><p className="font-mono font-semibold text-slate-800">{selectedVolunteer.volunteerId || "Pending"}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-500">Email Address</p><p className="font-semibold text-slate-800">{selectedVolunteer.email}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-500">Mobile Number</p><p className="font-semibold text-slate-800">{selectedVolunteer.mobile}</p></div>
                    <div className="col-span-2"><p className="text-[10px] font-bold uppercase text-slate-500">Address</p><p className="font-semibold text-slate-800">{selectedVolunteer.address || "N/A"}</p></div>
                    <div className="col-span-2"><p className="text-[10px] font-bold uppercase text-slate-500">Message / Why want to join?</p><p className="font-semibold text-slate-800">{selectedVolunteer.message || "N/A"}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-500">Status</p><StatusBadge status={selectedVolunteer.status} /></div>
                  </div>
                )}

                {activeTab === 'certificates' && (
                  <div>
                    {loadingDetails ? (
                      <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-navy" /></div>
                    ) : volunteerCertificates.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No certificates found for this volunteer.</p>
                    ) : (
                      <div className="space-y-3">
                        {volunteerCertificates.map((cert) => (
                          <div key={cert.id || cert._id} className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                            <div>
                              <p className="font-semibold text-navy">{cert.title}</p>
                              <p className="text-xs text-muted-foreground">Cert No: {cert.certificateNo} | Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "N/A"}</p>
                            </div>
                            {cert.pdf?.url && (
                              <a href={cert.pdf.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                                <FileBadge className="size-4" /> View
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </div>

            {selectedVolunteer.status === "pending" && (
              <div className="bg-slate-50 px-6 py-4 border-t border-border/50 shrink-0">
                  <div className="flex gap-4">
                    <Button disabled={isProcessing} onClick={() => handleAction('approve', selectedVolunteer._id || selectedVolunteer.id)} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 h-12 rounded-xl text-base font-bold shadow-sm">
                      {isProcessing ? <Loader2 className="animate-spin size-5" /> : <><ShieldCheck className="size-5 mr-2" /> Approve Volunteer</>}
                    </Button>
                    <Button disabled={isProcessing} onClick={() => handleAction('rejected', selectedVolunteer._id || selectedVolunteer.id)} variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 h-12 rounded-xl text-base font-bold">
                      <XCircle className="size-5 mr-2" /> Reject
                    </Button>
                  </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
