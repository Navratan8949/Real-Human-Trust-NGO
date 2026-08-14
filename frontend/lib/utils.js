import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

function getApiOrigin() {
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envApiUrl) return envApiUrl.replace(/\/api\/v1\/?$/, "");

  if (typeof window !== "undefined" && window.location.hostname) {
    const hostname = window.location.hostname;
    if (
      hostname.includes("localhost") ||
      hostname.includes("127.0.0.1") ||
      hostname.startsWith("192.168.")
    ) {
      return `http://${hostname}:5001`;
    }
  }

  return "https://realhumantrust.org";
}

export function getFileUrl(url) {
  if (!url) return url;

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
    if (url.includes("127.0.0.1:5000") || url.includes("localhost:5000")) {
      return url.replace(/https?:\/\/(127\.0\.0\.1|localhost):5000/g, getApiOrigin());
    }
    return url;
  }

  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${getApiOrigin()}${normalizedPath}`;
}

export async function forceDownload(url, filename = 'download') {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename || url.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error("Failed to fetch blob, opening normally", err);
    window.open(url, '_blank');
  }
}
