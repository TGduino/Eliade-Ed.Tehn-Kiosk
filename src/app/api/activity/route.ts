import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const {
      device_id,
      session_id,
      screenshot_url,
      student_work_url,
      mouse_activity_count,
      keyboard_activity_count,
    } = await request.json()

    const { data, error } = await supabaseAdmin
      .from('device_activity')
      .insert({
        device_id,
        session_id: session_id || null,
        screenshot_url: screenshot_url || null,
        student_work_url: student_work_url || null,
        mouse_activity_count: mouse_activity_count || 0,
        keyboard_activity_count: keyboard_activity_count || 0,
        recorded_at: new Date().toISOString(),
      } as any)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error recording activity:', error)
    return NextResponse.json(
      { error: 'Failed to record activity' },
      { status: 500 }
    )
  }
}

