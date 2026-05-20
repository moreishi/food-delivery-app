'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Save } from 'lucide-react'

export default function DashboardSettingsPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/tenant/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setName(data.name || '')
          setDescription(data.description || '')
          setPhone(data.phone || '')
        }
      })
  }, [])

  async function save() {
    await fetch('/api/tenant/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, phone }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold">Restaurant Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button onClick={save} className="gap-2">
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
