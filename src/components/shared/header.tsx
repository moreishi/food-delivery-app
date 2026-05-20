import Link from 'next/link'
import { cookies } from 'next/headers'
import { LogIn, ShoppingBag, Menu as MenuIcon, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartBadge } from './cart-badge'
import { UserDropdown } from './user-dropdown'
import { getActiveTenants } from '@/lib/local-data'

export async function Header() {
  const cookieStore = await cookies()
  const session = cookieStore.get('local-session')
  const user = session?.value ? JSON.parse(session.value) : null

  const tenants = getActiveTenants() as { id: string; name: string; slug: string }[]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🍕</span>
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              FoodDelivery
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {tenants.slice(0, 4).map((tenant) => (
              <Link
                key={tenant.id}
                href={`/menu/${tenant.slug}`}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-slate-100 transition-colors"
              >
                {tenant.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <CartBadge />

          {user ? (
            <>
              <Link
                href="/orders"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                My Orders
              </Link>

              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}

              {(user.role === 'staff' || user.role === 'admin') && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <MenuIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
              )}

              <UserDropdown user={user} />
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}