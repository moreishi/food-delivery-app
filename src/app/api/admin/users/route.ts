import { NextResponse } from 'next/server'
import { getCurrentUser, getProfilesWithAuth, getTenantById } from '@/lib/local-data'

export async function GET() {
  const session = await getCurrentUser()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profiles = getProfilesWithAuth()

  // Attach tenant name to each profile
  const result = profiles.map((p) => {
    const tenantName = p.tenant_id ? (getTenantById(p.tenant_id) as any)?.name || null : null
    return { ...p, tenant_name: tenantName }
  })

  return NextResponse.json(result)
}
