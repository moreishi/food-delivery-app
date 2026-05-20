import { OrderTracking } from '@/components/customer/order-tracking'

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  return <OrderTracking orderId={orderId} />
}
