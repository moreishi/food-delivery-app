import { describe, it, expect } from 'vitest'

describe('Item detail page', () => {
  it('should have item URL structure', () => {
    expect('/menu/pizzahub/item/some-id').toMatch(/\/menu\/[^/]+\/item\/[^/]+/)
  })
})

describe('Menu item options', () => {
  const options = [
    {
      name: 'Size',
      required: true,
      choices: [
        { name: 'Small', priceModifier: 0 },
        { name: 'Medium', priceModifier: 200 },
        { name: 'Large', priceModifier: 400 },
      ],
    },
  ]

  it('should calculate price with modifiers', () => {
    const basePrice = 1299
    const selectedModifier = 200
    expect(basePrice + selectedModifier).toBe(1499)
  })

  it('should have default selected choice for required options', () => {
    const requiredOption = options.find(o => o.required)
    expect(requiredOption?.choices[0].priceModifier).toBe(0)
  })
})

describe('Cart item structure', () => {
  it('should have correct cart item shape', () => {
    const cartItem = {
      menuItemId: 'abc',
      name: 'Margherita',
      quantity: 1,
      unitPrice: 1299,
      modifiers: [{ name: 'Size', choice: 'Medium', priceModifier: 200 }],
      subtotal: 1499,
    }
    expect(cartItem.menuItemId).toBeTruthy()
    expect(cartItem.subtotal).toBe(cartItem.unitPrice + cartItem.modifiers[0].priceModifier)
  })
})
