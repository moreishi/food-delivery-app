import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { total } = await request.json()

    const paypalRes = await fetch(
      `${process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'PHP',
              value: (total / 100).toFixed(2),
            },
          }],
        }),
      }
    )

    const data = await paypalRes.json()

    if (!paypalRes.ok) {
      return NextResponse.json({ error: data.message || 'PayPal error' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { paypalOrderId } = await request.json()

    const paypalRes = await fetch(
      `${process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    )

    const data = await paypalRes.json()

    if (!paypalRes.ok) {
      return NextResponse.json({ error: data.message || 'PayPal capture failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'COMPLETED', details: data })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to capture PayPal order' }, { status: 500 })
  }
}
