'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (error) {
        router.push(`/auth/login?error=${encodeURIComponent(error.message)}`)
      } else {
        router.push('/')
        router.refresh()
      }
    }
    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  )
}
