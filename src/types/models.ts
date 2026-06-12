import type {
  Role,
  OrderStatus,
  OrderMode,
  PaymentMethod,
  TransactionType,
  CouponType,
  SubscriptionFrequency,
  ChatMessageType,
  TicketStatus,
  KycStatus,
  CommissionType,
  InventoryMovementType,
  CashEntryType,
  StoreSalePaymentMethod,
} from './enums';
import type { PaginationMeta } from './api.types';

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  avatar?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  referralCode?: string;
  isProfileComplete?: boolean;
  isVerified: boolean;
  isSuspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Address {
  _id: string;
  alias: string;
  street: string;
  neighborhood?: string;
  city: string;
  zipCode?: string;
  reference?: string;
  location?: Location;
  isPrimary: boolean;
}

export interface Purifier {
  _id: string;
  ownerId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  schedule?: string;
  phone?: string;
  photos?: string[];
  description?: string;
  waterTypeIds?: string[];
  bottleSizeIds?: string[];
  deliveryFee?: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurifierPrice {
  waterTypeId: string;
  bottleSizeId: string;
  price: number;
}

export interface Rating {
  _id: string;
  userId: string;
  purifierId: string;
  orderId?: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  userId: string;
  acceptedById?: string;
  assignedDeliveryUserId?: string;
  fulfillingPurifierId?: string;
  mode: OrderMode;
  waterTypeId: string;
  bottleSizeId: string;
  quantity: number;
  subtotal: number;
  deliveryFee?: number;
  tip?: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deliveryAddress: {
    street: string;
    neighborhood?: string;
    city: string;
    zipCode?: string;
    reference?: string;
    lat?: number;
    lng?: number;
  };
  requiresEmptyPickup?: boolean;
  emptyBottleReturned?: boolean;
  couponCode?: string;
  redeemPoints?: number;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  balance: number;
  totalDeposited: number;
  totalEarned: number;
  totalSpent: number;
}

export interface Transaction {
  _id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  orderId?: string;
  reference?: string;
  description?: string;
  createdAt: string;
}

export interface WaterType {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface BottleSize {
  _id: string;
  liters: number;
  name?: string;
  isActive: boolean;
}

export interface DeliveryProfile {
  _id: string;
  userId: string;
  isAvailable: boolean;
  hasOwnInventory: boolean;
  deliveryFee?: number;
  kycStatus: KycStatus;
}

export interface KycVerification {
  _id: string;
  userId: string;
  idPhoto?: string;
  selfie?: string;
  status: KycStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  bottleSizeId: string;
  availableQuantity: number;
  availableSeals: number;
  lowStockThreshold: number;
}

export interface InventoryMovement {
  _id: string;
  purifierId: string;
  bottleSizeId: string;
  type: InventoryMovementType;
  quantity: number;
  seals?: number;
  reason: string;
  createdAt: string;
}

export interface StoreSale {
  _id: string;
  purifierId: string;
  waterTypeId: string;
  bottleSizeId: string;
  quantity: number;
  total: number;
  paymentMethod: StoreSalePaymentMethod;
  createdBy: string;
  createdAt: string;
}

export interface CashRegister {
  _id: string;
  purifierId: string;
  date: string;
  openingBalance: number;
  closingBalance?: number;
  isClosed: boolean;
  createdAt: string;
}

export interface CashEntry {
  _id: string;
  registerId: string;
  type: CashEntryType;
  concept: string;
  amount: number;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  purifierId?: string;
  maxUses?: number;
  maxUsesPerUser?: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface CouponValidation {
  valid: boolean;
  discount: number;
  description?: string;
}

export interface Subscription {
  _id: string;
  userId: string;
  purifierId?: string;
  waterTypeId: string;
  bottleSizeId: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  dayOfWeek?: number;
  hour?: string;
  deliveryAddress?: Record<string, unknown>;
  paymentMethod?: PaymentMethod;
  isActive: boolean;
  isPaused: boolean;
  nextOrderDate?: string;
  createdAt: string;
}

export interface LoyaltyInfo {
  totalPoints: number;
  entries: {
    data: LoyaltyEntry[];
    meta: PaginationMeta;
  };
}

export interface LoyaltyEntry {
  _id: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired';
  reference?: string;
  createdAt: string;
}

export interface LoyaltyEvent {
  _id: string;
  name: string;
  multiplier: number;
  waterTypeId?: string;
  purifierId?: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface ReferralInfo {
  totalReferrals: number;
  totalBonusEarned: number;
  currentMonthBonus: number;
  monthlyCap: number;
}

export interface SupportTicket {
  _id: string;
  userId: string;
  orderId?: string;
  subject: string;
  description: string;
  attachments?: string[];
  status: TicketStatus;
  adminResponse?: string;
  createdAt: string;
  closedAt?: string;
}

export interface ChatMessage {
  _id: string;
  orderId: string;
  senderId: string;
  senderRole: 'consumer' | 'delivery';
  messageType: ChatMessageType;
  content: string;
  createdAt: string;
}

export interface CommissionConfig {
  type: CommissionType;
  value: number;
}

export interface DeliveryLink {
  _id: string;
  purifierId: string;
  deliveryUserId: string;
  shift?: 'morning' | 'afternoon' | 'full';
}

export interface DeliveryInventory {
  waterTypeId: string;
  bottleSizeId: string;
  quantity: number;
}

export interface DeliveryPrice {
  waterTypeId: string;
  bottleSizeId: string;
  price: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface QrToken {
  qrToken: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalReferrals: number;
  pendingKycs: number;
  topPurifiers: Array<{ _id: string; name: string; orderCount: number }>;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  count: number;
}

export interface CommissionConfigHistory {
  _id: string;
  type: CommissionType;
  value: number;
  createdAt: string;
}
