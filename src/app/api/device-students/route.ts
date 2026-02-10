import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { device_id, student_names, session_id } = await request.json()

    // Check if entry exists for this device
    const { data: existing } = await supabaseAdmin
      .from('device_students')
      .select('*')
      .eq('device_id', device_id)
      .order('joined_at', { ascending: false })
      .limit(1)
      .single()

    if (existing) {
      // Update existing entry
      const { data, error } = await supabaseAdmin
        .from('device_students')
        .update({
          student_names,
          session_id: session_id || null,
          joined_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data)
    } else {
      // Create new entry
      const { data, error } = await supabaseAdmin
        .from('device_students')
        .insert({
          device_id,
          student_names,
          session_id: session_id || null,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Error updating device students:', error)
    return NextResponse.json(
      { error: 'Failed to update device students' },
      { status: 500 }
    )
  }
}

