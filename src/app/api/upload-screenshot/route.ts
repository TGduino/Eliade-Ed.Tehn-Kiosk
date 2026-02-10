import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as Blob
    const fileName = formData.get('fileName') as string

    if (!file || !fileName) {
      return NextResponse.json(
        { error: 'Missing file or fileName' },
        { status: 400 }
      )
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('screenshots')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('screenshots')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Error uploading screenshot:', error)
    return NextResponse.json(
      { error: 'Failed to upload screenshot' },
      { status: 500 }
    )
  }
}

