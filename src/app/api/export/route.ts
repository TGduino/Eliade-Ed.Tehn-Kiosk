import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'sessions', 'devices', 'activity'
    const format = searchParams.get('format') || 'csv'

    if (!type) {
      return NextResponse.json(
        { error: 'Type parameter is required' },
        { status: 400 }
      )
    }

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'sessions':
        const { data: sessions, error: sessionsError } = await supabaseAdmin
          .from('sessions')
          .select('*, session_types(*)')
          .order('created_at', { ascending: false })

        if (sessionsError) throw sessionsError
        data = sessions || []
        filename = 'sessions'
        break

      case 'devices':
        const { data: devices, error: devicesError } = await supabaseAdmin
          .from('devices')
          .select('*')
          .order('last_seen', { ascending: false })

        if (devicesError) throw devicesError
        data = devices || []
        filename = 'devices'
        break

      case 'activity':
        const { data: activity, error: activityError } = await supabaseAdmin
          .from('device_activity')
          .select('*, devices(*), sessions(*)')
          .order('created_at', { ascending: false })
          .limit(10000)

        if (activityError) throw activityError
        data = activity || []
        filename = 'activity'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        )
    }

    if (format === 'csv') {
      // Convert to CSV
      if (data.length === 0) {
        return new NextResponse('No data available', {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          },
        })
      }

      // Flatten nested objects
      const flattened = data.map(item => {
        const flat: any = {}
        Object.keys(item).forEach(key => {
          if (typeof item[key] === 'object' && item[key] !== null) {
            Object.keys(item[key]).forEach(subKey => {
              flat[`${key}_${subKey}`] = item[key][subKey]
            })
          } else {
            flat[key] = item[key]
          }
        })
        return flat
      })

      const headers = Object.keys(flattened[0])
      const csvRows = [
        headers.join(','),
        ...flattened.map(row =>
          headers.map(header => {
            const value = row[header]
            return typeof value === 'string' && value.includes(',')
              ? `"${value.replace(/"/g, '""')}"`
              : value
          }).join(',')
        ),
      ]

      const csv = csvRows.join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // JSON format
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

