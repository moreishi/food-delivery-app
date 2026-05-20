import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/shared/auth-form'

export default async function SignupPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('local-session')

  if (session?.value) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign up to start ordering
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  )
}
