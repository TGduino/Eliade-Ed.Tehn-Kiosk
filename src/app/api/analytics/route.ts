import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabaseAdmin

    switch (type) {
      case 'sessions':
        // Session analytics
        const { data: sessions, error: sessionsError } = await supabaseAdmin
          .from('sessions')
          .select('*, session_types(*)')
          .order('created_at', { ascending: false })

        if (sessionsError) throw sessionsError

        const sessionStats = {
          total: sessions.length,
          active: sessions.filter(s => s.status === 'active').length,
          completed: sessions.filter(s => s.status === 'completed').length,
          paused: sessions.filter(s => s.status === 'paused').length,
          byType: {} as Record<string, number>,
          byDate: {} as Record<string, number>,
        }

        sessions.forEach(session => {
          const typeName = (session as any).session_types?.name || 'Unknown'
          sessionStats.byType[typeName] = (sessionStats.byType[typeName] || 0) + 1

          const date = new Date(session.created_at).toISOString().split('T')[0]
          sessionStats.byDate[date] = (sessionStats.byDate[date] || 0) + 1
        })

        return NextResponse.json(sessionStats)

      case 'devices':
        // Device analytics
        const { data: devices, error: devicesError } = await supabaseAdmin
          .from('devices')
          .select('*')
          .order('last_seen', { ascending: false })

        if (devicesError) throw devicesError

        const deviceStats = {
          total: devices.length,
          active: devices.filter(d => {
            const lastSeen = new Date(d.last_seen).getTime()
            return Date.now() - lastSeen < 60000
          }).length,
          avgBattery: devices.reduce((sum, d) => sum + (d.battery_level || 0), 0) / devices.length,
          avgUptime: devices.reduce((sum, d) => sum + d.uptime_seconds, 0) / devices.length,
        }

        return NextResponse.json(deviceStats)

      case 'activity':
        // Activity analytics
        const { data: activity, error: activityError } = await supabaseAdmin
          .from('device_activity')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000)

        if (activityError) throw activityError

        const activityStats = {
          total: activity.length,
          avgMouse: activity.reduce((sum, a) => sum + a.mouse_activity_count, 0) / activity.length,
          avgKeyboard: activity.reduce((sum, a) => sum + a.keyboard_activity_count, 0) / activity.length,
          byHour: {} as Record<number, number>,
        }

        activity.forEach(a => {
          const hour = new Date(a.created_at).getHours()
          activityStats.byHour[hour] = (activityStats.byHour[hour] || 0) + 1
        })

        return NextResponse.json(activityStats)

      case 'overview':
      default:
        // Combined overview
        const [sessionsRes, devicesRes, activityRes] = await Promise.all([
          supabaseAdmin.from('sessions').select('*'),
          supabaseAdmin.from('devices').select('*'),
          supabaseAdmin.from('device_activity').select('*').limit(100),
        ])

        const overview = {
          sessions: {
            total: sessionsRes.data?.length || 0,
            active: sessionsRes.data?.filter(s => s.status === 'active').length || 0,
          },
          devices: {
            total: devicesRes.data?.length || 0,
            active: devicesRes.data?.filter(d => {
              const lastSeen = new Date(d.last_seen).getTime()
              return Date.now() - lastSeen < 60000
            }).length || 0,
          },
          activity: {
            recent: activityRes.data?.length || 0,
          },
        }

        return NextResponse.json(overview)
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

