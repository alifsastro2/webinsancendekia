export function getFileUrl(fileUrl: string | null): string {
  if (!fileUrl) return '#'

  const r2Match = fileUrl.match(/https:\/\/[^/]+\.r2\.dev\/(.+)/)
  if (r2Match) {
    return `/api/files/${r2Match[1]}`
  }

  return fileUrl
}
