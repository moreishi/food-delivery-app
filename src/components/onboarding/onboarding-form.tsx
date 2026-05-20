'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Store, Globe, Phone, FileText, Loader2, Check, X } from 'lucide-react'
import { generateSlug } from '@/lib/slug-utils'

export function OnboardingForm({ userName }: { userName?: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [slugError, setSlugError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugEdited && name) {
      setSlug(generateSlug(name))
    }
  }, [name, slugEdited])

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugStatus('idle')
      setSlugError(null)
      return
    }

    const timer = setTimeout(async () => {
      setSlugStatus('checking')
      try {
        const res = await fetch(`/api/tenant/check-slug?slug=${encodeURIComponent(slug)}`)
        const data = await res.json()
        if (data.available) {
          setSlugStatus('available')
          setSlugError(null)
        } else {
          setSlugStatus('taken')
          setSlugError(data.error || 'Slug is already taken')
        }
      } catch {
        setSlugStatus('idle')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/tenant/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create restaurant')
      }

      router.push(data.redirectTo || '/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = name.trim().length > 0 && slug.trim().length >= 2 && slugStatus === 'available'
  const isChecking = slugStatus === 'checking' || loading

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 space-y-5">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Restaurant Name *</Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="My Awesome Restaurant"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium">URL Slug *</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="slug"
                placeholder="my-awesome-restaurant"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  setSlugEdited(true)
                }}
                required
                minLength={2}
                className={`pl-10 pr-10 h-12 ${
                  slugStatus === 'available' ? 'border-green-500' : slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-red-500' : ''
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : slugStatus === 'available' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : slugStatus === 'taken' || slugStatus === 'invalid' ? (
                  <X className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your restaurant will be available at <code className="bg-slate-100 px-1 rounded">/menu/{slug || 'your-slug'}</code>
            </p>
            {slugError && slug.length >= 2 && (
              <p className="text-xs text-red-500">{slugError}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  id="description"
                  placeholder="Tell customers about your restaurant..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-xl border border-input bg-background pl-10 pr-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555-123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        disabled={!isFormValid || loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating your restaurant...
          </>
        ) : (
          'Create Restaurant'
        )}
      </Button>
    </form>
  )
}
