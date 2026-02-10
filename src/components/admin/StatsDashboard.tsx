'use client'

import { useTranslations } from 'next-intl'
import { Monitor, Activity, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsDashboardProps {
  totalDevices: number
  activeSessions: number
  studentsOnline: number
  avgUptime: number
}

export function StatsDashboard({
  totalDevices,
  activeSessions,
  studentsOnline,
  avgUptime,
}: StatsDashboardProps) {
  const t = useTranslations('admin')

  const stats = [
    {
      title: t('totalDevices'),
      value: totalDevices,
      icon: Monitor,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('activeSessions'),
      value: activeSessions,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('studentsOnline'),
      value: studentsOnline,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: t('avgUptime'),
      value: `${Math.floor(avgUptime / 3600)}h`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

