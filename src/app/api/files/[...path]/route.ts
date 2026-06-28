import { NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { r2Client } from '@/lib/r2'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const key = path.join('/')

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })

    const response = await r2Client.send(command)

    if (!response.Body) {
      return new NextResponse('File not found', { status: 404 })
    }

    const uint8 = await response.Body.transformToByteArray()
    const body = Buffer.from(uint8)
    const headers = new Headers()

    if (response.ContentType) {
      headers.set('Content-Type', response.ContentType)
    }
    headers.set('Content-Disposition', 'inline')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new Response(body, { headers })
  } catch (error) {
    console.error('File proxy error:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}
