-- Stored Procedure (RPC) to finalize a POS Bill atomically
-- Inserts bill, bill_items, and stock_movements (sale_out) in a single transaction block.
-- Automatically updates batch stock counts via existing trigger.

CREATE OR REPLACE FUNCTION finalize_bill(
  p_store_id UUID,
  p_customer_id UUID,
  p_cashier_id UUID,
  p_discount_paise INTEGER,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_bill_id UUID;
  v_item JSONB;
  v_batch_id UUID;
  v_qty INTEGER;
  v_mrp INTEGER;
  v_sell_price INTEGER;
  v_gst_rate NUMERIC;
  v_gst_amount INTEGER;
  v_total_tax INTEGER := 0;
  v_subtotal INTEGER := 0;
  v_final_total INTEGER;
BEGIN
  -- 1. Create the sales bill header (marked as finalized)
  INSERT INTO bills (
    store_id,
    customer_id,
    cashier_id,
    status,
    subtotal_paise,
    discount_paise,
    total_tax_paise,
    total_amount_paise
  ) VALUES (
    p_store_id,
    p_customer_id,
    p_cashier_id,
    'finalized',
    0,
    p_discount_paise,
    0,
    0
  ) RETURNING id INTO v_bill_id;

  -- 2. Loop through JSONB items to insert line items and log stock deductions
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_batch_id := (v_item->>'batch_id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;
    
    -- Retrieve batch details to verify prices and tax rate
    SELECT mrp_paise, selling_price_paise, m.gst_rate
    INTO v_mrp, v_sell_price, v_gst_rate
    FROM medicine_batches mb
    JOIN medicines m ON m.id = mb.medicine_id
    WHERE mb.id = v_batch_id;

    -- Verify stock is available in the batch
    IF (SELECT current_stock FROM medicine_batches WHERE id = v_batch_id) < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for batch code %', (SELECT batch_number FROM medicine_batches WHERE id = v_batch_id);
    END IF;

    -- Calculate inclusive GST amounts (GST rate is percentage e.g., 12.00)
    -- Tax amount = SellingPrice - (SellingPrice / (1 + (GSTRate/100)))
    v_gst_amount := v_sell_price - ROUND(v_sell_price / (1.0 + v_gst_rate / 100.0));
    v_gst_amount := v_gst_amount * v_qty;

    -- Insert into bill_items
    INSERT INTO bill_items (
      store_id,
      bill_id,
      batch_id,
      quantity,
      unit_price_paise,
      gst_rate,
      gst_amount_paise,
      mrp_paise
    ) VALUES (
      p_store_id,
      v_bill_id,
      v_batch_id,
      v_qty,
      v_sell_price,
      v_gst_rate,
      v_gst_amount,
      v_mrp
    );

    -- Log stock movement deduction (sale_out)
    INSERT INTO stock_movements (
      store_id,
      batch_id,
      type,
      quantity,
      reference_id,
      user_id,
      notes
    ) VALUES (
      p_store_id,
      v_batch_id,
      'sale_out',
      v_qty,
      v_bill_id,
      p_cashier_id,
      'POS Sales Checkout'
    );

    -- Accumulate subtotal & tax totals
    v_subtotal := v_subtotal + (v_sell_price * v_qty);
    v_total_tax := v_total_tax + v_gst_amount;
  END LOOP;

  -- 3. Calculate final totals (applying discounts)
  v_final_total := v_subtotal - p_discount_paise;
  IF v_final_total < 0 THEN
    v_final_total := 0;
  END IF;

  -- 4. Update the bill with the correct derived totals
  UPDATE bills
  SET subtotal_paise = v_subtotal,
      total_tax_paise = v_total_tax,
      total_amount_paise = v_final_total
  WHERE id = v_bill_id;

  RETURN v_bill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
