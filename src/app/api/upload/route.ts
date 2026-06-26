import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToR2 } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const className = formData.get('className') as string
    const subjectName = formData.get('subjectName') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!className || !subjectName) {
      return NextResponse.json(
        { error: 'Missing className or subjectName' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to R2
    const result = await uploadFileToR2(
      buffer,
      file.name,
      className,
      subjectName,
      file.type
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key
    })

  } catch (error: any) {
    console.error('Upload API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
