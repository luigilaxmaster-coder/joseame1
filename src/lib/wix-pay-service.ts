/**
 * Wix Pay Service - Handles payment processing with Wix Pay API
 * This service creates payment orders and manages the payment flow
 * 
 * Integration with Wix Pay API for secure payment processing
 */

import { BaseCrudService } from '@/integrations';
import { PiquetePurchases } from '@/entities';

/**
 * Create a payment order for piquete purchase
 * This calls the backend to create a secure payment order
 */
export async function createPaymentOrder(
  packageId: string,
  packageName: string,
  price: number,
  credits: number,
  joseadorEmail: string
): Promise<{
  success: boolean;
  orderId?: string;
  clientSecret?: string;
  error?: string;
}> {
  try {
    const response = await fetch('/api/piquetesPay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packageId,
        packageName,
        price,
        credits,
        joseadorEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al crear la orden de pago',
      };
    }

    const data = await response.json();
    return {
      success: true,
      orderId: data.orderId,
      clientSecret: data.clientSecret,
    };
  } catch (error) {
    console.error('Error creating payment order:', error);
    return {
      success: false,
      error: 'Error al conectar con el servicio de pagos',
    };
  }
}

/**
 * Verify payment status
 */
export async function verifyPaymentStatus(orderId: string): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/piquetesPay?orderId=${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al verificar el pago',
      };
    }

    const data = await response.json();
    return {
      success: true,
      status: data.status,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: 'Error al verificar el estado del pago',
    };
  }
}

/**
 * Record a purchase in the database
 */
export async function recordPurchase(
  joseadorEmail: string,
  packageId: string,
  packageName: string,
  amountPaid: number,
  piquetesQuantity: number,
  wixPayOrderId: string,
  paymentStatus: string = 'pending'
): Promise<{
  success: boolean;
  purchaseId?: string;
  error?: string;
}> {
  try {
    const purchase: PiquetePurchases = {
      _id: crypto.randomUUID(),
      joseadorEmail,
      packageId,
      packageName,
      amountPaid,
      piquetesQuantity,
      paymentStatus,
      wixPayOrderId,
      purchaseDateTime: new Date().toISOString(),
    };

    await BaseCrudService.create('piquetepurchases', purchase);

    return {
      success: true,
      purchaseId: purchase._id,
    };
  } catch (error) {
    console.error('Error recording purchase:', error);
    return {
      success: false,
      error: 'Error al registrar la compra',
    };
  }
}

/**
 * Update purchase status after payment confirmation
 */
export async function updatePurchaseStatus(
  purchaseId: string,
  status: 'completed' | 'failed' | 'cancelled'
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await BaseCrudService.update('piquetepurchases', {
      _id: purchaseId,
      paymentStatus: status,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating purchase status:', error);
    return {
      success: false,
      error: 'Error al actualizar el estado de la compra',
    };
  }
}
