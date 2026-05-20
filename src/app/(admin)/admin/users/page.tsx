'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  tenant_id: string | null
  tenant_name: string | null
}

interface Tenant {
  id: string
  name: string
  slug: string
  is_active: number
}

const ROLE_BADGES: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  staff: 'bg-orange-100 text-orange-700',
  customer: 'bg-blue-100 text-blue-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [usersRes, tenantsRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/tenants'),
    ])
    const usersData = await usersRes.json()
    const tenantsData = await tenantsRes.json()
    setUsers(Array.isArray(usersData) ? usersData : [])
    setTenants(Array.isArray(tenantsData) ? tenantsData : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleUpdateRole(userId: string, role: string) {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    fetchData()
  }

  async function handleAssignTenant(userId: string, tenantId: string | null) {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId }),
    })
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage user roles and tenant assignments</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold mb-1">No users yet</h3>
          <p className="text-sm text-muted-foreground">Users will appear here once they sign up</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{user.name || 'Unnamed'}</span>
                    <Badge className={ROLE_BADGES[user.role] || ''}>{user.role}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  {user.tenant_name && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Restaurant: {user.tenant_name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Role</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Role</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Current: <strong>{user.role}</strong></Label>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(val) => handleUpdateRole(user.id, val)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        {user.tenant_name || 'Assign'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Restaurant</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Current: <strong>{user.tenant_name || 'None'}</strong></Label>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(val) => handleAssignTenant(user.id, val === 'none' ? null : val)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select restaurant..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {tenants.filter(t => t.is_active).map((t) => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
