import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
  const supabase = await createClient()

  const { count: tenantCount } = await supabase
    .from('tenants')
    .select('id', { count: 'exact', head: true })

  const { count: orderCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })

  const { count: userCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tenantCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{orderCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
