# Joseame Financial Module - Complete Guide

## Overview

The financial module provides a complete wallet, piquete purchase, and withdrawal system with:
- Real wallet management with ledger tracking
- Piquete purchase flow (mock payment ready for Stripe)
- Withdrawal request system with bank account management
- Transaction history and audit trail
- Full validation and error handling

## Architecture

### Database Collections

#### 1. **Wallets** (`wallets`)
Stores user wallet balances.

```typescript
{
  _id: string;
  joseadorId: string;           // User ID
  totalBalance: number;          // RD$ available for withdrawal
  purchasedPiquetesBalance: number; // Piquetes bought
  freePiquetesBalance: number;   // Free piquetes (initial 5)
  lastUpdated: Date;
}
```

#### 2. **Ledger** (`ledger`)
Accounting ledger for all transactions (immutable audit trail).

```typescript
{
  _id: string;
  transactionId: string;         // Unique transaction ID
  userId: string;
  transactionType: 'debit' | 'credit';
  amount: number;                // RD$ amount
  description: string;           // What happened
  balanceAfter: number;          // Balance after transaction
  transactionTimestamp: Date;
}
```

#### 3. **Piquete Orders** (`piqueteorders`)
Records of piquete purchases.

```typescript
{
  _id: string;
  userId: string;
  packageId: string;             // Which package was bought
  amount: number;                // Price paid
  currency: string;              // 'DOP'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderDate: Date;
  transactionId: string;         // Payment gateway ID
}
```

#### 4. **Withdrawals** (`withdrawals`)
Withdrawal requests with status tracking.

```typescript
{
  _id: string;
  userId: string;
  amount: number;                // RD$ to withdraw
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  bankAccountId: string;         // Which bank account
  requestTimestamp: Date;
  processedTimestamp?: Date;     // When admin processed it
  adminNotes?: string;           // Reason for rejection, etc.
}
```

#### 5. **Bank Accounts** (`bankaccounts`)
User bank account details for withdrawals.

```typescript
{
  _id: string;
  userId: string;
  bankName: string;              // "Banco Popular"
  accountNumber: string;         // Account or IBAN
  accountHolderName: string;
  identificationNumber: string;  // Cédula
  accountType: string;           // "Checking", "Savings"
}
```

## Services

### WalletService

**Get or Create Wallet**
```typescript
const wallet = await WalletService.getOrCreateWallet(userId);
// Returns wallet, creates if doesn't exist with 5 free piquetes
```

**Add Piquetes (from purchase)**
```typescript
const { wallet, ledger } = await WalletService.addPiquetes(
  userId,
  piqueteCount,    // e.g., 30
  amount,          // e.g., 1200 (RD$)
  description      // "Purchase of Business package"
);
// Deducts amount from balance, adds piquetes, creates ledger entry
```

**Use Piquetes (for job application)**
```typescript
const { wallet, ledger } = await WalletService.usePiquetes(
  userId,
  piqueteCount,    // e.g., 1
  jobId
);
// Deducts from free first, then purchased
```

**Add Funds (from job completion)**
```typescript
const { wallet, ledger } = await WalletService.addFunds(
  userId,
  amount,          // e.g., 5000 (RD$)
  description      // "Payment for job XYZ"
);
// Adds to balance, creates ledger entry
```

**Get Transaction History**
```typescript
const transactions = await WalletService.getTransactionHistory(userId, limit);
// Returns sorted list of all transactions
```

### PiqueteOrderService

**Create Order (mock payment)**
```typescript
const order = await PiqueteOrderService.createOrder(
  userId,
  packageId,
  amount
);
// Creates pending order
```

**Complete Payment (mock Stripe)**
```typescript
const order = await PiqueteOrderService.completePayment(orderId);
// Marks order as paid
```

**Get User Orders**
```typescript
const orders = await PiqueteOrderService.getUserOrders(userId);
// Returns all orders for user
```

### WithdrawalService

**Create Withdrawal Request**
```typescript
const withdrawal = await WithdrawalService.createWithdrawalRequest(
  userId,
  amount,          // e.g., 5000
  bankAccountId
);
// Creates pending withdrawal, deducts from balance in ledger
```

**Approve Withdrawal (admin)**
```typescript
const withdrawal = await WithdrawalService.approveWithdrawal(
  requestId,
  adminNotes       // Optional
);
```

**Reject Withdrawal (admin)**
```typescript
const withdrawal = await WithdrawalService.rejectWithdrawal(
  requestId,
  adminNotes       // Required - reason for rejection
);
// Reverses ledger entry, restores balance
```

**Complete Withdrawal (after bank transfer)**
```typescript
const withdrawal = await WithdrawalService.completeWithdrawal(requestId);
```

### BankAccountService

**Add Bank Account**
```typescript
const account = await BankAccountService.addBankAccount(
  userId,
  bankName,
  accountNumber,
  accountHolderName,
  identificationNumber,
  accountType
);
```

**Get User Bank Accounts**
```typescript
const accounts = await BankAccountService.getUserBankAccounts(userId);
```

**Delete Bank Account**
```typescript
await BankAccountService.deleteBankAccount(accountId);
```

## UI Components

### WalletOverview
Displays wallet balances, stats, and recent transactions.

```tsx
import WalletOverview from '@/components/wallet/WalletOverview';

<WalletOverview />
```

