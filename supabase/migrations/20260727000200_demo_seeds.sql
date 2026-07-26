-- Supabase Demo Seeds Migration
-- Inserts realistic pharmacy data to populate command center analytics and POS selectors

-- 1. Stores (Multi-Store Foundation)
INSERT INTO public.stores (id, name, address, phone, gstin)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'MargPharmacy Sector 12',
  'Shop 24, Sector 12 Market, Dwarka, New Delhi - 110075',
  '011-4567890',
  '07AAAAA1111A1Z1'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Suppliers
INSERT INTO public.suppliers (id, store_id, name, gstin, phone, email, address)
VALUES 
(
  'b1111111-1111-1111-1111-111111111111', 
  'a1111111-1111-1111-1111-111111111111', 
  'AstraZeneca India', 
  '29AAAAA2222A1Z2',
  '9812345670', 
  'rakesh@astrazeneca.in', 
  'Outer Ring Road, Bangalore, KA'
),
(
  'b2222222-2222-2222-2222-222222222222', 
  'a1111111-1111-1111-1111-111111111111', 
  'Cipla Wholesale Ltd', 
  '27AAAAA3333A1Z3',
  '9812345671', 
  'sales@cipla.co.in', 
  'MIDC Industrial Area, Mumbai, MH'
),
(
  'b3333333-3333-3333-3333-333333333333', 
  'a1111111-1111-1111-1111-111111111111', 
  'MedLife Distributors', 
  '07AAAAA4444A1Z4',
  '9812345672', 
  'contact@medlifedist.com', 
  'Okhla Phase 3, New Delhi, DL'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Medicines
INSERT INTO public.medicines (id, store_id, name, category, hsn_code, gst_rate)
VALUES
(
  'c1111111-1111-1111-1111-111111111111', 
  'a1111111-1111-1111-1111-111111111111', 
  'Amoxicillin 500mg', 
  'Antibiotics', 
  '30041010', 
  12
),
(
  'c2222222-2222-2222-2222-222222222222', 
  'a1111111-1111-1111-1111-111111111111', 
  'Paracetamol 650mg', 
  'Analgesics', 
  '30049060', 
  18
),
(
  'c3333333-3333-3333-3333-333333333333', 
  'a1111111-1111-1111-1111-111111111111', 
  'Atorvastatin 10mg', 
  'Cardiology', 
  '30049099', 
  12
),
(
  'c4444444-4444-4444-4444-444444444444', 
  'a1111111-1111-1111-1111-111111111111', 
  'Metformin 500mg', 
  'Antidiabetic', 
  '30049088', 
  12
)
ON CONFLICT (id) DO NOTHING;

-- 4. Medicine Batches
INSERT INTO public.medicine_batches (id, store_id, medicine_id, batch_number, expiry_date, manufacturing_date, purchase_price_paise, selling_price_paise, mrp_paise, current_stock, supplier_id)
VALUES
(
  'd1111111-1111-1111-1111-111111111111', 
  'a1111111-1111-1111-1111-111111111111', 
  'c1111111-1111-1111-1111-111111111111', 
  'AMX-26A', 
  '2028-12-31', 
  '2026-01-01', 
  9500, 
  14500, 
  14500, 
  150,
  'b1111111-1111-1111-1111-111111111111'
),
(
  'd2222222-2222-2222-2222-222222222222', 
  'a1111111-1111-1111-1111-111111111111', 
  'c2222222-2222-2222-2222-222222222222', 
  'PCM-09', 
  '2027-06-30', 
  '2025-06-01', 
  2000, 
  3200, 
  3200, 
  300,
  'b2222222-2222-2222-2222-222222222222'
),
(
  'd3333333-3333-3333-3333-333333333333', 
  'a1111111-1111-1111-1111-111111111111', 
  'c3333333-3333-3333-3333-333333333333', 
  'ATV-09', 
  '2026-08-15', 
  '2024-08-01', 
  12000, 
  18500, 
  18500, 
  5,
  'b3333333-3333-3333-3333-333333333333'
),
(
  'd4444444-4444-4444-4444-444444444444', 
  'a1111111-1111-1111-1111-111111111111', 
  'c4444444-4444-4444-4444-444444444444', 
  'MTF-20', 
  '2026-09-01', 
  '2024-09-01', 
  3000, 
  4800, 
  4800, 
  14,
  'b3333333-3333-3333-3333-333333333333'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Customers
INSERT INTO public.customers (id, store_id, name, phone, email, address)
VALUES
(
  'e1111111-1111-1111-1111-111111111111', 
  'a1111111-1111-1111-1111-111111111111', 
  'Amit Sharma', 
  '9876543210', 
  'amit@gmail.com', 
  'Flat 45C, Sector 12 Dwarka, New Delhi'
),
(
  'e2222222-2222-2222-2222-222222222222', 
  'a1111111-1111-1111-1111-111111111111', 
  'Rohan Verma', 
  '9812345678', 
  'rohan@gmail.com', 
  'Sector 9 Outer Ring, Dwarka, New Delhi'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Initial Stock Movements (to audit trails and trigger-maintain stock values if active)
INSERT INTO public.stock_movements (store_id, batch_id, type, quantity, notes)
VALUES
('a1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'purchase_in', 150, 'Initial setup purchase intake'),
('a1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'purchase_in', 300, 'Initial setup purchase intake'),
('a1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'purchase_in', 5, 'Initial setup purchase intake'),
('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'purchase_in', 14, 'Initial setup purchase intake')
ON CONFLICT DO NOTHING;
