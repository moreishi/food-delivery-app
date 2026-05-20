import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { OnboardingForm } from '@/components/onboarding/onboarding-form'

export default async function OnboardingPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('local-session')

  if (!sessionCookie?.value) {
    redirect('/auth/signup?role=staff')
  }

  let session: { id: string; role: string; tenant_id?: string | null; name?: string }
  try {
    session = JSON.parse(sessionCookie.value)
  } catch {
    redirect('/auth/signup?role=staff')
  }

  if (session.role !== 'staff') {
    redirect('/')
  }

  if (session.tenant_id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍕</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Set Up Your Restaurant</h1>
          <p className="text-muted-foreground">
            Tell us about your restaurant to get started
          </p>
        </div>

        <OnboardingForm userName={session.name} />
      </div>
    </div>
  )
}
