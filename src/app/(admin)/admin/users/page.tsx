import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="grid gap-4">
        {profiles?.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{profile.name}</p>
                <p className="text-sm text-muted-foreground">{profile.id.slice(0, 8)}...</p>
              </div>
              <Badge>{profile.role}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
