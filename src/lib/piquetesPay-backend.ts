/**
 * Wix Pay API Integration - Backend Service Documentation
 * 
 * This file documents the backend implementation for Wix Pay integration.
 * The actual implementation should be in /backend/piquetesPay.web.js
 * 
 * IMPLEMENTATION GUIDE:
 * 
 * 1. Create /backend/piquetesPay.web.js with the following code:
 * 
 * ```javascript
 * import { Permissions, webMethod } from 'wix-web-module';
 * import { payments } from 'wix-payments-backend';
 * import wixData from 'wix-data';
 * 
 * // POST /api/piquetesPay - Create payment order
 * export const createPaymentOrder = webMethod(
 *   Permissions.Anyone,
 *   async (body) => {
 *     try {
 *       const { packageId, packageName, price, credits, joseadorEmail } = body;
 * 
 *       if (!packageId || !packageName || !price || !credits || !joseadorEmail) {
 *         return {
 *           success: false,
 *           error: 'Información incompleta para crear la orden de pago',
 *         };
 *       }
 * 
 *       // Create payment order with Wix Payments API
 *       const paymentOrder = await payments.createPaymentOrder({
 *         amount: price,
 *         currency: 'DOP',
 *         description: `Compra de ${credits} piquetes - ${packageName}`,
 *         metadata: {
 *           packageId,
 *           packageName,
 *           credits,
 *           joseadorEmail,
 *           type: 'piquete_purchase',
 *         },
 *       });
 * 
 *       return {
 *         success: true,
 *         orderId: paymentOrder.id,
 *         clientSecret: paymentOrder.clientSecret,
 *         amount: price,
 *         currency: 'DOP',
 *       };
 *     } catch (error) {
 *       console.error('Error creating payment order:', error);
 *       return {
 *         success: false,
 *         error: 'Error al crear la orden de pago',
 *       };
 *     }
 *   }
 * );
 * 
 * // GET /api/piquetesPay?orderId=xxx - Verify payment status
 * export const verifyPaymentStatus = webMethod(
 *   Permissions.Anyone,
 *   async (orderId) => {
 *     try {
 *       const paymentOrder = await payments.getPaymentOrder(orderId);
 *       return {
 *         success: true,
 *         status: paymentOrder.status,
 *         amount: paymentOrder.amount,
 *         currency: paymentOrder.currency,
 *       };
 *     } catch (error) {
 *       console.error('Error verifying payment:', error);
 *       return {
 *         success: false,
 *         error: 'Error al verificar el estado del pago',
 *       };
 *     }
 *   }
 * );
 * ```
 * 
 * 2. Create /backend/events.js with payment webhook handler:
 * 
 * ```javascript
 * import { payments } from 'wix-payments-backend';
 * import wixData from 'wix-data';
 * 
 * // Handle payment status changes
 * export async function onPaymentUpdate(event) {
 *   try {
 *     const { orderId, status, metadata } = event;
 * 
 *     if (status === 'completed') {
 *       // Payment successful - update purchase record
 *       const purchase = await wixData.query('piquetepurchases')
 *         .eq('wixPayOrderId', orderId)
 *         .find();
 * 
 *       if (purchase.items.length > 0) {
 *         const item = purchase.items[0];
 *         
 *         // Update purchase status
 *         await wixData.update('piquetepurchases', {
 *           _id: item._id,
 *           paymentStatus: 'completed',
 *         });
 * 
 *         // Add piquetes to wallet
 *         const wallet = await wixData.query('piquetebalances')
 *           .eq('joseadorEmail', item.joseadorEmail)
 *           .find();
 * 
 *         if (wallet.items.length > 0) {
 *           const walletItem = wallet.items[0];
 *           const newBalance = (walletItem.currentBalance || 0) + item.piquetesQuantity;
 *           
 *           await wixData.update('piquetebalances', {
 *             _id: walletItem._id,
 *             currentBalance: newBalance,
 *             totalPiquetesEarned: (walletItem.totalPiquetesEarned || 0) + item.piquetesQuantity,
 *             lastUpdated: new Date(),
 *           });
 *         }
 *       }
 *     } else if (status === 'failed' || status === 'cancelled') {
 *       // Payment failed or cancelled
 *       const purchase = await wixData.query('piquetepurchases')
 *         .eq('wixPayOrderId', orderId)
 *         .find();
 * 
 *       if (purchase.items.length > 0) {
 *         await wixData.update('piquetepurchases', {
 *           _id: purchase.items[0]._id,
 *           paymentStatus: status,
 *         });
 *       }
 *     }
 *   } catch (error) {
 *     console.error('Error in onPaymentUpdate:', error);
 *   }
 * }
 * ```
 * 
 * 3. Configure webhook in Wix Dashboard:
 *    - Go to Settings > Webhooks
 *    - Add webhook for: wix.payments.order.status.updated
 *    - Point to: /backend/events.js
 */

export const PIQUETES_PAY_CONFIG = {
  endpoint: '/api/piquetesPay',
  currency: 'DOP',
  methods: {
    POST: 'createPaymentOrder',
    GET: 'verifyPaymentStatus',
  },
  webhooks: {
    paymentUpdate: 'wix.payments.order.status.updated',
  },
};
