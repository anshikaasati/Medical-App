-- ==============================================================================
-- Supabase SQL Migration — Medical Store ERP (Phase 1 MVP Schema)
-- Description: Sets up the tables, triggers, views, indexes, and RLS policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. STORES TABLE (Multi-Store Foundation)
-- ==========================================
CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gstin text,
  address text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 2. USERS TABLE (Linked to auth.users)
-- ==========================================
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id),
  role text NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'STAFF', 'CUSTOMER', 'SUPPLIER')),
  name text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. SUPPLIERS TABLE
-- ==========================================
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  name text NOT NULL,
  gstin text,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. CUSTOMERS TABLE
-- ==========================================
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 5. MEDICINES TABLE (Product catalog details)
-- ==========================================
CREATE TABLE public.medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  name text NOT NULL,
  category text,
  hsn_code text,
  gst_rate numeric NOT NULL DEFAULT 0.0 CHECK (gst_rate IN (0, 5, 12, 18, 28)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 6. MEDICINE BATCHES TABLE (Expiry & Pricing)
-- ==========================================
CREATE TABLE public.medicine_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  batch_number text NOT NULL,
  expiry_date date NOT NULL,
  manufacturing_date date,
  purchase_price_paise integer NOT NULL CHECK (purchase_price_paise >= 0),
  selling_price_paise integer NOT NULL CHECK (selling_price_paise >= 0),
  mrp_paise integer NOT NULL CHECK (mrp_paise >= 0),
  current_stock integer NOT NULL DEFAULT 0, -- maintained exclusively by trigger
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_store_medicine_batch UNIQUE (store_id, medicine_id, batch_number)
);

-- ==========================================
-- 7. STOCK MOVEMENTS TABLE (Ledger)
-- ==========================================
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  batch_id uuid NOT NULL REFERENCES public.medicine_batches(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('purchase_in', 'sale_out', 'return', 'damage', 'transfer')),
  quantity integer NOT NULL CHECK (quantity > 0),
  reference_id uuid, -- links to sales invoices, return documents, or POs
  user_id uuid REFERENCES public.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 8. PURCHASE ORDERS TABLE
-- ==========================================
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  order_number text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'pending', 'received', 'cancelled')),
  total_price_paise integer NOT NULL CHECK (total_price_paise >= 0),
  gst_total_paise integer NOT NULL CHECK (gst_total_paise >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  medicine_id uuid NOT NULL REFERENCES public.medicines(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0),
  gst_rate numeric NOT NULL CHECK (gst_rate IN (0, 5, 12, 18, 28))
);

-- ==========================================
-- 9. SALES INVOICES (BILLS) TABLE
-- ==========================================
CREATE TABLE public.sales_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  invoice_number text NOT NULL,
  customer_id uuid REFERENCES public.customers(id),
  customer_name text, -- fallback for unregistered customers
  customer_phone text, -- fallback for unregistered customers
  subtotal_paise integer NOT NULL CHECK (subtotal_paise >= 0),
  discount_paise integer NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  gst_total_paise integer NOT NULL CHECK (gst_total_paise >= 0),
  grand_total_paise integer NOT NULL CHECK (grand_total_paise >= 0),
  payment_mode text NOT NULL CHECK (payment_mode IN ('CASH', 'CARD', 'UPI', 'CREDIT')),
  status text NOT NULL CHECK (status IN ('draft', 'finalized')),
  cashier_id uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sales_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.sales_invoices(id) ON DELETE CASCADE,
  medicine_id uuid NOT NULL REFERENCES public.medicines(id),
  batch_id uuid NOT NULL REFERENCES public.medicine_batches(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0),
  gst_rate numeric NOT NULL CHECK (gst_rate IN (0, 5, 12, 18, 28)),
  gst_amount_paise integer NOT NULL CHECK (gst_amount_paise >= 0),
  discount_paise integer NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  total_paise integer NOT NULL CHECK (total_paise >= 0)
);

