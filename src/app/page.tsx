import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, Store, Truck, ShoppingBag } from 'lucide-react'

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
            Your Favorite Food, Delivered
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg mx-auto">
            Order from local restaurants and get fresh food delivered to your doorstep.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link href="/menu/pizzahub">Order Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base border-white/30 text-white hover:text-white hover:bg-white/10">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: Store, title: 'Choose a Restaurant', desc: 'Browse local restaurants and their menus.' },
            { icon: ShoppingBag, title: 'Pick Your Food', desc: 'Add items to your cart with custom options.' },
            { icon: Truck, title: 'Get It Delivered', desc: 'Track your order in real-time to your door.' },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Are You a Restaurant Owner?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join our platform and reach more customers. Get started with a free trial.
          </p>
          <Button asChild size="lg">
            <Link href="/auth/signup?role=staff">List Your Restaurant</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Food Delivery App. Built with Next.js + Supabase.</p>
        </div>
      </footer>
    </div>
  )
}
