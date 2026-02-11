'use client'

import { useState } from 'react'
import { Trash2, Pause, Play, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface BulkOperationsProps {
  items: Array<{ id: string; [key: string]: any }>
  onBulkAction: (ids: string[], action: string) => Promise<void>
  itemType: 'session' | 'device'
}

export function BulkOperations({ items, onBulkAction, itemType }: BulkOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const { toast } = useToast()

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    setSelectedIds(new Set(items.map((item) => item.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleBulkAction = (action: string) => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one item',
        variant: 'destructive',
      })
      return
    }
    setPendingAction(action)
    setShowConfirmDialog(true)
  }

  const confirmAction = async () => {
    if (!pendingAction) return

    try {
      await onBulkAction(Array.from(selectedIds), pendingAction)
      setSelectedIds(new Set())
      setShowConfirmDialog(false)
      setPendingAction(null)
      toast({
        title: 'Success',
        description: `Bulk action completed successfully`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action',
        variant: 'destructive',
      })
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'delete':
        return 'delete'
      case 'pause':
        return 'pause'
      case 'activate':
        return 'activate'
      default:
        return action
    }
  }

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll} className="gap-2">
            <Square className="h-4 w-4" />
            Deselect All
          </Button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            {itemType === 'session' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('pause')}
                  className="gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Activate
                </Button>
              </>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {getActionLabel(pendingAction || '')} {selectedIds.size}{' '}
              {itemType}(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAction} variant={pendingAction === 'delete' ? 'destructive' : 'default'}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function SelectableItem({
  id,
  selected,
  onToggle,
  children,
}: {
  id: string
  selected: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        onClick={() => onToggle(id)}
        className="mt-1 p-1 hover:bg-accent rounded"
        aria-label={selected ? 'Deselect' : 'Select'}
      >
        {selected ? (
          <CheckSquare className="h-5 w-5 text-primary" />
        ) : (
          <Square className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <div className="flex-1">{children}</div>
    </div>
  )
}

