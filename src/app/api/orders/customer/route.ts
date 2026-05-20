import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    const rows = db.prepare(`
      SELECT * FROM orders
      ORDER BY created_at DESC
      LIMIT 50
    `).all()

    return NextResponse.json(rows)
  } catch {
    return NextResponse.json([])
  }
}
