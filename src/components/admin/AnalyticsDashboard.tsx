'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

interface AnalyticsData {
  sessions?: {
    total: number
    active: number
    completed: number
    paused: number
    byType: Record<string, number>
    byDate: Record<string, number>
  }
  devices?: {
    total: number
    active: number
    avgBattery: number
    avgUptime: number
  }
  activity?: {
    total: number
    avgMouse: number
    avgKeyboard: number
    byHour: Record<number, number>
  }
}

export function AnalyticsDashboard() {
  const t = useTranslations('admin')
  const [data, setData] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams({ type: 'overview' })
      if (timeRange) params.append('timeRange', timeRange)
      
      const [overview, sessions, devices, activity] = await Promise.all([
        fetch(`/api/analytics?${params}`).then(r => r.json()),
        fetch('/api/analytics?type=sessions').then(r => r.json()),
        fetch('/api/analytics?type=devices').then(r => r.json()),
        fetch('/api/analytics?type=activity').then(r => r.json()),
      ])

      setData({ sessions, devices, activity })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  // Prepare chart data
  const sessionTypeData = data.sessions?.byType
    ? Object.entries(data.sessions.byType).map(([name, value]) => ({ name, value }))
    : []

  const sessionDateData = data.sessions?.byDate
    ? Object.entries(data.sessions.byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date: format(new Date(date), 'MMM dd'),
          count,
        }))
    : []

  const activityHourData = data.activity?.byHour
    ? Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        activity: data.activity?.byHour[i] || 0,
      }))
    : []

  const COLORS = ['#F4C542', '#2C5F2D', '#3B82F6', '#8B5CF6', '#EF4444', '#10B981']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('analytics') || 'Analytics'}</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sessions?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.devices?.active || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.devices?.avgBattery ? `${Math.round(data.devices.avgBattery)}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.activity?.avgMouse ? Math.round(data.activity.avgMouse + (data.activity.avgKeyboard || 0)) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sessions by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sessionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sessionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionDateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#F4C542" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityHourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activity" fill="#2C5F2D" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Active', value: data.sessions?.active || 0 },
                  { name: 'Completed', value: data.sessions?.completed || 0 },
                  { name: 'Paused', value: data.sessions?.paused || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

