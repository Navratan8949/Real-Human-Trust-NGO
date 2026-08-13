"use client"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { forceDownload } from "@/lib/utils"

export function DownloadButton({ url, filename, className, variant = "outline", size = "sm", text = "Download" }) {
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={() => forceDownload(url, filename)}
    >
      <Download className="mr-2 size-4" />
      {text}
    </Button>
  )
}
