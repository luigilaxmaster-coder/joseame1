/**
 * Piquete Service - Manages piquete balance operations
 * Handles deductions, refunds, and balance tracking
 */

import { BaseCrudService } from '@/integrations';
import { PiqueteBalances } from '@/entities';
import { calculatePiquetes, calculateRefund, type ExpertiseLevel } from './piquete-calculator';

/**
 * Get or create a piquete balance record for a joseador
 */
export async function getOrCreatePiqueteBalance(
  joseadorId: string,
  joseadorName?: string
): Promise<PiqueteBalances> {
  try {
    // Try to find existing balance
    const { items } = await BaseCrudService.getAll<PiqueteBalances>('piquetebalances');
    const existingBalance = items.find(b => b.joseadorId === joseadorId);
    
    if (existingBalance) {
      return existingBalance;
    }

    // Create new balance record if it doesn't exist
    const newBalance: PiqueteBalances = {
      _id: crypto.randomUUID(),
      joseadorId,
      joseadorName: joseadorName || joseadorId,
      currentBalance: 0,
      totalPiquetesEarned: 0,
      totalPiquetesSpent: 0,
      lastUpdated: new Date().toISOString()
    };

    await BaseCrudService.create('piquetebalances', newBalance);
    return newBalance;
  } catch (error) {
    console.error('Error getting or creating piquete balance:', error);
    throw error;
  }
}

/**
 * Deduct piquetes from a joseador's balance when they apply to a job
 */
export async function deductPiquetes(
  joseadorId: string,
  jobBudget: number,
  expertiseLevel: ExpertiseLevel = 'beginner'
): Promise<{
  success: boolean;
  piquetesDeducted: number;
  newBalance: number;
  error?: string;
}> {
  try {
    // Calculate piquetes needed
    const calculation = calculatePiquetes(jobBudget, expertiseLevel);
    const piquetesNeeded = calculation.totalPiquetes;

    // Get current balance
    const balance = await getOrCreatePiqueteBalance(joseadorId);
    const currentBalance = balance.currentBalance || 0;

    // Check if joseador has enough piquetes
    if (currentBalance < piquetesNeeded) {
      return {
        success: false,
        piquetesDeducted: 0,
        newBalance: currentBalance,
        error: `No tienes suficientes piquetes. Necesitas ${piquetesNeeded} pero solo tienes ${currentBalance}.`
      };
    }

    // Deduct piquetes
    const newBalance = currentBalance - piquetesNeeded;
    const totalSpent = (balance.totalPiquetesSpent || 0) + piquetesNeeded;

    await BaseCrudService.update('piquetebalances', {
      _id: balance._id,
      currentBalance: newBalance,
      totalPiquetesSpent: totalSpent,
      lastUpdated: new Date().toISOString()
    });

    return {
      success: true,
      piquetesDeducted: piquetesNeeded,
      newBalance
    };
  } catch (error) {
    console.error('Error deducting piquetes:', error);
    return {
      success: false,
      piquetesDeducted: 0,
      newBalance: 0,
      error: 'Error al deducir piquetes. Intenta de nuevo.'
    };
  }
}

/**
 * Refund piquetes to a joseador based on job outcome
 */
export async function refundPiquetes(
  joseadorId: string,
  jobBudget: number,
  jobStatus: 'rejected' | 'completed' | 'cancelled',
  expertiseLevel: ExpertiseLevel = 'beginner'
): Promise<{
  success: boolean;
  piquetesRefunded: number;
  newBalance: number;
  error?: string;
}> {
  try {
    // Calculate original piquetes used
    const calculation = calculatePiquetes(jobBudget, expertiseLevel);
    const originalPiquetes = calculation.totalPiquetes;

    // Calculate refund amount
    const refundAmount = calculateRefund(originalPiquetes, jobStatus);

    // Get current balance
    const balance = await getOrCreatePiqueteBalance(joseadorId);
    const currentBalance = balance.currentBalance || 0;

    // Add refund
    const newBalance = currentBalance + refundAmount;
    const totalSpent = Math.max(0, (balance.totalPiquetesSpent || 0) - refundAmount);

    await BaseCrudService.update('piquetebalances', {
      _id: balance._id,
      currentBalance: newBalance,
      totalPiquetesSpent: totalSpent,
      lastUpdated: new Date().toISOString()
    });

    return {
      success: true,
      piquetesRefunded: refundAmount,
      newBalance
    };
  } catch (error) {
    console.error('Error refunding piquetes:', error);
    return {
      success: false,
      piquetesRefunded: 0,
      newBalance: 0,
      error: 'Error al reembolsar piquetes. Intenta de nuevo.'
    };
  }
}

/**
 * Add piquetes to a joseador's balance (e.g., after purchase)
 */
export async function addPiquetes(
  joseadorId: string,
  piquetesToAdd: number,
  joseadorName?: string
): Promise<{
  success: boolean;
  newBalance: number;
  error?: string;
}> {
  try {
    const balance = await getOrCreatePiqueteBalance(joseadorId, joseadorName);
    const currentBalance = balance.currentBalance || 0;
    const newBalance = currentBalance + piquetesToAdd;
    const totalEarned = (balance.totalPiquetesEarned || 0) + piquetesToAdd;

    await BaseCrudService.update('piquetebalances', {
      _id: balance._id,
      currentBalance: newBalance,
      totalPiquetesEarned: totalEarned,
      lastUpdated: new Date().toISOString()
    });

    return {
      success: true,
      newBalance
    };
  } catch (error) {
    console.error('Error adding piquetes:', error);
    return {
      success: false,
      newBalance: 0,
      error: 'Error al agregar piquetes. Intenta de nuevo.'
    };
  }
}

/**
 * Get current piquete balance for a joseador
 */
export async function getPiqueteBalance(joseadorId: string): Promise<number> {
  try {
    const balance = await getOrCreatePiqueteBalance(joseadorId);
    return balance.currentBalance || 0;
  } catch (error) {
    console.error('Error getting piquete balance:', error);
    return 0;
  }
}
