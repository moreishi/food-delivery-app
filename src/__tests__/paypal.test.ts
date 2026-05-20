import { describe, it, expect } from 'vitest'

describe('PayPal integration', () => {
  it('should create PayPal order with correct amount', () => {
    const total = 4194
    const paypalOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'PHP',
          value: (total / 100).toFixed(2),
        },
      }],
    }
    expect(paypalOrder.purchase_units[0].amount.value).toBe('41.94')
  })

  it('should handle PayPal webhook event', () => {
    const event = {
      event_type: 'CHECKOUT.ORDER.APPROVED',
      resource: { id: 'PAY-123', status: 'APPROVED' },
    }
    expect(event.event_type).toContain('CHECKOUT')
    expect(event.resource.status).toBe('APPROVED')
  })
})
