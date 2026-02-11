'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StudentNameInputProps {
  students: string[]
  onStudentsChange: (students: string[]) => void
}

export function StudentNameInput({ students, onStudentsChange }: StudentNameInputProps) {
  const t = useTranslations('kiosk')
  const [newName, setNewName] = useState('')

  const handleAddStudent = () => {
    if (newName.trim()) {
      onStudentsChange([...students, newName.trim()])
      setNewName('')
    }
  }

  const handleRemoveStudent = (index: number) => {
    onStudentsChange(students.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddStudent()
    }
  }

  return (
    <Card className="w-full shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="text-2xl font-bold">{t('students')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder={t('enterName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-lg h-12 border-2 focus:border-primary"
          />
          <Button onClick={handleAddStudent} size="lg" className="gap-2 px-6 h-12 shadow-md">
            <Plus className="h-5 w-5" />
            {t('addStudent')}
          </Button>
        </div>

        {students.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {t('noStudents')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {students.map((name, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-base py-2 px-4 gap-2"
              >
                {name}
                <button
                  onClick={() => handleRemoveStudent(index)}
                  className="hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

