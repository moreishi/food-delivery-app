export interface SeedTenant {
  slug: string
  name: string
  description: string
  phone: string
  categories: { name: string; sortOrder: number }[]
  menuItems: {
    name: string
    description: string
    price: number
    categoryName: string
    isAvailable: boolean
    imageEmoji: string
  }[]
}

export const SAMPLE_TENANTS: SeedTenant[] = [
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
      { name: 'Margherita', description: 'Tomato sauce, mozzarella, fresh basil', price: 1299, categoryName: 'Classic Pizzas', isAvailable: true, imageEmoji: '🍕' },
      { name: 'Pepperoni', description: 'Tomato sauce, mozzarella, pepperoni', price: 1499, categoryName: 'Classic Pizzas', isAvailable: true, imageEmoji: '🍕' },
      { name: 'Hawaiian', description: 'Tomato sauce, mozzarella, ham, pineapple', price: 1499, categoryName: 'Classic Pizzas', isAvailable: true, imageEmoji: '🍍' },
      { name: 'BBQ Chicken', description: 'BBQ sauce, chicken, red onions, cilantro', price: 1799, categoryName: 'Specialty Pizzas', isAvailable: true, imageEmoji: '🍗' },
      { name: 'Truffle Mushroom', description: 'White sauce, truffle oil, mushrooms, arugula', price: 1999, categoryName: 'Specialty Pizzas', isAvailable: true, imageEmoji: '🍄' },
      { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 499, categoryName: 'Sides', isAvailable: true, imageEmoji: '🧄' },
      { name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, Caesar dressing', price: 699, categoryName: 'Sides', isAvailable: true, imageEmoji: '🥗' },
      { name: 'Coca-Cola', description: 'Ice-cold 355ml can', price: 199, categoryName: 'Drinks', isAvailable: true, imageEmoji: '🥤' },
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
      { name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, lettuce, tomato, special sauce', price: 999, categoryName: 'Burgers', isAvailable: true, imageEmoji: '🍔' },
      { name: 'Double Bacon', description: 'Double beef, bacon, smoked gouda, caramelized onions', price: 1499, categoryName: 'Burgers', isAvailable: true, imageEmoji: '🥓' },
      { name: 'Mushroom Swiss', description: 'Beef patty, Swiss cheese, sautéed mushrooms, garlic aioli', price: 1299, categoryName: 'Burgers', isAvailable: true, imageEmoji: '🍄' },
      { name: 'Spicy Chicken', description: 'Crispy chicken, jalapeños, pepper jack, sriracha mayo', price: 1199, categoryName: 'Burgers', isAvailable: true, imageEmoji: '🌶️' },
      { name: 'Truffle Fries', description: 'Crispy fries tossed in truffle oil with parmesan', price: 599, categoryName: 'Sides', isAvailable: true, imageEmoji: '🍟' },
      { name: 'Onion Rings', description: 'Beer-battered and fried golden', price: 499, categoryName: 'Sides', isAvailable: true, imageEmoji: '🧅' },
      { name: 'Milkshake', description: 'Thick and creamy vanilla, chocolate, or strawberry', price: 699, categoryName: 'Drinks', isAvailable: true, imageEmoji: '🥤' },
    ],
  },
]

export async function seed(): Promise<void> {
  const { createClient } = await import('@supabase/supabase-js')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  for (const tenant of SAMPLE_TENANTS) {
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', tenant.slug)
      .single()

    if (existingTenant) {
      console.log(`Tenant "${tenant.name}" already exists, skipping`)
      continue
    }

    const { data: newTenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        slug: tenant.slug,
        name: tenant.name,
        description: tenant.description,
        phone: tenant.phone,
      })
      .select('id')
      .single()

    if (tenantError || !newTenant) {
      console.error(`Failed to create tenant "${tenant.name}":`, tenantError)
      continue
    }

    const tenantId = newTenant.id

    // Create categories
    const categoryMap = new Map<string, string>()
    for (const cat of tenant.categories) {
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert({
          tenant_id: tenantId,
          name: cat.name,
          sort_order: cat.sortOrder,
        })
        .select('id, name')
        .single()

      if (newCat) categoryMap.set(newCat.name, newCat.id)
      if (catError) console.error(`Failed to create category "${cat.name}":`, catError)
    }

    // Create menu items
    for (const item of tenant.menuItems) {
      const categoryId = categoryMap.get(item.categoryName)

      await supabase.from('menu_items').insert({
        tenant_id: tenantId,
        category_id: categoryId || null,
        name: item.name,
        description: item.description,
        price: item.price,
        is_available: item.isAvailable,
      })
    }

    console.log(`Seeded "${tenant.name}" with ${tenant.menuItems.length} menu items`)
  }

  console.log('Seed complete!')
}

// Run directly
seed().catch(console.error)
