import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AdminTenantsPage() {
  const supabase = await createClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Restaurants</h1>
      <div className="grid gap-4">
        {tenants?.map((tenant) => (
          <Card key={tenant.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <Link href={`/menu/${tenant.slug}`} className="font-semibold hover:text-primary">
                  {tenant.name}
                </Link>
                <p className="text-sm text-muted-foreground">{tenant.slug}</p>
              </div>
              <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                {tenant.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
