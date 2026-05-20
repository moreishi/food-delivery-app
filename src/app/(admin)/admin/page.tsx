import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getTenantCount, getOrderCount, getProfileCount } from '@/lib/local-data'
import { Store, Users, ArrowRight, TrendingUp } from 'lucide-react'

export default async function AdminPage() {
  const tenantCount = getTenantCount()
  const orderCount = getOrderCount()
  const userCount = getProfileCount()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">Manage restaurants, users, and platform settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-orange-100 text-sm font-medium">Restaurants</p>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{tenantCount}</p>
            <p className="text-orange-100 text-sm">Total registered restaurants</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground font-medium">Orders</p>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{orderCount}</p>
            <p className="text-sm text-muted-foreground">Total platform orders</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground font-medium">Users</p>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{userCount}</p>
            <p className="text-sm text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/tenants">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Store className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Manage Restaurants</h3>
                  <p className="text-sm text-muted-foreground">Create, edit, and manage restaurant tenants</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">Update roles and assign restaurant staff</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
