import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/local-data'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentUser()
  if (!session?.user) redirect('/auth/login')

  const { getProfileById } = await import('@/lib/local-data')
  const profile = getProfileById(session.user.id)
  if (!profile || (profile.role as string) !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold">Admin</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">Overview</Link>
              <Link href="/admin/tenants" className="text-muted-foreground hover:text-foreground">Restaurants</Link>
              <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