-- ==========================================
-- 10. BILL RETURNS TABLE (Adjustments Ledger)
-- ==========================================
CREATE TABLE public.bill_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  invoice_id uuid NOT NULL REFERENCES public.sales_invoices(id),
  return_number text NOT NULL,
  refund_amount_paise integer NOT NULL CHECK (refund_amount_paise >= 0),
  gst_refund_paise integer NOT NULL CHECK (gst_refund_paise >= 0),
  user_id uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bill_return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_return_id uuid NOT NULL REFERENCES public.bill_returns(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES public.medicine_batches(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  refund_price_paise integer NOT NULL CHECK (refund_price_paise >= 0)
);

-- ==============================================================================
-- TRIGGERS SECTION
-- ==============================================================================

-- 1. Trigger for maintaining medicine_batches.current_stock
CREATE OR REPLACE FUNCTION public.update_batch_stock()
RETURNS trigger AS $$
DECLARE
  qty_diff integer;
BEGIN
  -- Determine quantity delta based on action type
  IF TG_OP = 'INSERT' THEN
    IF NEW.type IN ('purchase_in', 'return') THEN
      qty_diff := NEW.quantity;
    ELSE
      qty_diff := -NEW.quantity;
    END IF;
    
    UPDATE public.medicine_batches
    SET current_stock = current_stock + qty_diff
    WHERE id = NEW.batch_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type IN ('purchase_in', 'return') THEN
      qty_diff := OLD.quantity;
    ELSE
      qty_diff := -OLD.quantity;
    END IF;
    
    UPDATE public.medicine_batches
    SET current_stock = current_stock - qty_diff
    WHERE id = OLD.batch_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    DECLARE
      old_qty_diff integer;
      new_qty_diff integer;
    BEGIN
      IF OLD.type IN ('purchase_in', 'return') THEN
        old_qty_diff := OLD.quantity;
      ELSE
        old_qty_diff := -OLD.quantity;
      END If;

      IF NEW.type IN ('purchase_in', 'return') THEN
        new_qty_diff := NEW.quantity;
      ELSE
        new_qty_diff := -NEW.quantity;
      END IF;

      UPDATE public.medicine_batches
      SET current_stock = current_stock - old_qty_diff + new_qty_diff
      WHERE id = NEW.batch_id;
    END;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_batch_stock
AFTER INSERT OR UPDATE OR DELETE ON public.stock_movements
FOR EACH ROW EXECUTE FUNCTION public.update_batch_stock();


-- 2. Trigger to enforce immutability on finalized invoices
CREATE OR REPLACE FUNCTION public.check_invoice_immutability()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status = 'finalized' THEN
    RAISE EXCEPTION 'Finalized invoices are immutable and cannot be deleted.';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'finalized' THEN
    RAISE EXCEPTION 'Finalized invoices are immutable and cannot be modified.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_check_invoice_immutability
BEFORE UPDATE OR DELETE ON public.sales_invoices
FOR EACH ROW EXECUTE FUNCTION public.check_invoice_immutability();


-- 3. Trigger to enforce immutability on sales invoice items of finalized bills
CREATE OR REPLACE FUNCTION public.check_invoice_item_immutability()
RETURNS trigger AS $$
DECLARE
  inv_status text;
BEGIN
  SELECT status INTO inv_status FROM public.sales_invoices 
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  IF inv_status = 'finalized' THEN
    RAISE EXCEPTION 'Invoice is finalized. Items cannot be added, modified, or removed.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_check_invoice_item_immutability
BEFORE INSERT OR UPDATE OR DELETE ON public.sales_invoice_items
FOR EACH ROW EXECUTE FUNCTION public.check_invoice_item_immutability();


-- 4. Sync triggers from Supabase auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_store_id uuid;
  user_role text;
  user_name text;
BEGIN
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER');
  user_name := COALESCE(new.raw_user_meta_data->>'name', 'Valued Customer');
  
  -- Resolve or auto-generate first store location
  SELECT id INTO default_store_id FROM public.stores LIMIT 1;
  IF default_store_id IS NULL THEN
    INSERT INTO public.stores (name) VALUES ('Main Pharmacy') RETURNING id INTO default_store_id;
  END IF;

  INSERT INTO public.users (id, store_id, role, name, phone)
  VALUES (new.id, default_store_id, user_role, user_name, new.phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- SECURE VIEWS SECTION (Role-based financial column filters)
-- ==============================================================================

-- SECURITY DEFINER helpers to fetch logged-in user details without recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_store_id()
RETURNS uuid AS $$
  SELECT store_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;


-- View for medicine batches: hides purchase price from staff/cashiers
CREATE OR REPLACE VIEW public.v_medicine_batches AS
SELECT 
  id,
  store_id,
  medicine_id,
  batch_number,
  expiry_date,
  manufacturing_date,
  CASE 
    WHEN public.get_my_role() IN ('OWNER', 'MANAGER') THEN purchase_price_paise 
    ELSE NULL 
  END AS purchase_price_paise,
  selling_price_paise,
  mrp_paise,
  current_stock,
  supplier_id,
  created_at,
  updated_at
FROM public.medicine_batches;


-- ==============================================================================
-- INDEXES SECTION (Performance & Lookups)
-- ==============================================================================
CREATE INDEX idx_batches_expiry ON public.medicine_batches (expiry_date);
CREATE INDEX idx_batches_batch_num ON public.medicine_batches (batch_number);
CREATE INDEX idx_batches_low_stock ON public.medicine_batches (current_stock) WHERE current_stock <= 10;
CREATE INDEX idx_medicines_name ON public.medicines (name);
CREATE INDEX idx_movements_batch_id ON public.stock_movements (batch_id);
CREATE INDEX idx_invoices_number ON public.sales_invoices (invoice_number);

-- Store ID partitioning indexes for multi-store queries
CREATE INDEX idx_users_store ON public.users (store_id);
CREATE INDEX idx_suppliers_store ON public.suppliers (store_id);
CREATE INDEX idx_customers_store ON public.customers (store_id);
CREATE INDEX idx_medicines_store ON public.medicines (store_id);
CREATE INDEX idx_batches_store ON public.medicine_batches (store_id);
CREATE INDEX idx_movements_store ON public.stock_movements (store_id);
CREATE INDEX idx_invoices_store ON public.sales_invoices (store_id);
CREATE INDEX idx_returns_store ON public.bill_returns (store_id);


-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all scoped tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_return_items ENABLE ROW LEVEL SECURITY;

-- 1. STORES Policies
CREATE POLICY "Stores view policy" ON public.stores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Stores admin policy" ON public.stores
  FOR ALL TO authenticated USING (public.get_my_role() = 'OWNER');

-- 2. USERS Policies
CREATE POLICY "Users read permissions" ON public.users
  FOR SELECT TO authenticated 
  USING (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF') OR 
    id = auth.uid()
  );

CREATE POLICY "Users admin controls" ON public.users
  FOR ALL TO authenticated USING (public.get_my_role() = 'OWNER');

-- 3. SUPPLIERS Policies
CREATE POLICY "Suppliers read permissions" ON public.suppliers
  FOR SELECT TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF'));

CREATE POLICY "Suppliers write permissions" ON public.suppliers
  FOR ALL TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER'));

-- 4. CUSTOMERS Policies
CREATE POLICY "Customers read permissions" ON public.customers
  FOR SELECT TO authenticated 
  USING (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF') OR 
    id = auth.uid() -- if linked to a user profile
  );

CREATE POLICY "Customers insert/update permissions" ON public.customers
  FOR ALL TO authenticated 
  USING (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF')
  );

-- 5. MEDICINES Policies
CREATE POLICY "Medicines read permissions" ON public.medicines
  FOR SELECT TO authenticated USING (true); -- Customers, staff, and admin can all search medicines

CREATE POLICY "Medicines write permissions" ON public.medicines
  FOR ALL TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER'));

-- 6. MEDICINE BATCHES Policies
CREATE POLICY "Batches read permissions" ON public.medicine_batches
  FOR SELECT TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF'));

CREATE POLICY "Batches write permissions" ON public.medicine_batches
  FOR ALL TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER'));

-- 7. STOCK MOVEMENTS Policies
CREATE POLICY "Movements read permissions" ON public.stock_movements
  FOR SELECT TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF'));

CREATE POLICY "Movements insert permissions" ON public.stock_movements
  FOR INSERT TO authenticated WITH CHECK (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF') AND
    store_id = public.get_my_store_id()
  );

-- 8. PURCHASE ORDERS Policies (Strict Admin/Manager only)
CREATE POLICY "Purchase orders admin/manager only" ON public.purchase_orders
  FOR ALL TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER'));

CREATE POLICY "Purchase order items admin/manager only" ON public.purchase_order_items
  FOR ALL TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER'));

-- 9. SALES INVOICES (BILLS) Policies
CREATE POLICY "Sales invoices read permissions" ON public.sales_invoices
  FOR SELECT TO authenticated 
  USING (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF') OR
    customer_id = auth.uid()
  );

CREATE POLICY "Sales invoices insert permissions" ON public.sales_invoices
  FOR INSERT TO authenticated WITH CHECK (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF') AND
    store_id = public.get_my_store_id()
  );

CREATE POLICY "Sales invoices update policy (finalize check)" ON public.sales_invoices
  FOR UPDATE TO authenticated USING (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF') AND
    status = 'draft' -- Can only edit if still in draft
  );

-- 10. SALES INVOICE ITEMS Policies
CREATE POLICY "Invoice items read permissions" ON public.sales_invoice_items
  FOR SELECT TO authenticated USING (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF') OR
    EXISTS (
      SELECT 1 FROM public.sales_invoices
      WHERE sales_invoices.id = sales_invoice_items.invoice_id
      AND sales_invoices.customer_id = auth.uid()
    )
  );

CREATE POLICY "Invoice items insert permissions" ON public.sales_invoice_items
  FOR INSERT TO authenticated WITH CHECK (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF')
  );

-- 11. BILL RETURNS Policies
CREATE POLICY "Bill returns read permissions" ON public.bill_returns
  FOR SELECT TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF'));

CREATE POLICY "Bill returns insert permissions" ON public.bill_returns
  FOR INSERT TO authenticated WITH CHECK (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF') AND
    store_id = public.get_my_store_id()
  );

CREATE POLICY "Bill return items read permissions" ON public.bill_return_items
  FOR SELECT TO authenticated USING (public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF'));

CREATE POLICY "Bill return items insert permissions" ON public.bill_return_items
  FOR INSERT TO authenticated WITH CHECK (
    public.get_my_role() IN ('OWNER', 'MANAGER', 'STAFF')
  );
