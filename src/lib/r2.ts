import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!
// R2 Public URL - Replace with your deployed Cloudflare Worker URL
// OR use format: https://<bucket-name>.<r2-subdomain>.r2.dev (requires public bucket)
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev`

// Create R2 client with proper S3-compatible credentials
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
})

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

export async function uploadFileToR2(
  file: Buffer | Blob,
  fileName: string,
  className: string,
  subjectName: string,
  mimeType?: string
): Promise<UploadResult> {
  try {
    // Create folder path: kelas/mata_pelajaran/filename
    const safeClassName = className.replace(/[^a-zA-Z0-9]/g, '_')
    const safeSubjectName = subjectName.replace(/[^a-zA-Z0-9]/g, '_')
    const key = `${safeClassName}/${safeSubjectName}/${Date.now()}-${fileName}`

    // Convert Blob to Buffer if needed
    let fileBuffer: Buffer
    if (Buffer.isBuffer(file)) {
      fileBuffer = file
    } else if (file instanceof Blob) {
      fileBuffer = Buffer.from(await file.arrayBuffer())
    } else {
      return { success: false, error: 'Invalid file format' }
    }

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType || 'application/octet-stream'
    })

    await r2Client.send(command)

    // Generate public URL
    const publicUrl = `${R2_PUBLIC_URL}/${key}`

    return {
      success: true,
      url: publicUrl,
      key: key
    }
  } catch (error: any) {
    console.error('R2 Upload Error:', error)
    return {
      success: false,
      error: error.message || 'Upload failed'
    }
  }
}

// Helper to get public URL
export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`
}