### BuyPiquetesFlow
Multi-step flow for purchasing piquetes:
1. Select package
2. Review checkout
3. Mock payment (dev mode)
4. Confirmation

```tsx
import BuyPiquetesFlow from '@/components/wallet/BuyPiquetesFlow';

<BuyPiquetesFlow />
```

### WithdrawalFlow
Multi-step flow for withdrawing funds:
1. Enter amount
2. Select/add bank account
3. Review withdrawal
4. Confirmation

```tsx
import WithdrawalFlow from '@/components/wallet/WithdrawalFlow';

<WithdrawalFlow />
```

## Routes

- `/joseador/wallet` - Main wallet page with overview
- `/joseador/buy-piquetes` - Buy piquetes flow
- `/joseador/withdraw` - Withdrawal flow

## Constants

```typescript
export const PIQUETE_VALUE_RD = 1000;  // 1 piquete = RD$1,000
export const CURRENCY = 'DOP';         // Dominican Peso
```

## Key Features

### ✅ Implemented

- [x] Real wallet system with persistent storage
- [x] Ledger-based accounting (immutable audit trail)
- [x] Piquete purchase with mock payment
- [x] Withdrawal requests with status tracking
- [x] Bank account management
- [x] Transaction history
- [x] Free piquetes (5 initial)
- [x] Purchased piquetes tracking
- [x] Balance validation (no negative balances)
- [x] Error handling and validation
- [x] Loading states
- [x] Premium UI/UX

### 🔄 Ready for Stripe Integration

The payment flow is isolated and ready for Stripe:

1. **Current (Mock)**: `PiqueteOrderService.completePayment()` simulates payment
2. **For Stripe**: Replace with actual Stripe API call
3. **Webhook**: Handle Stripe webhook to confirm payment
4. **Ledger**: Automatically creates ledger entry on payment success

### 📋 Admin Features (Ready to Build)

- Approve/reject withdrawals
- View all transactions
- Manage user wallets
- Process payouts to bank accounts

## Usage Examples

### Complete Purchase Flow

```typescript
// 1. User selects package and proceeds to payment
const order = await PiqueteOrderService.createOrder(
  userId,
  packageId,
  1200  // RD$
);

// 2. Mock payment (in dev mode)
await PiqueteOrderService.completePayment(order._id);

// 3. Add piquetes to wallet
const { wallet } = await WalletService.addPiquetes(
  userId,
  30,    // 30 piquetes
  1200,  // RD$ deducted
  "Purchase of Business package"
);

// 4. User now has 30 piquetes ready to use
```

### Complete Withdrawal Flow

```typescript
// 1. User adds bank account
const account = await BankAccountService.addBankAccount(
  userId,
  "Banco Popular",
  "1234567890",
  "Juan Pérez",
  "001-1234567-8",
  "Checking"
);

// 2. User requests withdrawal
const withdrawal = await WithdrawalService.createWithdrawalRequest(
  userId,
  5000,  // RD$
  account._id
);

// 3. Admin approves
await WithdrawalService.approveWithdrawal(withdrawal._id);

// 4. After bank transfer, mark as complete
await WithdrawalService.completeWithdrawal(withdrawal._id);
```

### Use Piquetes for Job

```typescript
// When user applies to job
const { wallet } = await WalletService.usePiquetes(
  userId,
  1,     // 1 piquete
  jobId
);

// Wallet now has 1 less piquete
// Ledger records the transaction
```

## Validation Rules

1. **No Negative Balances**: Cannot withdraw/use more than available
2. **Free First**: When using piquetes, free ones are used first
3. **Minimum Withdrawal**: RD$ 500 minimum
4. **Bank Account Required**: Must have valid bank account for withdrawal
5. **Status Transitions**: Withdrawals follow strict status flow

## Error Handling

All services throw descriptive errors:

```typescript
try {
  await WalletService.addPiquetes(userId, 30, 1200, "Purchase");
} catch (error) {
  // "Insufficient balance for this purchase"
  // "Wallet not found"
  // etc.
}
```

## Testing Checklist

- [ ] Create wallet for new user (5 free piquetes)
- [ ] Purchase piquetes (mock payment)
- [ ] Verify piquetes added to wallet
- [ ] Use piquetes for job application
- [ ] Verify free piquetes used first
- [ ] Add bank account
- [ ] Request withdrawal
- [ ] Verify ledger entries created
- [ ] View transaction history
- [ ] Reject withdrawal (verify balance restored)
- [ ] Approve and complete withdrawal

## Future Enhancements

1. **Stripe Integration**: Replace mock payment with real Stripe
2. **Admin Dashboard**: Manage withdrawals, view analytics
3. **Piquete Refunds**: Handle job rejections/cancellations
4. **Recurring Purchases**: Auto-renew piquete packages
5. **Referral Bonuses**: Award piquetes for referrals
6. **Analytics**: Revenue, user spending, withdrawal trends
7. **Notifications**: Email/SMS for transactions
8. **Export**: Download transaction history as CSV/PDF

## Security Notes

- All transactions are immutable (ledger-based)
- Bank account details should be encrypted in production
- Withdrawal requests require admin approval
- All amounts are validated before processing
- User can only access their own data

## Support

For issues or questions about the wallet module, check:
1. Ledger entries for transaction history
2. Wallet balance for current state
3. Order status for purchase issues
4. Withdrawal status for payout issues
