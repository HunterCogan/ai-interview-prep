import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/lib/AuthProvider'
import { Button } from '@/components/ui/button'
import AuthDialog from '@/components/AuthDialog'

function Header() {
  const { user, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-heading text-sm font-medium">
          AI Interview Prep
        </Link>
        <NavLink
          to="/history"
          className={({ isActive }: { isActive: boolean }) =>
            `text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`
          }
        >
          History
        </NavLink>
      </div>
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={() => setAuthOpen(true)}>
          Sign In
        </Button>
      )}

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  )
}

export default Header
