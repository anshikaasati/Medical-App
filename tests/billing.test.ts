import { describe, it, expect } from 'vitest';

// 1. Target function: GST inclusive calculation math
// GST inclusive formula: TaxAmount = Price - (Price / (1 + (GSTRate / 100)))
function calculateInclusiveGST(
  sellingPricePaise: number,
  gstRate: number,
  quantity: number
): number {
  const basePrice = sellingPricePaise / (1 + gstRate / 100);
  const taxAmountPerPiece = sellingPricePaise - Math.round(basePrice);
  return taxAmountPerPiece * quantity;
}

// 2. Target function: Ledger stock updater validation
interface BatchItem {
  id: string;
  batchNumber: string;
  currentStock: number;
}

interface StockMovement {
  batchId: string;
  type: 'purchase_in' | 'sale_out' | 'return' | 'damage';
  quantity: number;
}

function processStockMovement(batch: BatchItem, movement: StockMovement): BatchItem {
  if (movement.type === 'sale_out' || movement.type === 'damage') {
    if (batch.currentStock < movement.quantity) {
      throw new Error(`Insufficient stock for batch ${batch.batchNumber}`);
    }
    return {
      ...batch,
      currentStock: batch.currentStock - movement.quantity,
    };
  } else if (movement.type === 'purchase_in' || movement.type === 'return') {
    return {
      ...batch,
      currentStock: batch.currentStock + movement.quantity,
    };
  }
  return batch;
}

// 3. Target function: Bill status mutability lock
interface SalesBill {
  id: string;
  status: 'draft' | 'finalized';
  totalAmountPaise: number;
}

function updateBillAmount(bill: SalesBill, newAmountPaise: number): SalesBill {
  if (bill.status === 'finalized') {
    throw new Error('Transaction rejected: finalized invoice is immutable');
  }
  return {
    ...bill,
    totalAmountPaise: newAmountPaise,
  };
}

describe('POS Billing & Ledger Unit Tests', () => {
  describe('Inclusive GST Calculation Math', () => {
    it('should correctly calculate inclusive GST at 12% for a single item (MRP ₹145.00 / 14500 paise)', () => {
      // 14500 - Math.round(14500 / 1.12) = 14500 - 12946 = 1554 paise (₹15.54)
      const taxAmt = calculateInclusiveGST(14500, 12, 1);
      expect(taxAmt).toBe(1554);
    });

    it('should correctly calculate inclusive GST at 18% for 5 items (MRP ₹32.00 / 3200 paise)', () => {
      // Piece: 3200 - Math.round(3200 / 1.18) = 3200 - 2712 = 488 paise
      // 5 Pieces: 488 * 5 = 2440 paise (₹24.40)
      const taxAmt = calculateInclusiveGST(3200, 18, 5);
      expect(taxAmt).toBe(2440);
    });

    it('should return 0 tax amount for 0% GST items', () => {
      const taxAmt = calculateInclusiveGST(5000, 0, 10);
      expect(taxAmt).toBe(0);
    });
  });

  describe('Ledger Stock Movements & Validation', () => {
    it('should correctly decrement batch stock count on sale_out movement', () => {
      const batch: BatchItem = { id: 'b_01', batchNumber: 'AMX-26A', currentStock: 100 };
      const movement: StockMovement = { batchId: 'b_01', type: 'sale_out', quantity: 5 };

      const updated = processStockMovement(batch, movement);
      expect(updated.currentStock).toBe(95);
    });

    it('should correctly increment batch stock count on purchase/return intake', () => {
      const batch: BatchItem = { id: 'b_02', batchNumber: 'PCM-09', currentStock: 50 };
      const returnMove: StockMovement = { batchId: 'b_02', type: 'return', quantity: 3 };

      const updated = processStockMovement(batch, returnMove);
      expect(updated.currentStock).toBe(53);
    });

    it('should reject sale movement and throw exception when quantity exceeds current batch stock', () => {
      const batch: BatchItem = { id: 'b_01', batchNumber: 'AMX-26A', currentStock: 4 };
      const movement: StockMovement = { batchId: 'b_01', type: 'sale_out', quantity: 5 };

      expect(() => processStockMovement(batch, movement)).toThrowError(
        'Insufficient stock for batch AMX-26A'
      );
    });
  });

  describe('Invoice Status Immutability Lock', () => {
    it('should permit edits on bills marked as draft', () => {
      const draftBill: SalesBill = { id: 'bill_01', status: 'draft', totalAmountPaise: 5000 };
      const updated = updateBillAmount(draftBill, 7500);
      expect(updated.totalAmountPaise).toBe(7500);
    });

    it('should fail updates and throw an error if the bill status is finalized', () => {
      const finalizedBill: SalesBill = {
        id: 'bill_02',
        status: 'finalized',
        totalAmountPaise: 12000,
      };

      expect(() => updateBillAmount(finalizedBill, 15000)).toThrowError(
        'Transaction rejected: finalized invoice is immutable'
      );
    });
  });
});
