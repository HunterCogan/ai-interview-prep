import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupMessage, setSignupMessage] = useState<string | null>(null)

  function reset() {
    setEmail('')
    setPassword('')
    setError(null)
    setSignupMessage(null)
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      reset()
      setMode('signin')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSignupMessage(null)

    const action = mode === 'signin' ? signInWithEmail : signUpWithEmail
    const { error } = await action(email, password)
    setLoading(false)

    if (error) {
      setError(error)
      return
    }
    if (mode === 'signup') {
      setSignupMessage('Check your email to confirm your account.')
      return
    }
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'signin' ? 'Sign in' : 'Create an account'}</DialogTitle>
          <DialogDescription>
            Optional — sign in to save your interview history. You can keep practicing without an
            account.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5 text-left">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5 text-left">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {signupMessage && <p className="text-sm text-muted-foreground">{signupMessage}</p>}
        </form>

        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => {
            reset()
            setMode(mode === 'signin' ? 'signup' : 'signin')
          }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or continue with
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => signInWithOAuth('google')}>
            Continue with Google
          </Button>
          <Button variant="outline" onClick={() => signInWithOAuth('github')}>
            Continue with GitHub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthDialog
