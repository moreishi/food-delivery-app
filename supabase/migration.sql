-- Migration: Initial schema for Food Delivery SaaS
-- Creates all tables, RLS policies, and triggers

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TENANTS (restaurants)
CREATE TABLE tenants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  address     jsonb DEFAULT '{}'::jsonb,
  phone       text,
  email       text,
  logo_url    text,
  cover_url   text,
  is_active   boolean DEFAULT true,
  settings    jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- 2. PROFILES (extends auth.users)
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   uuid REFERENCES tenants(id) ON DELETE SET NULL,
  role        text NOT NULL CHECK (role IN ('customer', 'staff', 'admin')),
  name        text NOT NULL,
  phone       text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX idx_profiles_tenant_role ON profiles(tenant_id, role);

-- 3. CATEGORIES (menu grouping per restaurant)
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  sort_order  int DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX idx_categories_tenant ON categories(tenant_id, sort_order);

-- 4. MENU ITEMS
CREATE TABLE menu_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id     uuid REFERENCES categories(id) ON DELETE SET NULL,
  name            text NOT NULL,
  description     text,
  price           int NOT NULL,
  compare_at_price int,
  image_url       text,
  is_available    boolean DEFAULT true,
  is_featured     boolean DEFAULT false,
  options         jsonb DEFAULT '[]'::jsonb,
  prep_time_min   int,
  sort_order      int DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
CREATE INDEX idx_menu_items_tenant ON menu_items(tenant_id, category_id, sort_order);
CREATE INDEX idx_menu_items_available ON menu_items(tenant_id, is_available) WHERE is_available = true;

-- 5. ORDERS
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded', 'failed');

CREATE TABLE orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id     uuid NOT NULL REFERENCES profiles(id),
  status          order_status DEFAULT 'pending',
  payment_status  payment_status DEFAULT 'unpaid',
  payment_intent_id text,
  delivery_address jsonb NOT NULL,
  delivery_fee    int DEFAULT 0,
  subtotal        int NOT NULL,
  tax             int DEFAULT 0,
  tip             int DEFAULT 0,
  total           int NOT NULL,
  notes           text,
  estimated_at    timestamptz,
  confirmed_at    timestamptz,
  ready_at        timestamptz,
  delivered_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
CREATE INDEX idx_orders_tenant ON orders(tenant_id, created_at DESC);
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(tenant_id, status) WHERE status NOT IN ('delivered', 'cancelled');

-- 6. ORDER ITEMS
CREATE TABLE order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  name        text NOT NULL,
  quantity    int NOT NULL DEFAULT 1,
  unit_price  int NOT NULL,
  modifiers   jsonb DEFAULT '[]'::jsonb,
  subtotal    int NOT NULL,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- 7. DELIVERIES
CREATE TYPE delivery_status AS ENUM ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed');

CREATE TABLE deliveries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status        delivery_status DEFAULT 'assigned',
  location      jsonb,
  picked_up_at  timestamptz,
  delivered_at  timestamptz,
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id, status);

-- 8. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::text,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. ROW-LEVEL SECURITY
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Helper: get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$;

-- TENANTS
CREATE POLICY "Tenants are public readable" ON tenants
  FOR SELECT USING (true);
CREATE POLICY "Only admins can modify tenants" ON tenants
  FOR ALL USING (auth.user_role() = 'admin');

-- PROFILES
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Staff can read profiles in their tenant" ON profiles
  FOR SELECT USING (tenant_id = auth.user_tenant_id());
CREATE POLICY "Admins read all profiles" ON profiles
  FOR SELECT USING (auth.user_role() = 'admin');
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- CATEGORIES
CREATE POLICY "Categories are public readable" ON categories
  FOR SELECT USING (true);
CREATE POLICY "Staff manage their tenant categories" ON categories
  FOR ALL USING (tenant_id = auth.user_tenant_id());

-- MENU ITEMS
CREATE POLICY "Menu items are public readable" ON menu_items
  FOR SELECT USING (is_available = true OR auth.user_role() IN ('staff', 'admin'));
CREATE POLICY "Staff manage their tenant menu" ON menu_items
  FOR ALL USING (tenant_id = auth.user_tenant_id());

-- ORDERS
CREATE POLICY "Customers see own orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Staff see their tenant orders" ON orders
  FOR SELECT USING (tenant_id = auth.user_tenant_id());
CREATE POLICY "Admins see all orders" ON orders
  FOR SELECT USING (auth.user_role() = 'admin');
CREATE POLICY "Customers create orders" ON orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Staff update their tenant orders" ON orders
  FOR UPDATE USING (tenant_id = auth.user_tenant_id());

-- ORDER ITEMS
CREATE POLICY "Customers see own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );
CREATE POLICY "Staff see their tenant order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders JOIN tenants ON orders.tenant_id = tenants.id WHERE orders.id = order_items.order_id AND tenants.id = auth.user_tenant_id())
  );
CREATE POLICY "Customers create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );

-- DELIVERIES
CREATE POLICY "Customers see own delivery" ON deliveries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND orders.customer_id = auth.uid())
  );
CREATE POLICY "Staff & drivers see their deliveries" ON deliveries
  FOR ALL USING (
    (SELECT tenant_id FROM orders WHERE orders.id = deliveries.order_id) = auth.user_tenant_id()
    OR driver_id = auth.uid()
  );
