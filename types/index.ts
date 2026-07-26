/**
 * Shared TypeScript Types and Enums for Medical Store ERP
 */

export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
}

export enum StockMovementType {
  PURCHASE_IN = 'PURCHASE_IN',
  SALE_OUT = 'SALE_OUT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  TRANSFER = 'TRANSFER',
}

export enum GSTRate {
  NONE = 0,
  GST_5 = 5,
  GST_12 = 12,
  GST_18 = 18,
  GST_28 = 28,
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  name: string;
  createdAt: string;
  storeId: string;
}

export interface Medicine {
  id: string;
  name: string;
  composition: string;
  hsnCode?: string;
  gstRate: GSTRate;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineBatch {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string; // ISO String (DD-MMM-YYYY for display)
  manufacturingDate: string; // ISO String
  costPriceInPaise: number; // Stored as integer
  sellingPriceInPaise: number; // Stored as integer
  mrpInPaise: number; // Max Retail Price
  currentStock: number;
  supplierId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  batchId: string;
  type: StockMovementType;
  quantity: number;
  userId: string;
  notes?: string;
  storeId: string;
  createdAt: string;
}

export interface SalesInvoiceItem {
  id: string;
  invoiceId: string;
  medicineId: string;
  batchId: string;
  quantity: number;
  unitPriceInPaise: number;
  gstAmountInPaise: number;
  gstRate: GSTRate;
  discountInPaise?: number;
  totalInPaise: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string; // Immutable, structured format
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  subtotalInPaise: number;
  discountInPaise: number;
  gstTotalInPaise: number;
  grandTotalInPaise: number;
  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'CREDIT';
  cashierId: string;
  storeId: string;
  createdAt: string; // UTC timestamp
}

export interface Supplier {
  id: string;
  name: string;
  gstin?: string;
  phone: string;
  email?: string;
  address?: string;
  storeId: string;
  createdAt: string;
}
