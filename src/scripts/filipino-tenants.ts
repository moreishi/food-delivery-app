import { randomUUID } from 'crypto'
import db from '../lib/db'

interface TenantData {
  slug: string
  name: string
  description: string
  phone: string
  categories: { name: string; sortOrder: number }[]
  menuItems: { name: string; description: string; price: number; categoryName: string; isAvailable: boolean }[]
}

export const FILIPINO_TENANTS: TenantData[] = [
  {
    slug: 'manila-kitchen',
    name: 'Manila Kitchen',
    description: 'Authentic home-cooked Filipino dishes made from family recipes passed down through generations.',
    phone: '+63 2 555-0001',
    categories: [{ name: 'Rice Bowls', sortOrder: 1 }, { name: 'Sizzling Plates', sortOrder: 2 }, { name: 'Desserts', sortOrder: 3 }],
    menuItems: [
      { name: 'Adobo Rice Bowl', description: 'Braised chicken and pork adobo over steamed rice', price: 249, categoryName: 'Rice Bowls', isAvailable: true },
      { name: 'Sinigang Rice Bowl', description: 'Tamarin-based soup with pork belly and vegetables over rice', price: 259, categoryName: 'Rice Bowls', isAvailable: true },
      { name: 'Sizzling Pork Sisig', description: 'Chopped pork face and ears on sizzling plate with egg and mayo', price: 349, categoryName: 'Sizzling Plates', isAvailable: true },
      { name: 'Sizzling Chicken', description: 'Marinated chicken thigh on sizzling plate with gravy', price: 329, categoryName: 'Sizzling Plates', isAvailable: true },
      { name: 'Halo-Halo', description: 'Shaved ice with sweet beans, leche flan, ube ice cream, and toppings', price: 179, categoryName: 'Desserts', isAvailable: true },
      { name: 'Leche Flan', description: 'Creamy caramel custard dessert', price: 129, categoryName: 'Desserts', isAvailable: true },
    ],
  },
  {
    slug: 'sizzling-sisig-house',
    name: 'Sizzling Sisig House',
    description: 'The best sisig in town. Crispy, sizzling, and loaded with flavor.',
    phone: '+63 2 555-0002',
    categories: [{ name: 'Sisig Classics', sortOrder: 1 }, { name: 'Rice Meals', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Original Pork Sisig', description: 'Classic sizzling pork sisig with egg', price: 299, categoryName: 'Sisig Classics', isAvailable: true },
      { name: 'Chicken Sisig', description: 'Sizzling boneless chicken sisig', price: 279, categoryName: 'Sisig Classics', isAvailable: true },
      { name: 'Tofu Sisig', description: 'Vegetarian sizzling tofu sisig', price: 239, categoryName: 'Sisig Classics', isAvailable: true },
      { name: 'Sisig Rice Bowl', description: 'Sisig served over steaming white rice', price: 349, categoryName: 'Rice Meals', isAvailable: true },
      { name: 'Calamansi Juice', description: 'Freshly squeezed Philippine lime juice', price: 79, categoryName: 'Drinks', isAvailable: true },
      { name: 'Sago\'t Gulaman', description: 'Sweet drink with tapioca pearls and gelatin', price: 69, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'kainan-ni-lola',
    name: 'Kainan Ni Lola',
    description: 'Lola (grandma) style cooking, just like how your grandmother used to make.',
    phone: '+63 2 555-0003',
    categories: [{ name: 'Ulam (Viands)', sortOrder: 1 }, { name: 'Rice & Pasta', sortOrder: 2 }, { name: 'Desserts', sortOrder: 3 }],
    menuItems: [
      { name: 'Chicken Adobo', description: 'Chicken braised in soy sauce, vinegar, garlic and pepper', price: 239, categoryName: 'Ulam (Viands)', isAvailable: true },
      { name: 'Pork Menudo', description: 'Pork stew with carrots, potatoes, bell peppers in tomato sauce', price: 249, categoryName: 'Ulam (Viands)', isAvailable: true },
      { name: 'Kare-Kare', description: 'Oxtail and vegetables in rich peanut sauce', price: 349, categoryName: 'Ulam (Viands)', isAvailable: true },
      { name: 'Pancit Canton', description: 'Stir-fried egg noodles with vegetables and meat', price: 219, categoryName: 'Rice & Pasta', isAvailable: true },
      { name: 'Biko', description: 'Sweet sticky rice cake topped with coconut caramel', price: 99, categoryName: 'Desserts', isAvailable: true },
      { name: 'Turon', description: 'Deep-fried spring roll with banana and jackfruit', price: 89, categoryName: 'Desserts', isAvailable: true },
    ],
  },
  {
    slug: 'lechon-belly-boys',
    name: 'Lechon Belly Boys',
    description: 'Crispy lechon belly (liempo) made daily. Extra crispy skin, juicy meat.',
    phone: '+63 2 555-0004',
    categories: [{ name: 'Lechon Platters', sortOrder: 1 }, { name: 'Rice Meals', sortOrder: 2 }, { name: 'Sides', sortOrder: 3 }],
    menuItems: [
      { name: 'Regular Lechon Belly', description: 'Half kilo crispy lechon belly with dipping sauce', price: 499, categoryName: 'Lechon Platters', isAvailable: true },
      { name: 'Lechon Bistek', description: 'Crispy lechon belly slices in soy-calamansi marinade', price: 549, categoryName: 'Lechon Platters', isAvailable: true },
      { name: 'Lechon Rice Bowl', description: 'Crispy lechon over garlic rice with pickled papaya', price: 299, categoryName: 'Rice Meals', isAvailable: true },
      { name: 'Lechon Sisig Rice', description: 'Chopped crispy lechon sisig with egg and garlic rice', price: 329, categoryName: 'Rice Meals', isAvailable: true },
      { name: 'Atchara', description: 'Pickled green papaya slaw', price: 49, categoryName: 'Sides', isAvailable: true },
      { name: 'Java Rice', description: 'Yellow rice cooked with annatto and garlic', price: 99, categoryName: 'Sides', isAvailable: true },
    ],
  },
  {
    slug: 'turo-turo-express',
    name: 'Turo-Turo Express',
    description: 'Classic carinderia-style dining. Point and choose from a variety of daily ulam.',
    phone: '+63 2 555-0005',
    categories: [{ name: 'Daily Ulam', sortOrder: 1 }, { name: 'Rice', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Daing na Bangus', description: 'Fried marinated milkfish served with vinegar dip', price: 179, categoryName: 'Daily Ulam', isAvailable: true },
      { name: 'Tortang Talong', description: 'Eggplant omelette with ground pork', price: 149, categoryName: 'Daily Ulam', isAvailable: true },
      { name: 'Dinuguan', description: 'Savory pork blood stew with chili', price: 159, categoryName: 'Daily Ulam', isAvailable: true },
      { name: 'White Rice', description: 'Steamed white rice', price: 25, categoryName: 'Rice', isAvailable: true },
      { name: 'Garlic Rice', description: 'Fried rice with toasted garlic', price: 35, categoryName: 'Rice', isAvailable: true },
      { name: 'Buko Juice', description: 'Fresh young coconut juice', price: 69, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'bulalo-republic',
    name: 'Bulalo Republic',
    description: 'Hearty bulalo and sizzling plates for the soul. Beef bone marrow at its best.',
    phone: '+63 2 555-0006',
    categories: [{ name: 'Bulalo', sortOrder: 1 }, { name: 'Sizzling', sortOrder: 2 }, { name: 'Rice', sortOrder: 3 }],
    menuItems: [
      { name: 'Classic Bulalo', description: 'Beef shank and bone marrow soup with cabbage and corn', price: 449, categoryName: 'Bulalo', isAvailable: true },
      { name: 'Spicy Bulalo', description: 'Bulalo with chili and lemongrass', price: 479, categoryName: 'Bulalo', isAvailable: true },
      { name: 'Sizzling Bulalo Tapa', description: 'Shredded beef bulalo on sizzling plate', price: 399, categoryName: 'Sizzling', isAvailable: true },
      { name: 'Sizzling Pusit', description: 'Grilled squid on sizzling plate with garlic butter', price: 349, categoryName: 'Sizzling', isAvailable: true },
      { name: 'Steamed Rice', description: 'Steamed white rice', price: 25, categoryName: 'Rice', isAvailable: true },
      { name: 'Garlic Rice', description: 'Garlic fried rice', price: 35, categoryName: 'Rice', isAvailable: true },
    ],
  },
  {
    slug: 'isaw-nation',
    name: 'Isaw Nation',
    description: 'Grilled barbecue sticks galore. Chicken and pork int sticking to the classics.',
    phone: '+63 2 555-0007',
    categories: [{ name: 'Chicken BBQ', sortOrder: 1 }, { name: 'Pork BBQ', sortOrder: 2 }, { name: 'Sides & Rice', sortOrder: 3 }],
    menuItems: [
      { name: 'Chicken Isaw', description: 'Grilled chicken intestine skewer', price: 29, categoryName: 'Chicken BBQ', isAvailable: true },
      { name: 'Chicken Wings BBQ', description: 'Grilled chicken wings with sweet marinade', price: 89, categoryName: 'Chicken BBQ', isAvailable: true },
      { name: 'Pork Isaw', description: 'Grilled pork intestine skewer', price: 29, categoryName: 'Pork BBQ', isAvailable: true },
      { name: 'Pork Barbecue', description: 'Grilled pork skewer marinated in sweet BBQ sauce', price: 49, categoryName: 'Pork BBQ', isAvailable: true },
      { name: 'Java Rice', description: 'Annatto and garlic fried rice', price: 35, categoryName: 'Sides & Rice', isAvailable: true },
      { name: 'Vinegar Dip', description: 'Spiced vinegar dipping sauce', price: 10, categoryName: 'Sides & Rice', isAvailable: true },
    ],
  },
  {
    slug: 'adobo-hub',
    name: 'Adobo Hub',
    description: 'Adobo every way you like it. Chicken, pork, or both — cooked to perfection.',
    phone: '+63 2 555-0008',
    categories: [{ name: 'Classic Adobo', sortOrder: 1 }, { name: 'Specialty Adobo', sortOrder: 2 }, { name: 'Rice', sortOrder: 3 }],
    menuItems: [
      { name: 'Chicken Adobo', description: 'Classic chicken adobo with soy-vinegar sauce', price: 239, categoryName: 'Classic Adobo', isAvailable: true },
      { name: 'Pork Adobo', description: 'Pork belly adobo with peppercorns and bay leaf', price: 259, categoryName: 'Classic Adobo', isAvailable: true },
      { name: 'Adobong Pusit', description: 'Squid adobo cooked in its ink', price: 299, categoryName: 'Specialty Adobo', isAvailable: true },
      { name: 'Adobo sa Gata', description: 'Adobo with creamy coconut milk', price: 279, categoryName: 'Specialty Adobo', isAvailable: true },
      { name: 'Garlic Rice', description: 'Fried rice with crispy garlic', price: 35, categoryName: 'Rice', isAvailable: true },
      { name: 'Steamed Rice', description: 'Steamed white rice', price: 25, categoryName: 'Rice', isAvailable: true },
    ],
  },
  {
    slug: 'sinigang-specialists',
    name: 'Sinigang Specialists',
    description: 'Sour soup masters. Every bowl is made with fresh tamarind and the finest ingredients.',
    phone: '+63 2 555-0009',
    categories: [{ name: 'Pork Sinigang', sortOrder: 1 }, { name: 'Seafood Sinigang', sortOrder: 2 }, { name: 'Rice & Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Sinigang na Baboy', description: 'Pork belly sinigang with kangkong and radish', price: 269, categoryName: 'Pork Sinigang', isAvailable: true },
      { name: 'Sinigang na Baka', description: 'Beef sinigang with tender chunks of beef', price: 329, categoryName: 'Pork Sinigang', isAvailable: true },
      { name: 'Sinigang na Hipon', description: 'Shrimp sinigang with fresh tamarind', price: 299, categoryName: 'Seafood Sinigang', isAvailable: true },
      { name: 'Sinigang na Salmon', description: 'Salmon belly sinigang in sour broth', price: 349, categoryName: 'Seafood Sinigang', isAvailable: true },
      { name: 'White Rice', description: 'Steamed white rice', price: 25, categoryName: 'Rice & Drinks', isAvailable: true },
      { name: 'Gulaman', description: 'Sago\'t gulaman sweet drink', price: 59, categoryName: 'Rice & Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'pancit-paradise',
    name: 'Pancit Paradise',
    description: 'Noodle heaven! From Pancit Canton to Bihon — every noodle dish is a celebration.',
    phone: '+63 2 555-0010',
    categories: [{ name: 'Stir-Fried Noodles', sortOrder: 1 }, { name: 'Soup Noodles', sortOrder: 2 }, { name: 'Rice', sortOrder: 3 }],
    menuItems: [
      { name: 'Pancit Canton', description: 'Egg noodles with pork, chicken, and vegetables', price: 219, categoryName: 'Stir-Fried Noodles', isAvailable: true },
      { name: 'Pancit Bihon', description: 'Rice vermicelli with shrimp and vegetables', price: 209, categoryName: 'Stir-Fried Noodles', isAvailable: true },
      { name: 'Pancit Malabon', description: 'Thick rice noodles with annatto, seafood and hard-boiled egg', price: 249, categoryName: 'Stir-Fried Noodles', isAvailable: true },
      { name: 'Mami Special', description: 'Beef noodle soup with wonton and egg', price: 229, categoryName: 'Soup Noodles', isAvailable: true },
      { name: 'Yang Chow Rice', description: 'Fried rice with pork, shrimp, and vegetables', price: 189, categoryName: 'Rice', isAvailable: true },
      { name: 'Steamed Rice', description: 'Plain steamed rice', price: 25, categoryName: 'Rice', isAvailable: true },
    ],
  },
  {
    slug: 'sizzlin-plates',
    name: 'Sizzlin\' Plates',
    description: 'Everything on a sizzling plate. Sizzling tofu, bangus, chicken, and more.',
    phone: '+63 2 555-0011',
    categories: [{ name: 'Sizzling Pork', sortOrder: 1 }, { name: 'Sizzling Chicken & Fish', sortOrder: 2 }, { name: 'Rice', sortOrder: 3 }],
    menuItems: [
      { name: 'Sizzling Pork Sisig', description: 'Sizzling chopped pork with egg and mayonnaise', price: 329, categoryName: 'Sizzling Pork', isAvailable: true },
      { name: 'Sizzling Tofu Sisig', description: 'Crispy tofu sisig on a sizzling plate', price: 249, categoryName: 'Sizzling Pork', isAvailable: true },
      { name: 'Sizzling Chicken Steak', description: 'Marinated chicken breast on sizzling plate with gravy', price: 299, categoryName: 'Sizzling Chicken & Fish', isAvailable: true },
      { name: 'Sizzling Bangus', description: 'Boneless milkfish on sizzling plate with garlic butter', price: 269, categoryName: 'Sizzling Chicken & Fish', isAvailable: true },
      { name: 'Garlic Rice', description: 'Garlic fried rice', price: 35, categoryName: 'Rice', isAvailable: true },
      { name: 'Steamed Rice', description: 'Steamed white rice', price: 25, categoryName: 'Rice', isAvailable: true },
    ],
  },
  {
    slug: 'boodle-fight-bowl',
    name: 'Boodle Fight Bowl',
    description: 'Military-style boodle fights on banana leaves. Share a feast with your squad.',
    phone: '+63 2 555-0012',
    categories: [{ name: 'Boodle Sets (2 pax)', sortOrder: 1 }, { name: 'Boodle Sets (4 pax)', sortOrder: 2 }, { name: 'Single Bowls', sortOrder: 3 }],
    menuItems: [
      { name: 'Classic Boodle Set', description: 'Rice, adobo, fried chicken, daing, atchara, egg for 2', price: 699, categoryName: 'Boodle Sets (2 pax)', isAvailable: true },
      { name: 'Seafood Boodle Set', description: 'Rice, grilled squid, bangus, shrimp, ensalada for 2', price: 899, categoryName: 'Boodle Sets (2 pax)', isAvailable: true },
      { name: 'Family Boodle Feast', description: 'Feast for 4 with lechon belly, adobo, chicken, pancit, rice', price: 1799, categoryName: 'Boodle Sets (4 pax)', isAvailable: true },
      { name: 'Boodle Bowl Solo', description: 'Individual boodle plate with rice, adobo, egg, atchara', price: 259, categoryName: 'Single Bowls', isAvailable: true },
      { name: 'Garlic Rice', description: 'Garlic fried rice', price: 35, categoryName: 'Single Bowls', isAvailable: true },
      { name: 'Ensaladang Mangga', description: 'Green mango and tomato salad with bagoong', price: 79, categoryName: 'Single Bowls', isAvailable: true },
    ],
  },
  {
    slug: 'crispy-pata-king',
    name: 'Crispy Pata King',
    description: 'Deep-fried pork knuckles so crispy you can hear the crunch from across the street.',
    phone: '+63 2 555-0013',
    categories: [{ name: 'Crispy Pata', sortOrder: 1 }, { name: 'Fried Favorites', sortOrder: 2 }, { name: 'Rice & Sides', sortOrder: 3 }],
    menuItems: [
      { name: 'Whole Crispy Pata', description: 'Whole deep-fried pork knuckle with soy-vinegar dip', price: 699, categoryName: 'Crispy Pata', isAvailable: true },
      { name: 'Half Crispy Pata', description: 'Half portion crispy pork knuckle', price: 399, categoryName: 'Crispy Pata', isAvailable: true },
      { name: 'Crispy Pata Chunks', description: 'Bite-sized crispy pata pieces', price: 349, categoryName: 'Crispy Pata', isAvailable: true },
      { name: 'Crispy Fried Chicken', description: 'Half chicken, extra crispy breading', price: 299, categoryName: 'Fried Favorites', isAvailable: true },
      { name: 'Java Rice', description: 'Annatto garlic rice', price: 35, categoryName: 'Rice & Sides', isAvailable: true },
      { name: 'Atsara', description: 'Pickled papaya relish', price: 49, categoryName: 'Rice & Sides', isAvailable: true },
    ],
  },
  {
    slug: 'merienda-mundo',
    name: 'Merienda Mundo',
    description: 'Afternoon snacks and street food favorites. Your go-to for merienda cravings.',
    phone: '+63 2 555-0014',
    categories: [{ name: 'Street Food', sortOrder: 1 }, { name: 'Rice Meals', sortOrder: 2 }, { name: 'Desserts & Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Fish Balls', description: 'Breaded fish balls with sweet and spicy sauce', price: 39, categoryName: 'Street Food', isAvailable: true },
      { name: 'Kikiam', description: 'Fried pork and shrimp spring roll', price: 29, categoryName: 'Street Food', isAvailable: true },
      { name: 'Kwek-Kwek', description: 'Hard-boiled egg in orange batter, deep fried', price: 35, categoryName: 'Street Food', isAvailable: true },
      { name: 'Arroz Caldo', description: 'Chicken rice porridge with ginger and calamansi', price: 149, categoryName: 'Rice Meals', isAvailable: true },
      { name: 'Taho', description: 'Soft tofu with arnibal (caramel syrup) and sago', price: 49, categoryName: 'Desserts & Drinks', isAvailable: true },
      { name: 'Sago\'t Gulaman', description: 'Sweet tapioca and gelatin drink', price: 49, categoryName: 'Desserts & Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'lutong-bahay',
    name: 'Lutong Bahay',
    description: 'Home-style Filipino cooking — comforting, familiar, and always delicious.',
    phone: '+63 2 555-0015',
    categories: [{ name: 'Chicken Favorites', sortOrder: 1 }, { name: 'Pork Favorites', sortOrder: 2 }, { name: 'Rice & Sides', sortOrder: 3 }],
    menuItems: [
      { name: 'Fried Chicken (Half)', description: 'Half chicken, marinated and deep fried', price: 269, categoryName: 'Chicken Favorites', isAvailable: true },
      { name: 'Chicken Tinola', description: 'Ginger chicken soup with green papaya and malunggay', price: 239, categoryName: 'Chicken Favorites', isAvailable: true },
      { name: 'Pork Steak', description: 'Beef-style pork steak in soy-calamansi marinade', price: 249, categoryName: 'Pork Favorites', isAvailable: true },
      { name: 'Pork Sinigang', description: 'Pork in sour tamarind soup', price: 259, categoryName: 'Pork Favorites', isAvailable: true },
      { name: 'Steamed Rice', description: 'Steamed white rice', price: 25, categoryName: 'Rice & Sides', isAvailable: true },
      { name: 'Ensaladang Talong', description: 'Grilled eggplant with tomato and onion', price: 69, categoryName: 'Rice & Sides', isAvailable: true },
    ],
  },
  {
    slug: 'ihaw-express',
    name: 'Ihaw Express',
    description: 'Inihaw (grilled) specialties over hot charcoal. Smoky, savory, and satisfying.',
    phone: '+63 2 555-0016',
    categories: [{ name: 'Grilled Pork', sortOrder: 1 }, { name: 'Grilled Seafood', sortOrder: 2 }, { name: 'Rice & Sides', sortOrder: 3 }],
    menuItems: [
      { name: 'Pork BBQ Skewer', description: 'Marinated pork skewer grilled over charcoal', price: 49, categoryName: 'Grilled Pork', isAvailable: true },
      { name: 'Grilled Liempo', description: 'Marinated pork belly, charcoal grilled', price: 199, categoryName: 'Grilled Pork', isAvailable: true },
      { name: 'Inihaw na Tuna', description: 'Grilled tuna steak with soy-calamansi dip', price: 249, categoryName: 'Grilled Seafood', isAvailable: true },
      { name: 'Inihaw na Bangus', description: 'Grilled stuffed milkfish with tomato and onion', price: 229, categoryName: 'Grilled Seafood', isAvailable: true },
      { name: 'Java Rice', description: 'Yellow garlic rice', price: 35, categoryName: 'Rice & Sides', isAvailable: true },
      { name: 'Toyomansi Dip', description: 'Soy sauce with calamansi and chili', price: 10, categoryName: 'Rice & Sides', isAvailable: true },
    ],
  },
  {
    slug: 'dampa-style-seafood',
    name: 'Dampa Style Seafood',
    description: 'Wet market fresh seafood cooked your way. Choose your catch, pick your style.',
    phone: '+63 2 555-0017',
    categories: [{ name: 'Grilled Seafood', sortOrder: 1 }, { name: 'Buttered Seafood', sortOrder: 2 }, { name: 'Rice & Sides', sortOrder: 3 }],
    menuItems: [
      { name: 'Grilled Prawns', description: 'Large prawns grilled with garlic butter', price: 399, categoryName: 'Grilled Seafood', isAvailable: true },
      { name: 'Grilled Squid', description: 'Stuffed grilled squid with tomato and onion', price: 299, categoryName: 'Grilled Seafood', isAvailable: true },
      { name: 'Buttered Shrimp', description: 'Shrimp sautéed in garlic butter with chili', price: 349, categoryName: 'Buttered Seafood', isAvailable: true },
      { name: 'Sweet and Sour Fish', description: 'Fried whole fish with sweet and sour sauce', price: 329, categoryName: 'Buttered Seafood', isAvailable: true },
      { name: 'Garlic Rice', description: 'Fried rice with garlic', price: 35, categoryName: 'Rice & Sides', isAvailable: true },
      { name: 'Steamed Rice', description: 'White steamed rice', price: 25, categoryName: 'Rice & Sides', isAvailable: true },
    ],
  },
  {
    slug: 'lugaw-kingdom',
    name: 'Lugaw Kingdom',
    description: 'Ultimate comfort congee. Lugaw (rice porridge) with every topping imaginable.',
    phone: '+63 2 555-0018',
    categories: [{ name: 'Classic Lugaw', sortOrder: 1 }, { name: 'Specialty Lugaw', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Plain Lugaw', description: 'Classic rice porridge with ginger and scallions', price: 79, categoryName: 'Classic Lugaw', isAvailable: true },
      { name: 'Chicken Lugaw', description: 'Rice porridge with shredded chicken and egg', price: 129, categoryName: 'Classic Lugaw', isAvailable: true },
      { name: 'Goto', description: 'Beef tripe lugaw with ginger and scallions', price: 159, categoryName: 'Specialty Lugaw', isAvailable: true },
      { name: 'Lugaw with Lechon', description: 'Rice porridge topped with crispy lechon bits', price: 199, categoryName: 'Specialty Lugaw', isAvailable: true },
      { name: 'Calamansi Juice', description: 'Fresh calamansi juice', price: 59, categoryName: 'Drinks', isAvailable: true },
      { name: 'Salabat', description: 'Hot ginger tea', price: 39, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'kanto-breakfast',
    name: 'Kanto Breakfast',
    description: 'All-day breakfast silog meals. Start your day the Filipino way.',
    phone: '+63 2 555-0019',
    categories: [{ name: 'Silog Meals', sortOrder: 1 }, { name: 'Breakfast Favorites', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Tapsilog', description: 'Beef tapa, fried egg, garlic rice', price: 229, categoryName: 'Silog Meals', isAvailable: true },
      { name: 'Longsilog', description: 'Sweet pork sausage, fried egg, garlic rice', price: 199, categoryName: 'Silog Meals', isAvailable: true },
      { name: 'Bangsilog', description: 'Fried boneless bangus, fried egg, garlic rice', price: 219, categoryName: 'Silog Meals', isAvailable: true },
      { name: 'Chicksilog', description: 'Fried chicken, fried egg, garlic rice', price: 239, categoryName: 'Silog Meals', isAvailable: true },
      { name: 'Kape Barako', description: 'Strong Filipino coffee (Barako blend)', price: 59, categoryName: 'Drinks', isAvailable: true },
      { name: 'Chocolate Eh', description: 'Traditional hot Filipino cocoa', price: 69, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'bicol-express-house',
    name: 'Bicol Express House',
    description: 'Fiery Bicolano cuisine. Coconut cream and chili peppers — the spicier the better.',
    phone: '+63 2 555-0020',
    categories: [{ name: 'Bicol Classics', sortOrder: 1 }, { name: 'Rice Meals', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Bicol Express', description: 'Pork belly in coconut milk with chili and shrimp paste', price: 269, categoryName: 'Bicol Classics', isAvailable: true },
      { name: 'Laing', description: 'Dried taro leaves cooked in coconut milk with chili', price: 229, categoryName: 'Bicol Classics', isAvailable: true },
      { name: 'Pinangat', description: 'Fish stewed in coconut milk with chili and ginger', price: 259, categoryName: 'Bicol Classics', isAvailable: true },
      { name: 'Bicol Express Bowl', description: 'Bicol express served with steamed rice', price: 319, categoryName: 'Rice Meals', isAvailable: true },
      { name: 'Calamansi Cooler', description: 'Cold calamansi juice drink', price: 59, categoryName: 'Drinks', isAvailable: true },
      { name: 'Buko Pandan', description: 'Chilled coconut and pandan dessert drink', price: 79, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'kakanin-korner',
    name: 'Kakanin Korner',
    description: 'Traditional Filipino rice cakes and native delicacies. Sweet treats from every region.',
    phone: '+63 2 555-0021',
    categories: [{ name: 'Steamed Kakanin', sortOrder: 1 }, { name: 'Fried Treats', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Puto', description: 'Steamed rice cake (5 pcs)', price: 49, categoryName: 'Steamed Kakanin', isAvailable: true },
      { name: 'Kutsinta', description: 'Chewy brown rice cake with coconut topping', price: 49, categoryName: 'Steamed Kakanin', isAvailable: true },
      { name: 'Suman', description: 'Sticky rice wrapped in banana leaf', price: 39, categoryName: 'Steamed Kakanin', isAvailable: true },
      { name: 'Palanquin', description: 'Deep fried sweet rice cake', price: 59, categoryName: 'Fried Treats', isAvailable: true },
      { name: 'Maruya', description: 'Fried banana fritters with sugar', price: 49, categoryName: 'Fried Treats', isAvailable: true },
      { name: 'Sago\'t Gulaman', description: 'Sweet sago and gelatin drink', price: 49, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'halo-halo-heaven',
    name: 'Halo-Halo Heaven',
    description: 'The ultimate Filipino dessert destination. Halo-halo made fresh daily.',
    phone: '+63 2 555-0022',
    categories: [{ name: 'Halo-Halo', sortOrder: 1 }, { name: 'Ice Cream', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Special Halo-Halo', description: 'Shaved ice with ube, leche flan, macapuno, pinipig, ice cream', price: 199, categoryName: 'Halo-Halo', isAvailable: true },
      { name: 'Ube Halo-Halo', description: 'Halo-halo with extra ube halaya and ube ice cream', price: 219, categoryName: 'Halo-Halo', isAvailable: true },
      { name: 'Mais con Yelo', description: 'Shaved ice with sweet corn and milk', price: 99, categoryName: 'Halo-Halo', isAvailable: true },
      { name: 'Ube Ice Cream', description: 'Creamy purple yam ice cream (1 scoop)', price: 69, categoryName: 'Ice Cream', isAvailable: true },
      { name: 'Mango Shake', description: 'Fresh Philippine mango milkshake', price: 129, categoryName: 'Drinks', isAvailable: true },
      { name: 'Buko Shake', description: 'Fresh young coconut shake', price: 109, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'lomi-haus',
    name: 'Lomi Haus',
    description: 'Batangas-style lomi — thick egg noodles in rich savory broth with generous toppings.',
    phone: '+63 2 555-0023',
    categories: [{ name: 'Lomi Bowls', sortOrder: 1 }, { name: 'Mami', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Special Lomi', description: 'Thick egg noodles with pork, chicken, quail eggs, and fried garlic in rich broth', price: 199, categoryName: 'Lomi Bowls', isAvailable: true },
      { name: 'Super Lomi', description: 'Special lomi with added shrimp, squid, and kikiam', price: 269, categoryName: 'Lomi Bowls', isAvailable: true },
      { name: 'Lomi with Lechon Kawali', description: 'Lomi topped with crispy fried pork belly', price: 299, categoryName: 'Lomi Bowls', isAvailable: true },
      { name: 'Beef Mami', description: 'Beef noodle soup with tender beef slices', price: 189, categoryName: 'Mami', isAvailable: true },
      { name: 'Calamansi Juice', description: 'Freshly squeezed calamansi', price: 59, categoryName: 'Drinks', isAvailable: true },
      { name: 'Iced Tea', description: 'Sweetened iced tea', price: 49, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'pares-sabay',
    name: 'Pares Sabay',
    description: 'Beef pares — tender beef in sweet-asian broth served with garlic rice and soup.',
    phone: '+63 2 555-0024',
    categories: [{ name: 'Pares Meals', sortOrder: 1 }, { name: 'Add-Ons', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Beef Pares', description: 'Tender beef stew in sweet soy broth with garlic rice and soup', price: 199, categoryName: 'Pares Meals', isAvailable: true },
      { name: 'Pares with Egg', description: 'Beef pares with fried egg', price: 229, categoryName: 'Pares Meals', isAvailable: true },
      { name: 'Pares with Lechon', description: 'Beef pares with crispy lechon kawali', price: 299, categoryName: 'Pares Meals', isAvailable: true },
      { name: 'Extra Beef', description: 'Extra serving of beef pares', price: 99, categoryName: 'Add-Ons', isAvailable: true },
      { name: 'Rice', description: 'Extra garlic rice', price: 25, categoryName: 'Add-Ons', isAvailable: true },
      { name: 'Sago\'t Gulaman', description: 'Sweet sago and gelatin drink', price: 49, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'inihaw-sa-kanto',
    name: 'Inihaw Sa Kanto',
    description: 'Corner street grill house. Smoke, flavor, and good vibes every night.',
    phone: '+63 2 555-0025',
    categories: [{ name: 'Pork Inihaw', sortOrder: 1 }, { name: 'Chicken Inihaw', sortOrder: 2 }, { name: 'Rice & Sides', sortOrder: 3 }],
    menuItems: [
      { name: 'Pork BBQ Stick', description: 'Sweet marinated pork BBQ on bamboo stick', price: 39, categoryName: 'Pork Inihaw', isAvailable: true },
      { name: 'Inihaw na Liempo', description: 'Grilled pork belly, vinegar dip on the side', price: 179, categoryName: 'Pork Inihaw', isAvailable: true },
      { name: 'Inihaw na Manok', description: 'Half grilled chicken with annatto marinade', price: 249, categoryName: 'Chicken Inihaw', isAvailable: true },
      { name: 'Chicken Inasal', description: 'Bacolod-style grilled chicken with sinamak dip', price: 269, categoryName: 'Chicken Inihaw', isAvailable: true },
      { name: 'Java Rice', description: 'Annatto garlic rice', price: 35, categoryName: 'Rice & Sides', isAvailable: true },
      { name: 'Ensaladang Mangga', description: 'Green mango and tomato salad', price: 69, categoryName: 'Rice & Sides', isAvailable: true },
    ],
  },
  {
    slug: 'probinsya-favorites',
    name: 'Probinsya Favorites',
    description: 'Provincial Filipino dishes from Luzon, Visayas, and Mindanao all in one place.',
    phone: '+63 2 555-0026',
    categories: [{ name: 'Luzon Favorites', sortOrder: 1 }, { name: 'Visayan Favorites', sortOrder: 2 }, { name: 'Mindanao Favorites', sortOrder: 3 }],
    menuItems: [
      { name: 'Ilocos Bagnet', description: 'Crispy fried pork belly from Ilocos', price: 349, categoryName: 'Luzon Favorites', isAvailable: true },
      { name: 'Pinakbet', description: 'Ilocano vegetable stew with shrimp paste', price: 199, categoryName: 'Luzon Favorites', isAvailable: true },
      { name: 'Lechon Cebu', description: 'Cebu-style roasted pig with liver sauce', price: 449, categoryName: 'Visayan Favorites', isAvailable: true },
      { name: 'Chicken Inasal', description: 'Bacolod-style grilled chicken', price: 269, categoryName: 'Visayan Favorites', isAvailable: true },
      { name: 'Pastil', description: 'Mindanao-style shredded chicken wrapped in banana leaf with rice', price: 99, categoryName: 'Mindanao Favorites', isAvailable: true },
      { name: 'Beef Rendang', description: 'Mindanao-style spicy beef in coconut milk', price: 299, categoryName: 'Mindanao Favorites', isAvailable: true },
    ],
  },
  {
    slug: 'camote-que-corners',
    name: 'Camote Que Corners',
    description: 'Classic Filipino street snacks. Camote cue, banana cue, turon, and more.',
    phone: '+63 2 555-0027',
    categories: [{ name: 'Fried Snacks', sortOrder: 1 }, { name: 'Barbecue', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Camote Cue', description: 'Deep fried sweet potato coated in caramelized sugar on stick', price: 29, categoryName: 'Fried Snacks', isAvailable: true },
      { name: 'Banana Cue', description: 'Caramelised saba banana on bamboo stick', price: 29, categoryName: 'Fried Snacks', isAvailable: true },
      { name: 'Turon', description: 'Banana and jackfruit spring roll with caramel', price: 39, categoryName: 'Fried Snacks', isAvailable: true },
      { name: 'Pork BBQ Stick', description: 'Pork barbecue on stick', price: 39, categoryName: 'Barbecue', isAvailable: true },
      { name: 'Isaw Manok', description: 'Grilled chicken intestine on stick', price: 19, categoryName: 'Barbecue', isAvailable: true },
      { name: 'Buko Juice', description: 'Chilled young coconut juice', price: 49, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'silog-street',
    name: 'Silog Street',
    description: 'Flavors of the streets, comfort of home. All-day silog meals at street-friendly prices.',
    phone: '+63 2 555-0028',
    categories: [{ name: 'Classic Silog', sortOrder: 1 }, { name: 'Specialty Silog', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Tapsilog', description: 'Beef tapa, sinangag, itlog', price: 199, categoryName: 'Classic Silog', isAvailable: true },
      { name: 'Tosilog', description: 'Tocino (sweet cured pork), sinangag, itlog', price: 189, categoryName: 'Classic Silog', isAvailable: true },
      { name: 'Hotsilog', description: 'Filipino hotdog, sinangag, itlog', price: 179, categoryName: 'Classic Silog', isAvailable: true },
      { name: 'Lechonsilog', description: 'Lechon kawali, sinangag, itlog', price: 259, categoryName: 'Specialty Silog', isAvailable: true },
      { name: 'Adosilog', description: 'Adobo flakes, sinangag, itlog', price: 219, categoryName: 'Specialty Silog', isAvailable: true },
      { name: 'Kape Barako', description: 'Strong Barako coffee', price: 49, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'tamales-bay',
    name: 'Tamales Bay',
    description: 'Savory rice tamales and pilar-style snacks. Wrapped in banana leaves, packed with flavor.',
    phone: '+63 2 555-0029',
    categories: [{ name: 'Tamales', sortOrder: 1 }, { name: 'Rice Snacks', sortOrder: 2 }, { name: 'Drinks', sortOrder: 3 }],
    menuItems: [
      { name: 'Chicken Tamales', description: 'Rice cake with chicken, peanuts, and egg wrapped in banana leaf', price: 119, categoryName: 'Tamales', isAvailable: true },
      { name: 'Pork Tamales', description: 'Savory rice tamale with pork and vegetables', price: 119, categoryName: 'Tamales', isAvailable: true },
      { name: 'Espasol', description: 'Sweet rice flour cake with coconut', price: 59, categoryName: 'Rice Snacks', isAvailable: true },
      { name: 'Palitaw', description: 'Soft rice cake with sesame seeds, coconut, and sugar', price: 49, categoryName: 'Rice Snacks', isAvailable: true },
      { name: 'Salabat', description: 'Hot ginger tea', price: 39, categoryName: 'Drinks', isAvailable: true },
      { name: 'Tsokolate', description: 'Traditional thick hot cocoa', price: 69, categoryName: 'Drinks', isAvailable: true },
    ],
  },
  {
    slug: 'dirty-kitchen',
    name: 'Dirty Kitchen',
    description: 'No frills, bold flavors. Famous for our crispy pata, lechon kawali, and sizzling sisig.',
    phone: '+63 2 555-0030',
    categories: [{ name: 'Crispy Favorites', sortOrder: 1 }, { name: 'Sizzling Favorites', sortOrder: 2 }, { name: 'Rice', sortOrder: 3 }],
    menuItems: [
      { name: 'Crispy Pata', description: 'Famous crispy pork knuckle - half size', price: 449, categoryName: 'Crispy Favorites', isAvailable: true },
      { name: 'Lechon Kawali', description: 'Crispy deep-fried pork belly', price: 299, categoryName: 'Crispy Favorites', isAvailable: true },
      { name: 'Sizzling Sisig', description: 'Pork sisig on sizzling plate with egg', price: 319, categoryName: 'Sizzling Favorites', isAvailable: true },
      { name: 'Sizzling Tofu', description: 'Crispy tofu sisig for vegetarians', price: 239, categoryName: 'Sizzling Favorites', isAvailable: true },
      { name: 'White Rice', description: 'Steamed white rice', price: 25, categoryName: 'Rice', isAvailable: true },
      { name: 'Garlic Rice', description: 'Garlic fried rice', price: 35, categoryName: 'Rice', isAvailable: true },
    ],
  },
]

export function seedFilipinoTenants() {
  for (const tenant of FILIPINO_TENANTS) {
    const existing = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(tenant.slug)
    if (existing) {
      console.log(`Filipino tenant "${tenant.name}" already exists, skipping`)
      continue
    }

    const tenantId = randomUUID()

    db.prepare(`
      INSERT INTO tenants (id, slug, name, description, phone, is_active, owner_name)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(tenantId, tenant.slug, tenant.name, tenant.description, tenant.phone, 'Seeded')

    const categoryMap = new Map<string, string>()
    for (const cat of tenant.categories) {
      const catId = randomUUID()
      db.prepare(`
        INSERT INTO categories (id, tenant_id, name, sort_order, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).run(catId, tenantId, cat.name, cat.sortOrder)
      categoryMap.set(cat.name, catId)
    }

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
}
