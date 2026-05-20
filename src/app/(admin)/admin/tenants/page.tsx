'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Store, Plus, Pencil, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { generateSlug } from '@/lib/slug-utils'

interface Tenant {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  email: string | null
  is_active: number
  owner_name: string | null
  created_at: string
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTenant, setEditTenant] = useState<Tenant | null>(null)

  const fetchTenants = useCallback(async () => {
    const res = await fetch('/api/admin/tenants')
    const data = await res.json()
    setTenants(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTenants() }, [fetchTenants])

  async function handleToggleActive(tenant: Tenant) {
    await fetch(`/api/admin/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: tenant.is_active ? 0 : 1 }),
    })
    fetchTenants()
  }

  async function handleDelete(tenant: Tenant) {
    await fetch(`/api/admin/tenants/${tenant.id}`, { method: 'DELETE' })
    fetchTenants()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-sm text-muted-foreground">Manage all restaurant tenants</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Restaurant</DialogTitle>
            </DialogHeader>
            <TenantForm onSuccess={() => { setCreateOpen(false); fetchTenants() }} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold mb-1">No restaurants yet</h3>
          <p className="text-sm text-muted-foreground">Restaurants will appear here once they onboard</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/menu/${tenant.slug}`}
                        className="font-semibold hover:text-orange-600 transition-colors truncate"
                      >
                        {tenant.name}
                      </Link>
                      <Badge variant={tenant.is_active ? 'default' : 'secondary'} className="shrink-0">
                        {tenant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      /{tenant.slug}
                      {tenant.owner_name ? ` · ${tenant.owner_name}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/menu/${tenant.slug}`}>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Dialog open={editTenant?.id === tenant.id} onOpenChange={(open) => !open && setEditTenant(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setEditTenant(tenant)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit {tenant.name}</DialogTitle>
                      </DialogHeader>
                      <TenantForm tenant={tenant} onSuccess={() => { setEditTenant(null); fetchTenants() }} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-8 h-8 ${tenant.is_active ? 'text-amber-600' : 'text-green-600'}`}
                    onClick={() => handleToggleActive(tenant)}
                    title={tenant.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {tenant.is_active ? '○' : '●'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {tenant.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the restaurant, all its menu items, and orders. 
                          Users assigned to this restaurant will be unassigned. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(tenant)} className="bg-red-500 hover:bg-red-600">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function TenantForm({ tenant, onSuccess }: { tenant?: Tenant; onSuccess: () => void }) {
  const [name, setName] = useState(tenant?.name || '')
  const [slug, setSlug] = useState(tenant?.slug || '')
  const [slugEdited, setSlugEdited] = useState(!!tenant)
  const [description, setDescription] = useState(tenant?.description || '')
  const [phone, setPhone] = useState(tenant?.phone || '')
  const [email, setEmail] = useState(tenant?.email || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slugEdited && name) {
      setSlug(generateSlug(name))
    }
  }, [name, slugEdited])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (tenant) {
        const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
      } else {
        const res = await fetch('/api/admin/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Restaurant Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Pizza Hub" />
      </div>
      <div className="space-y-2">
        <Label>URL Slug</Label>
        <Input
          value={slug}
          onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugEdited(true) }}
          required
          placeholder="pizza-hub"
        />
        <p className="text-xs text-muted-foreground">Public URL: /menu/{slug || 'slug'}</p>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Authentic Italian pizzas..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-PIZZA" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@pizzahub.com" />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : tenant ? 'Save Changes' : 'Create Restaurant'}
      </Button>
    </form>
  )
}
