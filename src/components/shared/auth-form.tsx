'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'

export function AuthForm({ mode, defaultRole }: { mode: 'login' | 'signup'; defaultRole?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          mode,
          ...(mode === 'signup' ? { name, role: defaultRole } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      router.push(data.redirectTo || '/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="pl-10 h-12"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 h-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="pl-10 pr-10 h-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Must be at least 6 characters
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Please wait...
          </>
        ) : mode === 'login' ? (
          'Sign In'
        ) : defaultRole === 'staff' ? (
          'Create Restaurant Account'
        ) : (
          'Create Account'
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full h-12"
        onClick={() => {
          // Demo account login
          setEmail(mode === 'login' ? 'customer@example.com' : 'newuser@example.com')
          setPassword('password')
        }}
      >
        {mode === 'login' ? 'Use Demo Account' : 'Fill Demo Data'}
      </Button>
    </form>
  )
}
