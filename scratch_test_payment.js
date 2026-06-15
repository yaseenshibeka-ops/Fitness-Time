const fs = require('fs');
const pool = require('./src/config/database');
const PaymentService = require('./src/services/payment.service');

const LOG_FILE = 'scratch_debug.log';
// Clear log
fs.writeFileSync(LOG_FILE, '');

function debugLog(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, line);
    console.log(msg);
}

async function debugHandlePaymentWebhook(transactionRef, externalStatus) {
    debugLog('  [DB Webhook] Finding payment for ref: ' + transactionRef);
    const [payments] = await pool.query('SELECT * FROM payments WHERE transaction_reference = ?', [transactionRef]);
    debugLog('  [DB Webhook] Payments found count: ' + payments.length);
    if (payments.length === 0) throw { statusCode: 404, message: 'Transaction not found' };
    
    const payment = payments[0];
    
    let newStatus = 'failed';
    if (externalStatus === 'SUCCESS') newStatus = 'completed';
    
    debugLog('  [DB Webhook] Getting connection from pool...');
    const connection = await pool.getConnection();
    debugLog('  [DB Webhook] Connection retrieved.');
    try {
        debugLog('  [DB Webhook] Beginning transaction...');
        await connection.beginTransaction();
        debugLog('  [DB Webhook] Transaction started.');

        // Update payment record
        debugLog('  [DB Webhook] Updating payment status to: ' + newStatus);
        await connection.query(
            'UPDATE payments SET payment_status = ?, payment_date = NOW() WHERE payment_id = ?',
            [newStatus, payment.payment_id]
        );
        debugLog('  [DB Webhook] Payment status updated.');

        // If success, update related order or subscription
        if (newStatus === 'completed') {
            if (payment.order_id) {
                debugLog('  [DB Webhook] Updating order status to processing for order_id: ' + payment.order_id);
                await connection.query('UPDATE orders SET status = "processing" WHERE order_id = ?', [payment.order_id]);
                debugLog('  [DB Webhook] Order status updated.');
            }
            
            if (payment.subscription_id) {
                debugLog('  [DB Webhook] Updating subscription status to active for subscription_id: ' + payment.subscription_id);
                await connection.query('UPDATE subscriptions SET status = "active" WHERE subscription_id = ?', [payment.subscription_id]);
                debugLog('  [DB Webhook] Subscription status updated.');
            }
        }

        debugLog('  [DB Webhook] Committing transaction...');
        await connection.commit();
        debugLog('  [DB Webhook] Transaction committed.');
        return { message: 'Webhook processed successfully' };
    } catch (error) {
        debugLog('  [DB Webhook] Error caught, rolling back... ' + error.stack || error.message || error);
        await connection.rollback();
        throw error;
    } finally {
        debugLog('  [DB Webhook] Releasing connection...');
        connection.release();
        debugLog('  [DB Webhook] Connection released.');
    }
}

async function run() {
    try {
        debugLog('1. Initiating payment...');
        const initResult = await PaymentService.initiatePayment({
            userId: 2, // Jean-Pierre Habimana
            orderId: 1, // existing order ID
            paymentMethod: 'mtn_momo',
            phoneNumber: '+250788100001',
            amount: 852000
        });
        
        debugLog('Initiated successfully: ' + JSON.stringify(initResult));
        
        const { transactionRef } = initResult;
        debugLog('2. Simulating webhook with reference: ' + transactionRef);
        
        const webhookResult = await debugHandlePaymentWebhook(transactionRef, 'SUCCESS');
        debugLog('Webhook processed successfully: ' + JSON.stringify(webhookResult));
        
    } catch (err) {
        debugLog('Error occurred: ' + (err.stack || err.message || JSON.stringify(err)));
    } finally {
        await pool.end();
        debugLog('Pool closed.');
    }
}

run();
