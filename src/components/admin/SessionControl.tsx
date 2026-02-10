'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Play, Pause, StopCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import type { Session, SessionType } from '@/types'

interface SessionControlProps {
  sessions: Session[]
  sessionTypes: SessionType[]
  onRefresh: () => void
}

export function SessionControl({ sessions, sessionTypes, onRefresh }: SessionControlProps) {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const { toast } = useToast()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  const handleCreateSession = async () => {
    if (!newSessionName.trim() || !selectedTypeId) {
      toast({
        title: tCommon('error'),
        description: 'Please fill all fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSessionName,
          session_type_id: selectedTypeId,
        }),
      })

      if (response.ok) {
        toast({
          title: tCommon('success'),
          description: 'Session created successfully',
        })
        setShowCreateDialog(false)
        setNewSessionName('')
        setSelectedTypeId('')
        onRefresh()
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: 'Failed to create session',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateSession = async (sessionId: string, status: string) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          status,
          ended_at: status === 'completed' ? new Date().toISOString() : null,
        }),
      })

      if (response.ok) {
        toast({
          title: tCommon('success'),
          description: 'Session updated successfully',
        })
        onRefresh()
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: 'Failed to update session',
        variant: 'destructive',
      })
    }
  }

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">{t('active')}</Badge>
      case 'paused':
        return <Badge className="bg-yellow-500">{t('paused')}</Badge>
      case 'completed':
        return <Badge variant="secondary">{t('completed')}</Badge>
      default:
        return <Badge variant="outline">{t('pending')}</Badge>
    }
  }

  const activeSessions = sessions.filter((s) => s.status === 'active' || s.status === 'paused')
  const completedSessions = sessions.filter((s) => s.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('sessions')}</h2>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('createSession')}
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('activeSessions')}</h3>
        {activeSessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t('noSessions')}
              </p>
            </CardContent>
          </Card>
        ) : (
          activeSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{session.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Started: {new Date(session.started_at!).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(session.status)}
                    {session.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateSession(session.id, 'paused')}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {session.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateSession(session.id, 'active')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateSession(session.id, 'completed')}
                    >
                      <StopCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Session History */}
      {completedSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('sessionHistory')}</h3>
          {completedSessions.slice(0, 5).map((session) => (
            <Card key={session.id} className="bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{session.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.started_at!).toLocaleString()} -{' '}
                      {session.ended_at && new Date(session.ended_at).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createSession')}</DialogTitle>
            <DialogDescription>
              Create a new session for students to join
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="session-name">{t('sessionName')}</Label>
              <Input
                id="session-name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="e.g., Robotics Class - Group A"
              />
            </div>
            <div>
              <Label htmlFor="session-type">{t('sessionType')}</Label>
              <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleCreateSession}>
              {t('startSession')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

