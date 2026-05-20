'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, X } from 'lucide-react'

export default function DashboardMenuPage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [newItem, setNewItem] = useState({ name: '', price: '', category_id: '' })
  const [newCat, setNewCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => { setItems(data.items || []); setCategories(data.categories || []) })
  }, [])

  async function addItem() {
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, price: parseInt(newItem.price) }),
    })
    setNewItem({ name: '', price: '', category_id: '' })
    setShowForm(false)
    const res = await fetch('/api/menu')
    const data = await res.json()
    setItems(data.items || [])
  }

  async function addCategory() {
    await fetch('/api/menu/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat }),
    })
    setNewCat('')
    const res = await fetch('/api/menu')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  async function toggleAvailable(item: any) {
    await fetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: item.is_available ? 0 : 1 }),
    })
    const res = await fetch('/api/menu')
    const data = await res.json()
    setItems(data.items || [])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Editor</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Item name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
              <Input placeholder="Price (cents)" type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newItem.category_id} onChange={e => setNewItem({ ...newItem, category_id: e.target.value })}>
                <option value="">No category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={addItem}>Save Item</Button>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex items-center justify-between py-1">
              <span>{cat.name}</span>
              <Badge variant="secondary">{items.filter((i: any) => i.category_id === cat.id).length} items</Badge>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input placeholder="New category" value={newCat} onChange={e => setNewCat(e.target.value)} />
            <Button variant="outline" onClick={addCategory}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <div className="grid gap-3">
        {items.map((item: any) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.is_available ? 'default' : 'secondary'}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => toggleAvailable(item)}>
                  Toggle
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
