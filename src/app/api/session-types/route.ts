import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('session_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching session types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, url_template, icon_url, allow_url_preview, iframe_enabled } = await request.json()

    const { data, error } = await supabaseAdmin
      .from('session_types')
      .insert({
        name,
        url_template,
        icon_url: icon_url || null,
        allow_url_preview: allow_url_preview || false,
        iframe_enabled: iframe_enabled !== false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating session type:', error)
    return NextResponse.json(
      { error: 'Failed to create session type' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, url_template, icon_url, allow_url_preview, iframe_enabled } = await request.json()

    const { data, error } = await supabaseAdmin
      .from('session_types')
      .update({
        name,
        url_template,
        icon_url,
        allow_url_preview,
        iframe_enabled,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating session type:', error)
    return NextResponse.json(
      { error: 'Failed to update session type' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    const { error } = await supabaseAdmin
      .from('session_types')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session type:', error)
    return NextResponse.json(
      { error: 'Failed to delete session type' },
      { status: 500 }
    )
  }
}

