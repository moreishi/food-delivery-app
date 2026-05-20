import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/local-data'
import { ExternalLink } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentUser()

  if (!session?.user) redirect('/auth/login')

  const { getProfileById, getTenantById } = await import('@/lib/local-data')
  const profile = getProfileById(session.user.id)
  if (!profile || ((profile.role as string) !== 'staff' && (profile.role as string) !== 'admin')) redirect('/')

  const tenant = profile.tenant_id ? getTenantById(profile.tenant_id as string) : null

  const navItems = [
    { href: '/dashboard', label: 'Orders' },
    { href: '/dashboard/menu', label: 'Menu' },
    { href: '/dashboard/settings', label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Link href="/" className="font-bold">{(tenant as any)?.name || 'Dashboard'}</Link>
              {(tenant as any)?.slug && (
                <Link
                  href={`/menu/${(tenant as any).slug}`}
                  className="text-xs text-muted-foreground hover:text-orange-600 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View site
                </Link>
              )}
            </div>
            <nav className="flex gap-4 text-sm">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="text-sm text-muted-foreground">{profile.name as string}</div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
