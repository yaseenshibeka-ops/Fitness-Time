const pool = require('./src/config/database');
const PaymentService = require('./src/services/payment.service');

async function debugHandlePaymentWebhook(transactionRef, externalStatus) {
    console.log('  [DB Webhook] Finding payment for ref:', transactionRef);
    const [payments] = await pool.query('SELECT * FROM payments WHERE transaction_reference = ?', [transactionRef]);
    console.log('  [DB Webhook] Payments found count:', payments.length);
    if (payments.length === 0) throw { statusCode: 404, message: 'Transaction not found' };
    
    const payment = payments[0];
    
    let newStatus = 'failed';
    if (externalStatus === 'SUCCESS') newStatus = 'completed';
    
    console.log('  [DB Webhook] Getting connection from pool...');
    const connection = await pool.getConnection();
    console.log('  [DB Webhook] Connection retrieved.');
    try {
        console.log('  [DB Webhook] Beginning transaction...');
        await connection.beginTransaction();
        console.log('  [DB Webhook] Transaction started.');

        // Update payment record
        console.log('  [DB Webhook] Updating payment status to:', newStatus);
        await connection.query(
            'UPDATE payments SET payment_status = ?, payment_date = NOW() WHERE payment_id = ?',
            [newStatus, payment.payment_id]
        );
        console.log('  [DB Webhook] Payment status updated.');

        // If success, update related order or subscription
        if (newStatus === 'completed') {
            if (payment.order_id) {
                console.log('  [DB Webhook] Updating order status to processing for order_id:', payment.order_id);
                await connection.query('UPDATE orders SET status = "processing" WHERE order_id = ?', [payment.order_id]);
                console.log('  [DB Webhook] Order status updated.');
            }
            
            if (payment.subscription_id) {
                console.log('  [DB Webhook] Updating subscription status to active for subscription_id:', payment.subscription_id);
                await connection.query('UPDATE subscriptions SET status = "active" WHERE subscription_id = ?', [payment.subscription_id]);
                console.log('  [DB Webhook] Subscription status updated.');
            }
        }

        console.log('  [DB Webhook] Committing transaction...');
        await connection.commit();
        console.log('  [DB Webhook] Transaction committed.');
        return { message: 'Webhook processed successfully' };
    } catch (error) {
        console.log('  [DB Webhook] Error caught, rolling back...', error);
        await connection.rollback();
        throw error;
    } finally {
        console.log('  [DB Webhook] Releasing connection...');
        connection.release();
        console.log('  [DB Webhook] Connection released.');
    }
}

async function run() {
    try {
        console.log('1. Initiating payment...');
        const initResult = await PaymentService.initiatePayment({
            userId: 2, // Jean-Pierre Habimana
            orderId: 1, // existing order ID
            paymentMethod: 'mtn_momo',
            phoneNumber: '+250788100001',
            amount: 852000
        });
        
        console.log('Initiated successfully:', initResult);
        
        const { transactionRef } = initResult;
        console.log('2. Simulating webhook with reference:', transactionRef);
        
        const webhookResult = await debugHandlePaymentWebhook(transactionRef, 'SUCCESS');
        console.log('Webhook processed successfully:', webhookResult);
        
    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        await pool.end();
        console.log('Pool closed.');
    }
}

run();
