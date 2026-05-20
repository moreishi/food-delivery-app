import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, Store, Truck, ShoppingBag, Star, Clock, Shield } from 'lucide-react'
import { getActiveTenants } from '@/lib/local-data'

export default async function LandingPage() {
  const tenants = getActiveTenants() as Array<{
    id: string
    name: string
    slug: string
    description: string | null
  }>

  const heroSlug = tenants[0]?.slug || 'pizzahub'
  const firstTenant = tenants[0]

  const RESTAURANT_EMOJIS = ['🍕', '🍔', '🍣', '🌮', '🥗', '🍝', '🥪', '🍜', '🌯', '🥘']

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                <span className="text-sm font-medium">Trusted by 10,000+ customers</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Delicious Food
                <span className="block text-yellow-200">Delivered Fast</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-lg mx-auto lg:mx-0">
                Order from your favorite local restaurants and get fresh, hot food delivered to your doorstep in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href={`/menu/${heroSlug}`}>
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 text-base px-8 shadow-lg shadow-black/20">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Order Now
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline" className="text-base border-white text-white bg-transparent hover:bg-white hover:text-orange-600 px-8 transition-colors">
                    Get Started
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>30 min delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-3xl" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="text-6xl mb-4">{firstTenant ? RESTAURANT_EMOJIS[tenants.indexOf(firstTenant) % RESTAURANT_EMOJIS.length] : '🍕'}</div>
                  <h3 className="text-2xl font-bold mb-2">{firstTenant?.name || 'Pizza Hub'}</h3>
                  <p className="text-white/80 mb-4">{firstTenant?.description || 'Authentic Italian pizzas'}</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                    ))}
                    <span className="ml-2 text-sm">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      {tenants.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Featured Restaurants</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Discover the best local restaurants with exclusive deals and fast delivery
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant, index) => (
                <Link key={tenant.id} href={`/menu/${tenant.slug}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border hover:border-orange-200 group h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl group-hover:scale-110 transition-transform">
                        {RESTAURANT_EMOJIS[index % RESTAURANT_EMOJIS.length]}
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">4.9</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{tenant.description || 'Fresh & delicious food'}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>25-35 min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get your favorite food delivered in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Store, title: 'Choose Restaurant', desc: 'Browse local restaurants and explore their delicious menus.', step: '01' },
              { icon: ShoppingBag, title: 'Pick Your Food', desc: 'Add items to your cart with custom options and modifiers.', step: '02' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Track your order in real-time as it comes to your door.', step: '03' },
            ].map((item) => (
              <div key={item.title} className="relative text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-10 h-10 text-orange-600" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <UtensilsCrossed className="w-4 h-4" />
            <span className="text-sm font-medium">Join 500+ restaurant partners</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Are You a Restaurant Owner?</h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Join our platform and reach thousands of hungry customers. Start with a free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=staff">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                List Your Restaurant
              </Button>
            </Link>
            <Link href="/menu/pizzahub">
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-slate-900 px-8 transition-colors">
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">FoodDelivery</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your favorite food, delivered fast and fresh.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Customers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/menu/pizzahub" className="hover:text-foreground">Browse Menu</Link></li>
                <li><Link href="/orders" className="hover:text-foreground">Track Order</Link></li>
                <li><Link href="/auth/signup" className="hover:text-foreground">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Restaurants</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/signup?role=staff" className="hover:text-foreground">Partner With Us</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground">Restaurant Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/orders" className="hover:text-foreground">Track Your Order</Link></li>
                <li><Link href="/auth/signup?role=staff" className="hover:text-foreground">Partner With Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 Food Delivery App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
