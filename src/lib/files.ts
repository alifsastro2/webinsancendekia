export function getFileUrl(fileUrl: string | null): string {
  if (!fileUrl) return '#'

  // If it's an external URL (starts with http:// or https://), return directly
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl
  }

  // If it's an R2 URL (Cloudflare R2 storage), proxy it
  const r2Match = fileUrl.match(/https:\/\/[^/]+\.r2\.dev\/(.+)/)
  if (r2Match) {
    return `/api/files/${r2Match[1]}`
  }

  // Otherwise treat as relative path
  return fileUrl
}
