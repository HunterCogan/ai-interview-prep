import { useState } from 'react'
import type { FormEvent } from 'react'
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

const DIFFICULTIES = ['junior', 'mid-level', 'senior'] as const

interface SetupFormProps {
  loading: boolean
  error: string | null
  onSubmit: (role: string, difficulty: string) => void
}

function SetupForm({ loading, error, onSubmit }: SetupFormProps) {
  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('mid-level')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!role.trim()) return
    onSubmit(role.trim(), difficulty)
  }

  return (
    <form
      className="flex w-full max-w-lg flex-col gap-4 text-center sm:max-w-2xl"
      onSubmit={handleSubmit}
    >
      <h1 className="font-heading text-5xl font-medium tracking-tight">AI Interview Prep</h1>
      <p className="text-lg text-muted-foreground sm:text-nowrap">
        Pick a role and difficulty to generate mock interview questions.
      </p>

      <div className="flex flex-col gap-1.5 text-left">
        <Label htmlFor="role">Role or skill</Label>
        <Input
          id="role"
          type="text"
          placeholder="e.g. React frontend"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={difficulty}
          onValueChange={(value) => setDifficulty(value as (typeof DIFFICULTIES)[number])}
          disabled={loading}
        >
          <SelectTrigger id="difficulty" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="lg" disabled={loading || !role.trim()}>
        {loading ? 'Generating questions…' : 'Start interview'}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}

export default SetupForm
