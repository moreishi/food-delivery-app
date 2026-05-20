import db from '../lib/db'
import { migrate } from '../lib/migrate'
import { createLocalUser } from '../lib/local-auth'
import { randomUUID } from 'crypto'

export const SAMPLE_TENANTS = [
  {
    slug: 'pizzahub',
    name: 'Pizza Hub',
    description: 'Authentic Italian pizzas baked in a wood-fired oven. Fresh ingredients, fast delivery.',
    phone: '+1 555-PIZZA',
    categories: [
      { name: 'Classic Pizzas', sortOrder: 1 },
      { name: 'Specialty Pizzas', sortOrder: 2 },
      { name: 'Sides', sortOrder: 3 },
      { name: 'Drinks', sortOrder: 4 },
    ],
    menuItems: [
      { name: 'Margherita', description: 'Tomato sauce, mozzarella, fresh basil', price: 1299, categoryName: 'Classic Pizzas', isAvailable: true },
      { name: 'Pepperoni', description: 'Tomato sauce, mozzarella, pepperoni', price: 1499, categoryName: 'Classic Pizzas', isAvailable: true },
      { name: 'Hawaiian', description: 'Tomato sauce, mozzarella, ham, pineapple', price: 1499, categoryName: 'Classic Pizzas', isAvailable: true },
      { name: 'BBQ Chicken', description: 'BBQ sauce, chicken, red onions, cilantro', price: 1799, categoryName: 'Specialty Pizzas', isAvailable: true },
      { name: 'Truffle Mushroom', description: 'White sauce, truffle oil, mushrooms, arugula', price: 1999, categoryName: 'Specialty Pizzas', isAvailable: true },
      { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 499, categoryName: 'Sides', isAvailable: true },
      { name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, Caesar dressing', price: 699, categoryName: 'Sides', isAvailable: true },
      { name: 'Coca-Cola', description: 'Ice-cold 355ml can', price: 199, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'burger-bros',
    name: 'Burger Bros',
    description: 'Juicy hand-crafted burgers with premium ingredients. Double the meat, double the flavor.',
    phone: '+1 555-BURG',
    categories: [
      { name: 'Burgers', sortOrder: 1 },
      { name: 'Sides', sortOrder: 2 },
      { name: 'Drinks', sortOrder: 3 },
    ],
    menuItems: [
      { name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, lettuce, tomato, special sauce', price: 999, categoryName: 'Burgers', isAvailable: true },
      { name: 'Double Bacon', description: 'Double beef, bacon, smoked gouda, caramelized onions', price: 1499, categoryName: 'Burgers', isAvailable: true },
      { name: 'Mushroom Swiss', description: 'Beef patty, Swiss cheese, sautéed mushrooms, garlic aioli', price: 1299, categoryName: 'Burgers', isAvailable: true },
      { name: 'Spicy Chicken', description: 'Crispy chicken, jalapeños, pepper jack, sriracha mayo', price: 1199, categoryName: 'Burgers', isAvailable: true },
      { name: 'Truffle Fries', description: 'Crispy fries tossed in truffle oil with parmesan', price: 599, categoryName: 'Sides', isAvailable: true },
      { name: 'Onion Rings', description: 'Beer-battered and fried golden', price: 499, categoryName: 'Sides', isAvailable: true },
      { name: 'Milkshake', description: 'Thick and creamy vanilla, chocolate, or strawberry', price: 699, categoryName: 'Drinks', isAvailable: true },
    ],
  },
]

export function seed() {
  console.log('Running migration...')
  migrate()

  for (const tenant of SAMPLE_TENANTS) {
    const existing = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(tenant.slug)
    if (existing) {
      console.log(`Tenant "${tenant.name}" already exists, skipping`)
      continue
    }

    const tenantId = randomUUID()

    db.prepare(`
      INSERT INTO tenants (id, slug, name, description, phone, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(tenantId, tenant.slug, tenant.name, tenant.description, tenant.phone)

    // Create categories
    const categoryMap = new Map<string, string>()
    for (const cat of tenant.categories) {
      const catId = randomUUID()
      db.prepare(`
        INSERT INTO categories (id, tenant_id, name, sort_order, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).run(catId, tenantId, cat.name, cat.sortOrder)
      categoryMap.set(cat.name, catId)
    }

    // Create menu items
    for (const item of tenant.menuItems) {
      const itemId = randomUUID()
      const categoryId = categoryMap.get(item.categoryName) || null

      db.prepare(`
        INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).run(itemId, tenantId, categoryId, item.name, item.description, item.price, item.isAvailable ? 1 : 0)
    }

    console.log(`Seeded "${tenant.name}" with ${tenant.menuItems.length} menu items`)
  }

  console.log('Seed complete!')
  console.log('\nSample tenants:')
  console.log('  Pizza Hub  → /menu/pizzahub')
  console.log('  Burger Bros → /menu/burger-bros')

  // Seed demo users
  const demoUsers = [
    { email: 'admin@example.com', password: 'password', name: 'Admin User', role: 'admin', tenantId: null },
    { email: 'staff@pizzahub.com', password: 'password', name: 'Pizza Hub Staff', role: 'staff', tenantId: db.prepare('SELECT id FROM tenants WHERE slug = ?').get('pizzahub')?.id },
    { email: 'customer@example.com', password: 'password', name: 'Test Customer', role: 'customer', tenantId: null },
  ]

  for (const u of demoUsers) {
    const existing = db.prepare('SELECT id FROM auth_users WHERE email = ?').get(u.email)
    if (existing) {
      console.log(`User "${u.email}" already exists, skipping`)
      continue
    }
    createLocalUser(u.email, u.password, u.name, u.role, u.tenantId)
    console.log(`Created user: ${u.email} (${u.role})`)
  }

  console.log('\nDemo accounts:')
  console.log('  Admin:    admin@example.com / password')
  console.log('  Staff:    staff@pizzahub.com / password')
  console.log('  Customer: customer@example.com / password')
}

// Run directly
if (require.main === module) {
  seed()
}
