import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(url) {
  if (!url) return url;
  
  // If it's already a relative path that doesn't start with http, keep it or prepend API base
  // But wait, the goal is to fix localhost URLs.
  if (url.includes('127.0.0.1:5000') || url.includes('localhost:5000')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://realhumantrust.org/api/v1";
    // Usually API URL is something like https://realhumantrust.org/api/v1
    // We want to replace the host with the base domain without /api/v1
    const baseDomain = apiBase.replace('/api/v1', '');
    return url.replace(/https?:\/\/(127\.0\.0\.1|localhost):5000/g, baseDomain);
  }
  return url;
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
