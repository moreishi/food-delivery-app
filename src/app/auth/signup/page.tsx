import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AuthForm } from '@/components/shared/auth-form'
import { Card, CardContent } from '@/components/ui/card'

export default async function SignupPage(props: {
  searchParams?: Promise<{ role?: string }>
}) {
  const searchParams = await props.searchParams
  const defaultRole = searchParams?.role === 'staff' ? 'staff' : undefined

  const cookieStore = await cookies()
  const session = cookieStore.get('local-session')

  if (session?.value && session.value.length > 10) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🍕</span>
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              FoodDelivery
            </span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {defaultRole === 'staff' ? 'Create Restaurant Account' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground">
                {defaultRole === 'staff'
                  ? 'Sign up to list your restaurant and start receiving orders'
                  : 'Sign up to start ordering delicious food'}
              </p>
            </div>
            
            <AuthForm mode="signup" defaultRole={defaultRole} />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-orange-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
