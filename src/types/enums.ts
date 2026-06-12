export type Role = 'consumer' | 'purifier' | 'delivery' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_transit'
  | 'empty_pickup'
  | 'delivered'
  | 'cancelled';

export type OrderMode = 'open' | 'to_purifier' | 'to_delivery';

export type PaymentMethod = 'cash' | 'wallet';

export type TransactionType =
  | 'deposit'
  | 'payment'
  | 'earning'
  | 'commission'
  | 'withdrawal'
  | 'referral_bonus'
  | 'points_redemption'
  | 'refund';

export type CouponType =
  | 'amount'
  | 'percentage'
  | 'two_for_one'
  | 'free_delivery';

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly';

export type ChatMessageType = 'text' | 'location' | 'photo';

export type TicketStatus = 'open' | 'in_progress' | 'closed';

export type KycStatus = 'pending' | 'approved' | 'rejected';

export type CommissionType = 'fixed' | 'percentage' | 'disabled';

export type InventoryMovementType = 'in' | 'out' | 'adjustment';

export type CashEntryType = 'income' | 'expense';

export type StoreSalePaymentMethod = 'cash' | 'wallet' | 'transfer';

export type ActiveMode = 'consumer' | 'purifier' | 'delivery' | 'admin';
