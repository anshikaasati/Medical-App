-- Supabase Demo Seeds Migration
-- Inserts realistic pharmacy data to populate command center analytics and POS selectors

-- 1. Store settings
INSERT INTO store_settings (id, name, address, phone, gstin, pan)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'MargPharmacy Sector 12',
  'Shop 24, Sector 12 Market, Dwarka, New Delhi - 110075',
  '011-4567890',
  '07AAAAA1111A1Z1',
  'AAAAA1111A'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Suppliers
INSERT INTO suppliers (id, store_id, name, contact_person, email, phone, address, gstin)
VALUES 
(
  'b1111111-1111-1111-1111-111111111111', 
  'a1111111-1111-1111-1111-111111111111', 
  'AstraZeneca India', 
  'Rakesh Kapoor', 
  'rakesh@astrazeneca.in', 
  '9812345670', 
  'Outer Ring Road, Bangalore, KA', 
  '29AAAAA2222A1Z2'
),
(
  'b2222222-2222-2222-2222-222222222222', 
  'a1111111-1111-1111-1111-111111111111', 
  'Cipla Wholesale Ltd', 
  'Sanjay Dutt', 
  'sales@cipla.co.in', 
  '9812345671', 
  'MIDC Industrial Area, Mumbai, MH', 
  '27AAAAA3333A1Z3'
),
(
  'b3333333-3333-3333-3333-333333333333', 
  'a1111111-1111-1111-1111-111111111111', 
  'MedLife Distributors', 
  'Anita Sen', 
  'contact@medlifedist.com', 
  '9812345672', 
  'Okhla Phase 3, New Delhi, DL', 
  '07AAAAA4444A1Z4'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Medicines
INSERT INTO medicines (id, store_id, name, category, hsn_code, gst_rate, supplier_id)
VALUES
(
  'c1111111-1111-1111-1111-111111111111', 
  'a1111111-1111-1111-1111-111111111111', 
  'Amoxicillin 500mg', 
  'Antibiotics', 
  '30041010', 
  12, 
  'b1111111-1111-1111-1111-111111111111'
),
(
  'c2222222-2222-2222-2222-222222222222', 
  'a1111111-1111-1111-1111-111111111111', 
  'Paracetamol 650mg', 
  'Analgesics', 
  '30049060', 
  18, 
  'b2222222-2222-2222-2222-222222222222'
),
(
  'c3333333-3333-3333-3333-333333333333', 
  'a1111111-1111-1111-1111-111111111111', 
  'Atorvastatin 10mg', 
  'Cardiology', 
  '30049099', 
  12, 
  'b3333333-3333-3333-3333-333333333333'
),
(
  'c4444444-4444-4444-4444-444444444444', 
  'a1111111-1111-1111-1111-111111111111', 
  'Metformin 500mg', 
  'Antidiabetic', 
  '30049088', 
  12, 
  'b3333333-3333-3333-3333-333333333333'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Medicine Batches
INSERT INTO medicine_batches (id, store_id, medicine_id, batch_number, expiry_date, manufacturing_date, cost_price_paise, mrp_paise, selling_price_paise, current_stock)
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
  150
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
  300
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
  5
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
  14
)
ON CONFLICT (id) DO NOTHING;

-- 5. Customers
INSERT INTO customers (id, store_id, name, phone, email, address)
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
INSERT INTO stock_movements (store_id, batch_id, type, quantity, notes)
VALUES
('a1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'purchase_in', 150, 'Initial setup purchase intake'),
('a1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'purchase_in', 300, 'Initial setup purchase intake'),
('a1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'purchase_in', 5, 'Initial setup purchase intake'),
('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'purchase_in', 14, 'Initial setup purchase intake')
ON CONFLICT DO NOTHING;
