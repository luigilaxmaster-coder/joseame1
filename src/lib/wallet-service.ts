import { BaseCrudService } from '@/integrations';

// Types
export interface Wallet {
  _id: string;
  joseadorId: string;
  totalBalance: number;
  purchasedPiquetesBalance: number;
  freePiquetesBalance: number;
  lastUpdated?: Date;
  _createdDate?: Date;
  _updatedDate?: Date;
}

export interface LedgerTransaction {
  _id: string;
  transactionId: string;
  userId: string;
  transactionType: 'debit' | 'credit';
  amount: number;
  description: string;
  balanceAfter: number;
  transactionTimestamp?: Date;
  _createdDate?: Date;
  _updatedDate?: Date;
}

export interface PiqueteOrder {
  _id: string;
  userId: string;
  packageId: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderDate?: Date;
  transactionId?: string;
  _createdDate?: Date;
  _updatedDate?: Date;
}

export interface WithdrawalRequest {
  _id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  bankAccountId: string;
  requestTimestamp?: Date;
  processedTimestamp?: Date;
  adminNotes?: string;
  _createdDate?: Date;
  _updatedDate?: Date;
}

export interface BankAccount {
  _id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  identificationNumber: string;
  accountType: string;
  _createdDate?: Date;
  _updatedDate?: Date;
}

// Constants
export const PIQUETE_VALUE_RD = 1000; // 1 piquete = RD$1,000
export const CURRENCY = 'DOP';

