import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id, name')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'staff' && profile.role !== 'admin')) redirect('/')

  const { data: tenant } = profile.tenant_id
    ? await supabase.from('tenants').select('name, slug').eq('id', profile.tenant_id).single()
    : { data: null }

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
            <Link href="/" className="font-bold">{tenant?.name || 'Dashboard'}</Link>
            <nav className="flex gap-4 text-sm">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="text-sm text-muted-foreground">{profile.name}</div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
