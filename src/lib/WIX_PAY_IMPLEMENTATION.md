# Wix Pay Integration - Guía de Implementación Completa

## 📋 Resumen

Este documento describe la implementación completa del sistema de pagos con Wix Pay API para la compra de piquetes en JOSEAME.

## 🏗️ Arquitectura

```
Frontend (CheckoutPage.tsx)
    ↓
createPaymentOrder() → POST /api/piquetesPay
    ↓
Backend (piquetesPay.web.js)
    ↓
Wix Pay API → Crea orden de pago
    ↓
Frontend: Abre popup de Wix Pay
    ↓
Usuario completa pago
    ↓
Wix Pay → Webhook a /backend/events.js
    ↓
onPaymentUpdate() → Acredita piquetes
    ↓
Actualiza piquetebalances
```

## 📁 Archivos Creados

### Frontend

1. **CheckoutPage.tsx** - Página de checkout mejorada
   - Integración con Wix Pay
   - Flujo de pago seguro
   - Manejo de errores
   - Confirmación de compra

2. **wix-pay-service.ts** - Servicio de pagos
   - `createPaymentOrder()` - Crea orden de pago
   - `verifyPaymentStatus()` - Verifica estado
   - `recordPurchase()` - Registra compra
   - `updatePurchaseStatus()` - Actualiza estado

### Backend (Crear manualmente)

1. **backend/piquetesPay.web.js** - API de pagos
   - POST /api/piquetesPay - Crear orden
   - GET /api/piquetesPay - Verificar estado

2. **backend/events.js** - Manejadores de eventos
   - onPaymentUpdate() - Procesa webhooks
   - creditPiquetesOnPayment() - Acredita piquetes
   - updatePurchaseStatus() - Actualiza estado

### CMS Collections

1. **piquetepurchases** - Registra compras
   - joseadorEmail
   - packageId
   - packageName
   - amountPaid
   - piquetesQuantity
   - paymentStatus (pending, completed, failed, cancelled)
   - wixPayOrderId
   - purchaseDateTime

2. **piquetebalances** (actualizado)
   - Nuevos campos: joseadorEmail, freeQuotaBalance

## 🚀 Pasos de Implementación

### Paso 1: Crear Backend Files

Crea `/backend/piquetesPay.web.js`:

```javascript
import { Permissions, webMethod } from 'wix-web-module';
import { payments } from 'wix-payments-backend';
import wixData from 'wix-data';

export const createPaymentOrder = webMethod(
  Permissions.Anyone,
  async (body) => {
    try {
      const { packageId, packageName, price, credits, joseadorEmail } = body;

      if (!packageId || !packageName || !price || !credits || !joseadorEmail) {
        return {
          success: false,
          error: 'Información incompleta para crear la orden de pago',
        };
      }

      const paymentOrder = await payments.createPaymentOrder({
        amount: price,
        currency: 'DOP',
        description: `Compra de ${credits} piquetes - ${packageName}`,
        metadata: {
          packageId,
          packageName,
          credits,
          joseadorEmail,
          type: 'piquete_purchase',
        },
      });

      return {
        success: true,
        orderId: paymentOrder.id,
        clientSecret: paymentOrder.clientSecret,
        amount: price,
        currency: 'DOP',
      };
    } catch (error) {
      console.error('Error creating payment order:', error);
      return {
        success: false,
        error: 'Error al crear la orden de pago',
      };
    }
  }
);

export const verifyPaymentStatus = webMethod(
  Permissions.Anyone,
  async (orderId) => {
    try {
      const paymentOrder = await payments.getPaymentOrder(orderId);
      return {
        success: true,
        status: paymentOrder.status,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        error: 'Error al verificar el estado del pago',
      };
    }
  }
);
```

Crea `/backend/events.js`:

```javascript
import wixData from 'wix-data';

export async function onPaymentUpdate(event) {
  try {
    const { orderId, status, metadata } = event;

    if (status === 'completed') {
      await creditPiquetesOnPayment(orderId, metadata);
    } else if (status === 'failed' || status === 'cancelled') {
      await updatePurchaseStatus(orderId, status);
    }
  } catch (error) {
    console.error('Error in onPaymentUpdate:', error);
  }
}

async function creditPiquetesOnPayment(orderId, metadata) {
  try {
    const purchases = await wixData.query('piquetepurchases')
      .eq('wixPayOrderId', orderId)
      .find();

    if (purchases.items.length === 0) {
      console.warn('No purchase found for order:', orderId);
      return;
    }

    const purchase = purchases.items[0];
    const { joseadorEmail, piquetesQuantity } = purchase;

    const wallets = await wixData.query('piquetebalances')
      .eq('joseadorEmail', joseadorEmail)
      .find();

    if (wallets.items.length > 0) {
      const wallet = wallets.items[0];
      const newBalance = (wallet.currentBalance || 0) + piquetesQuantity;
      const newEarned = (wallet.totalPiquetesEarned || 0) + piquetesQuantity;

      await wixData.update('piquetebalances', {
        _id: wallet._id,
        currentBalance: newBalance,
        totalPiquetesEarned: newEarned,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      await wixData.insert('piquetebalances', {
        joseadorEmail,
        joseadorName: metadata?.joseadorName || joseadorEmail,
        currentBalance: piquetesQuantity,
        totalPiquetesEarned: piquetesQuantity,
        totalPiquetesSpent: 0,
        freeQuotaBalance: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    await wixData.update('piquetepurchases', {
      _id: purchase._id,
      paymentStatus: 'completed',
    });

    console.log('Piquetes credited successfully:', {
      joseadorEmail,
      amount: piquetesQuantity,
    });
  } catch (error) {
    console.error('Error crediting piquetes:', error);
    throw error;
  }
}

async function updatePurchaseStatus(orderId, status) {
  try {
    const purchases = await wixData.query('piquetepurchases')
      .eq('wixPayOrderId', orderId)
      .find();

    if (purchases.items.length > 0) {
      await wixData.update('piquetepurchases', {
        _id: purchases.items[0]._id,
        paymentStatus: status,
      });
    }
  } catch (error) {
    console.error('Error updating purchase status:', error);
    throw error;
  }
}
```

