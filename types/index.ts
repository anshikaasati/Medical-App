/**
 * Shared TypeScript Types and Enums for Medical Store ERP
 * Extended from base types to support Phase 1 full production features.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

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
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
}

export enum GSTRate {
  NONE = 0,
  GST_5 = 5,
  GST_12 = 12,
  GST_18 = 18,
  GST_28 = 28,
}

export enum ScheduleType {
  OTC = 'OTC', // Over the counter
  H = 'H', // Prescription required
  H1 = 'H1', // Special prescription
  X = 'X', // Narcotic
  G = 'G', // Pharmacy-only
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIAL = 'PARTIAL',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  NEAR_EXPIRY = 'NEAR_EXPIRY',
  EXPIRED = 'EXPIRED',
  PURCHASE_DUE = 'PURCHASE_DUE',
  PAYMENT_DUE = 'PAYMENT_DUE',
  NEW_ORDER = 'NEW_ORDER',
}

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  name: string;
  createdAt: string;
  storeId: string;
}

/** Extended staff user with granular permissions */
export interface StaffUser extends User {
  employeeId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  permissions: StaffPermissions;
  lastLogin?: string;
}

export interface StaffPermissions {
  billing: boolean;
  inventory: boolean;
  purchase: boolean;
  sales: boolean;
  customers: boolean;
  suppliers: boolean;
  reports: boolean;
  analytics: boolean;
  userManagement: boolean;
  settings: boolean;
}

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  billing: true,
  inventory: false,
  purchase: false,
  sales: true,
  customers: true,
  suppliers: false,
  reports: false,
  analytics: false,
  userManagement: false,
  settings: false,
};

// ─── Store & Settings ─────────────────────────────────────────────────────────

export interface StoreSettings {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  gstin: string;
  pan: string;
  drugLicenseNo: string;
  logoUrl?: string;
  // GST & Tax
  defaultGstRate: GSTRate;
  gstRegistered: boolean;
  // Billing
  invoicePrefix: string;
  invoiceStartNumber: number;
  // Notifications
  lowStockThreshold: number;
  nearExpiryDays: number;
  // Operational
  setupCompleted: boolean;
  createdAt: string;
}

// ─── Medicine & Inventory ─────────────────────────────────────────────────────

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  brand?: string;
  manufacturer?: string;
  composition: string;
  category: string;
  hsnCode?: string;
  gstRate: GSTRate;
  unit: string; // tablet, capsule, ml, etc.
  packSize: number; // units per pack
  scheduleType: ScheduleType;
  prescriptionRequired: boolean;
  storageInstructions?: string;
  description?: string;
  barcodeNumber?: string;
  imageUrl?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineBatch {
  id: string;
  medicineId: string;
  medicineName?: string; // joined field
  batchNumber: string;
  expiryDate: string;
  manufacturingDate: string;
  costPriceInPaise: number;
  sellingPriceInPaise: number;
  mrpInPaise: number;
  currentStock: number;
  reservedStock: number;
  damagedStock: number;
  lowStockLevel: number;
  supplierId: string;
  supplierName?: string; // joined field
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  batchId: string;
  medicineName?: string;
  batchNumber?: string;
  type: StockMovementType;
  quantity: number;
  userId: string;
  userName?: string;
  referenceId?: string; // invoice id, purchase order id, etc.
  notes?: string;
  storeId: string;
  createdAt: string;
}

// ─── Sales & Billing ──────────────────────────────────────────────────────────

export interface SalesInvoiceItem {
  id: string;
  invoiceId: string;
  medicineId: string;
  medicineName?: string;
  batchId: string;
  batchNumber?: string;
  quantity: number;
  unitPriceInPaise: number;
  gstAmountInPaise: number;
  gstRate: GSTRate;
  discountInPaise?: number;
  totalInPaise: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  subtotalInPaise: number;
  discountInPaise: number;
  gstTotalInPaise: number;
  grandTotalInPaise: number;
  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'CREDIT' | 'SPLIT';
  cashierId: string;
  cashierName?: string;
  status: 'draft' | 'finalized';
  storeId: string;
  createdAt: string;
  items?: SalesInvoiceItem[];
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  medicineId: string;
  medicineName?: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  receivedQuantity: number;
  costPriceInPaise: number;
  sellingPriceInPaise: number;
  mrpInPaise: number;
  gstRate: GSTRate;
  totalInPaise: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName?: string;
  status: PurchaseOrderStatus;
  totalInPaise: number;
  notes?: string;
  expectedDelivery?: string;
  receivedAt?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  items?: PurchaseOrderItem[];
}

// ─── Supplier ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  gstin?: string;
  drugLicenseNo?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentTermsDays: number; // net-30, net-60 etc.
  outstandingBalanceInPaise: number;
  totalPurchasesInPaise: number;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  outstandingCreditInPaise: number;
  totalPurchasesInPaise: number;
  totalOrders: number;
  storeId: string;
  createdAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface DailySalesReport {
  date: string;
  totalSalesInPaise: number;
  totalProfitInPaise: number;
  invoiceCount: number;
  topMedicine: string;
}

export interface MedicineSalesReport {
  medicineId: string;
  medicineName: string;
  category: string;
  unitsSold: number;
  revenueInPaise: number;
  profitInPaise: number;
}
