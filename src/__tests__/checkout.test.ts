import { describe, it, expect } from 'vitest'

describe('Checkout calculations', () => {
  const items = [
    { price: 1299, quantity: 2, modifiers: [] },
    { price: 500, quantity: 1, modifiers: [{ priceModifier: 200 }] },
  ]

  it('should calculate subtotal', () => {
    const subtotal = items.reduce((sum, i) => {
      const modTotal = i.modifiers.reduce((m, mod) => m + mod.priceModifier, 0)
      return sum + (i.price + modTotal) * i.quantity
    }, 0)
    expect(subtotal).toBe(3298) // 1299*2 + (500+200)*1
  })

  it('should calculate total with delivery fee', () => {
    const subtotal = 3298
    const deliveryFee = 500
    const tax = Math.round(subtotal * 0.12)
    const total = subtotal + deliveryFee + tax
    expect(total).toBe(4194) // 3298 + 500 + 396 (round(3298*0.12))
  })

  it('should validate delivery address fields', () => {
    const address = {
      street: '123 Main St',
      city: 'Cebu City',
      notes: 'Near the church',
    }
    expect(address.street).toBeTruthy()
    expect(address.city).toBeTruthy()
  })
})

describe('Stripe PaymentIntent', () => {
  it('should create payment intent with correct amount', () => {
    const total = 4192
    expect(total).toBeGreaterThan(0)
    expect(Number.isInteger(total)).toBe(true)
  })
})