// Wallet Service
export class WalletService {
  /**
   * Get or create wallet for a user
   */
  static async getOrCreateWallet(userId: string): Promise<Wallet> {
    try {
      const { items } = await BaseCrudService.getAll<Wallet>('wallets');
      let wallet = items.find(w => w.joseadorId === userId);

      if (!wallet) {
        const newWallet: Wallet = {
          _id: crypto.randomUUID(),
          joseadorId: userId,
          totalBalance: 0,
          purchasedPiquetesBalance: 0,
          freePiquetesBalance: 5, // Initial free piquetes
          lastUpdated: new Date(),
        };
        await BaseCrudService.create('wallets', newWallet);
        wallet = newWallet;
      }

      return wallet;
    } catch (error) {
      console.error('Error getting or creating wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet by user ID
   */
  static async getWallet(userId: string): Promise<Wallet | null> {
    try {
      const { items } = await BaseCrudService.getAll<Wallet>('wallets');
      return items.find(w => w.joseadorId === userId) || null;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw error;
    }
  }

  /**
   * Add piquetes to wallet (from purchase)
   */
  static async addPiquetes(
    userId: string,
    piqueteCount: number,
    amount: number,
    description: string
  ): Promise<{ wallet: Wallet; ledger: LedgerTransaction }> {
    const wallet = await this.getOrCreateWallet(userId);

    // Validate balance won't go negative
    if (wallet.totalBalance < amount) {
      throw new Error('Insufficient balance for this purchase');
    }

    // Update wallet
    const updatedWallet: Wallet = {
      ...wallet,
      totalBalance: wallet.totalBalance - amount,
      purchasedPiquetesBalance: wallet.purchasedPiquetesBalance + piqueteCount,
      lastUpdated: new Date(),
    };

    await BaseCrudService.update('wallets', {
      _id: wallet._id,
      totalBalance: updatedWallet.totalBalance,
      purchasedPiquetesBalance: updatedWallet.purchasedPiquetesBalance,
      lastUpdated: updatedWallet.lastUpdated,
    });

    // Create ledger entry
    const ledgerEntry: LedgerTransaction = {
      _id: crypto.randomUUID(),
      transactionId: `TXN-${Date.now()}`,
      userId,
      transactionType: 'debit',
      amount,
      description,
      balanceAfter: updatedWallet.totalBalance,
      transactionTimestamp: new Date(),
    };

    await BaseCrudService.create('ledger', ledgerEntry);

    return { wallet: updatedWallet, ledger: ledgerEntry };
  }

  /**
   * Use piquetes for job application
   */
  static async usePiquetes(
    userId: string,
    piqueteCount: number,
    jobId: string
  ): Promise<{ wallet: Wallet; ledger: LedgerTransaction }> {
    const wallet = await this.getOrCreateWallet(userId);

    // Check if user has enough piquetes (prefer free first)
    const totalPiquetes = wallet.freePiquetesBalance + wallet.purchasedPiquetesBalance;
    if (totalPiquetes < piqueteCount) {
      throw new Error('Insufficient piquetes for this application');
    }

    // Deduct from free first, then purchased
    let freePiquetesUsed = Math.min(piqueteCount, wallet.freePiquetesBalance);
    let purchasedPiquetesUsed = piqueteCount - freePiquetesUsed;

    const updatedWallet: Wallet = {
      ...wallet,
      freePiquetesBalance: wallet.freePiquetesBalance - freePiquetesUsed,
      purchasedPiquetesBalance: wallet.purchasedPiquetesBalance - purchasedPiquetesUsed,
      lastUpdated: new Date(),
    };

    await BaseCrudService.update('wallets', {
      _id: wallet._id,
      freePiquetesBalance: updatedWallet.freePiquetesBalance,
      purchasedPiquetesBalance: updatedWallet.purchasedPiquetesBalance,
      lastUpdated: updatedWallet.lastUpdated,
    });

    // Create ledger entry
    const ledgerEntry: LedgerTransaction = {
      _id: crypto.randomUUID(),
      transactionId: `TXN-${Date.now()}`,
      userId,
      transactionType: 'debit',
      amount: 0, // No monetary debit for piquete usage
      description: `Piquetes used for job application: ${jobId}`,
      balanceAfter: updatedWallet.totalBalance,
      transactionTimestamp: new Date(),
    };

    await BaseCrudService.create('ledger', ledgerEntry);

    return { wallet: updatedWallet, ledger: ledgerEntry };
  }

  /**
   * Add funds to wallet (from job completion)
   */
  static async addFunds(
    userId: string,
    amount: number,
    description: string
  ): Promise<{ wallet: Wallet; ledger: LedgerTransaction }> {
    const wallet = await this.getOrCreateWallet(userId);

    const updatedWallet: Wallet = {
      ...wallet,
      totalBalance: wallet.totalBalance + amount,
      lastUpdated: new Date(),
    };

    await BaseCrudService.update('wallets', {
      _id: wallet._id,
      totalBalance: updatedWallet.totalBalance,
      lastUpdated: updatedWallet.lastUpdated,
    });

    // Create ledger entry
    const ledgerEntry: LedgerTransaction = {
      _id: crypto.randomUUID(),
      transactionId: `TXN-${Date.now()}`,
      userId,
      transactionType: 'credit',
      amount,
      description,
      balanceAfter: updatedWallet.totalBalance,
      transactionTimestamp: new Date(),
    };

    await BaseCrudService.create('ledger', ledgerEntry);

    return { wallet: updatedWallet, ledger: ledgerEntry };
  }

  /**
   * Get transaction history for user
   */
  static async getTransactionHistory(userId: string, limit = 50): Promise<LedgerTransaction[]> {
    try {
      const { items } = await BaseCrudService.getAll<LedgerTransaction>('ledger', [], { limit });
      return items.filter(t => t.userId === userId).sort((a, b) => {
        const dateA = new Date(a.transactionTimestamp || 0).getTime();
        const dateB = new Date(b.transactionTimestamp || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }
}

// Piquete Order Service
export class PiqueteOrderService {
  /**
   * Create a piquete order (mock payment)
   */
  static async createOrder(
    userId: string,
    packageId: string,
    amount: number
  ): Promise<PiqueteOrder> {
    const order: PiqueteOrder = {
      _id: crypto.randomUUID(),
      userId,
      packageId,
      amount,
      currency: CURRENCY,
      paymentStatus: 'pending',
      orderDate: new Date(),
      transactionId: `ORD-${Date.now()}`,
    };

    await BaseCrudService.create('piqueteorders', order);
    return order;
  }

  /**
   * Complete order payment (mock Stripe)
   */
  static async completePayment(orderId: string): Promise<PiqueteOrder> {
    const order = await BaseCrudService.getById<PiqueteOrder>('piqueteorders', orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.paymentStatus !== 'pending') {
      throw new Error('Order is not pending');
    }

    const updatedOrder: PiqueteOrder = {
      ...order,
      paymentStatus: 'paid',
    };

    await BaseCrudService.update('piqueteorders', {
      _id: orderId,
      paymentStatus: 'paid',
    });

    return updatedOrder;
  }

  /**
   * Get order by ID
   */
  static async getOrder(orderId: string): Promise<PiqueteOrder | null> {
    try {
      return await BaseCrudService.getById<PiqueteOrder>('piqueteorders', orderId);
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(userId: string): Promise<PiqueteOrder[]> {
    try {
      const { items } = await BaseCrudService.getAll<PiqueteOrder>('piqueteorders');
      return items.filter(o => o.userId === userId).sort((a, b) => {
        const dateA = new Date(a.orderDate || 0).getTime();
        const dateB = new Date(b.orderDate || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }
}

// Withdrawal Service
export class WithdrawalService {
  /**
   * Create withdrawal request
   */
  static async createWithdrawalRequest(
    userId: string,
    amount: number,
    bankAccountId: string
  ): Promise<WithdrawalRequest> {
    // Validate wallet has sufficient balance
    const wallet = await WalletService.getWallet(userId);
    if (!wallet || wallet.totalBalance < amount) {
      throw new Error('Insufficient balance for withdrawal');
    }

    const request: WithdrawalRequest = {
      _id: crypto.randomUUID(),
      userId,
      amount,
      status: 'pending',
      bankAccountId,
      requestTimestamp: new Date(),
    };

    await BaseCrudService.create('withdrawals', request);

    // Create ledger entry for pending withdrawal
    await BaseCrudService.create('ledger', {
      _id: crypto.randomUUID(),
      transactionId: `WTH-${Date.now()}`,
      userId,
      transactionType: 'debit',
      amount,
      description: `Withdrawal request pending: ${request._id}`,
      balanceAfter: wallet.totalBalance - amount,
      transactionTimestamp: new Date(),
    });

    return request;
  }

  /**
   * Get withdrawal request by ID
   */
  static async getWithdrawalRequest(requestId: string): Promise<WithdrawalRequest | null> {
    try {
      return await BaseCrudService.getById<WithdrawalRequest>('withdrawals', requestId);
    } catch (error) {
      console.error('Error getting withdrawal request:', error);
      return null;
    }
  }

  /**
   * Get user's withdrawal requests
   */
  static async getUserWithdrawals(userId: string): Promise<WithdrawalRequest[]> {
    try {
      const { items } = await BaseCrudService.getAll<WithdrawalRequest>('withdrawals');
      return items.filter(w => w.userId === userId).sort((a, b) => {
        const dateA = new Date(a.requestTimestamp || 0).getTime();
        const dateB = new Date(b.requestTimestamp || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting user withdrawals:', error);
      throw error;
    }
  }

  /**
   * Approve withdrawal request (admin)
   */
  static async approveWithdrawal(requestId: string, adminNotes?: string): Promise<WithdrawalRequest> {
    const request = await this.getWithdrawalRequest(requestId);
    if (!request) {
      throw new Error('Withdrawal request not found');
    }

    const updated: WithdrawalRequest = {
      ...request,
      status: 'approved',
      processedTimestamp: new Date(),
      adminNotes,
    };

    await BaseCrudService.update('withdrawals', {
      _id: requestId,
      status: 'approved',
      processedTimestamp: updated.processedTimestamp,
      adminNotes,
    });

    return updated;
  }

  /**
   * Reject withdrawal request (admin)
   */
  static async rejectWithdrawal(requestId: string, adminNotes: string): Promise<WithdrawalRequest> {
    const request = await this.getWithdrawalRequest(requestId);
    if (!request) {
      throw new Error('Withdrawal request not found');
    }

    const updated: WithdrawalRequest = {
      ...request,
      status: 'rejected',
      processedTimestamp: new Date(),
      adminNotes,
    };

    await BaseCrudService.update('withdrawals', {
      _id: requestId,
      status: 'rejected',
      processedTimestamp: updated.processedTimestamp,
      adminNotes,
    });

    // Reverse ledger entry
    const wallet = await WalletService.getWallet(request.userId);
    if (wallet) {
      await BaseCrudService.create('ledger', {
        _id: crypto.randomUUID(),
        transactionId: `WTH-REVERSED-${Date.now()}`,
        userId: request.userId,
        transactionType: 'credit',
        amount: request.amount,
        description: `Withdrawal rejected: ${requestId}`,
        balanceAfter: wallet.totalBalance + request.amount,
        transactionTimestamp: new Date(),
      });

      // Restore balance
      await BaseCrudService.update('wallets', {
        _id: wallet._id,
        totalBalance: wallet.totalBalance + request.amount,
        lastUpdated: new Date(),
      });
    }

    return updated;
  }

  /**
   * Complete withdrawal (after bank transfer)
   */
  static async completeWithdrawal(requestId: string): Promise<WithdrawalRequest> {
    const request = await this.getWithdrawalRequest(requestId);
    if (!request) {
      throw new Error('Withdrawal request not found');
    }

    const updated: WithdrawalRequest = {
      ...request,
      status: 'completed',
      processedTimestamp: new Date(),
    };

    await BaseCrudService.update('withdrawals', {
      _id: requestId,
      status: 'completed',
      processedTimestamp: updated.processedTimestamp,
    });

    return updated;
  }
}

// Bank Account Service
export class BankAccountService {
  /**
   * Add bank account
   */
  static async addBankAccount(
    userId: string,
    bankName: string,
    accountNumber: string,
    accountHolderName: string,
    identificationNumber: string,
    accountType: string
  ): Promise<BankAccount> {
    const account: BankAccount = {
      _id: crypto.randomUUID(),
      userId,
      bankName,
      accountNumber,
      accountHolderName,
      identificationNumber,
      accountType,
    };

    await BaseCrudService.create('bankaccounts', account);
    return account;
  }

  /**
   * Get user's bank accounts
   */
  static async getUserBankAccounts(userId: string): Promise<BankAccount[]> {
    try {
      const { items } = await BaseCrudService.getAll<BankAccount>('bankaccounts');
      return items.filter(a => a.userId === userId);
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      throw error;
    }
  }

  /**
   * Get bank account by ID
   */
  static async getBankAccount(accountId: string): Promise<BankAccount | null> {
    try {
      return await BaseCrudService.getById<BankAccount>('bankaccounts', accountId);
    } catch (error) {
      console.error('Error getting bank account:', error);
      return null;
    }
  }

  /**
   * Delete bank account
   */
  static async deleteBankAccount(accountId: string): Promise<void> {
    await BaseCrudService.delete('bankaccounts', accountId);
  }
}