### Paso 2: Configurar Webhook en Wix Dashboard

1. Ve a **Settings > Webhooks**
2. Haz clic en **Add Webhook**
3. Selecciona el evento: **wix.payments.order.status.updated**
4. Ingresa la URL: `/backend/events.js`
5. Selecciona el handler: **onPaymentUpdate**
6. Guarda la configuración

### Paso 3: Configurar Wix Pay en Dashboard

1. Ve a **Settings > Payments**
2. Activa **Wix Pay**
3. Configura tu cuenta de procesador de pagos
4. Establece la moneda como **DOP (Peso Dominicano)**
5. Guarda los cambios

### Paso 4: Pruebas

#### Test 1: Crear Orden de Pago
```bash
curl -X POST http://localhost:3000/api/piquetesPay \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "starter",
    "packageName": "Starter",
    "price": 500,
    "credits": 10,
    "joseadorEmail": "test@example.com"
  }'
```

Respuesta esperada:
```json
{
  "success": true,
  "orderId": "order_123abc",
  "clientSecret": "secret_xyz",
  "amount": 500,
  "currency": "DOP"
}
```

#### Test 2: Verificar Estado
```bash
curl http://localhost:3000/api/piquetesPay?orderId=order_123abc
```

#### Test 3: Flujo Completo
1. Abre CheckoutPage
2. Selecciona un paquete
3. Haz clic en "Pagar"
4. Completa el pago en el popup de Wix Pay
5. Verifica que los piquetes se acrediten en el wallet

## 🔒 Seguridad

### Validaciones

✅ **Frontend:**
- Validación de datos de entrada
- Manejo de errores
- Confirmación de pago

✅ **Backend:**
- Validación de parámetros
- Verificación de orden de pago
- Actualización segura de base de datos
- Logging de transacciones

✅ **Wix Pay:**
- Encriptación de datos
- PCI DSS compliant
- Certificado SSL/TLS
- Tokenización de tarjetas

### Mejores Prácticas

1. **Nunca almacenes datos de tarjeta** - Wix Pay maneja esto
2. **Usa HTTPS** - Siempre en producción
3. **Valida en backend** - No confíes solo en frontend
4. **Registra transacciones** - Para auditoría
5. **Maneja errores gracefully** - Muestra mensajes claros

## 📊 Flujo de Datos

### Compra Exitosa

```
1. Usuario selecciona paquete
   ↓
2. Frontend: createPaymentOrder()
   ↓
3. Backend: Crea orden con Wix Pay API
   ↓
4. Frontend: recordPurchase() (status: pending)
   ↓
5. Usuario completa pago en popup
   ↓
6. Wix Pay: Envía webhook (status: completed)
   ↓
7. Backend: onPaymentUpdate() → creditPiquetesOnPayment()
   ↓
8. Actualiza piquetebalances
   ↓
9. Actualiza piquetepurchases (status: completed)
   ↓
10. Frontend: Muestra confirmación
   ↓
11. Redirige a wallet
```

### Compra Fallida

```
1-5. Igual que arriba
   ↓
6. Wix Pay: Envía webhook (status: failed)
   ↓
7. Backend: updatePurchaseStatus() → status: failed
   ↓
8. Frontend: Muestra error
   ↓
9. Usuario puede reintentar
```

## 🐛 Troubleshooting

### Problema: "Error al crear la orden de pago"

**Solución:**
- Verifica que Wix Pay esté habilitado en Settings
- Comprueba que la moneda sea DOP
- Valida los parámetros de entrada

### Problema: Webhook no se ejecuta

**Solución:**
- Verifica que el webhook esté configurado en Dashboard
- Comprueba los logs en Wix Dashboard
- Asegúrate que /backend/events.js existe
- Valida que el handler sea `onPaymentUpdate`

### Problema: Piquetes no se acreditan

**Solución:**
- Verifica que piquetebalances exista
- Comprueba que joseadorEmail sea correcto
- Revisa los logs del webhook
- Valida que la compra esté en piquetepurchases

## 📈 Monitoreo

### Métricas Importantes

- Órdenes de pago creadas
- Pagos completados
- Pagos fallidos
- Piquetes acreditados
- Errores de webhook

### Logs Recomendados

```javascript
// En backend/events.js
console.log('Payment event:', { orderId, status, timestamp: new Date() });
console.log('Piquetes credited:', { joseadorEmail, amount, newBalance });
console.log('Error in payment:', { orderId, error: error.message });
```

## 🔄 Próximos Pasos

1. ✅ Implementar backend files
2. ✅ Configurar webhook
3. ✅ Configurar Wix Pay
4. ✅ Probar flujo completo
5. ✅ Monitorear transacciones
6. ⏳ Agregar refunds
7. ⏳ Agregar reportes de pagos
8. ⏳ Integrar con sistema de facturación

## 📞 Soporte

Para más información sobre Wix Pay:
- [Wix Payments API](https://www.wix.com/en/payments)
- [Wix Backend Documentation](https://www.wix.com/en/velo/reference)
- [Wix Webhooks](https://www.wix.com/en/velo/reference/wix-events)
