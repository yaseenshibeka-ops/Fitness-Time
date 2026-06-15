const pool = require('./src/config/database');
const PaymentService = require('./src/services/payment.service');

async function run() {
    try {
        console.log('1. Initiating payment...');
        const initResult = await PaymentService.initiatePayment({
            userId: 2, // Jean-Pierre Habimana
            orderId: 1, // existing order ID from seed data
            paymentMethod: 'mtn_momo',
            phoneNumber: '+250788100001',
            amount: 852000
        });
        
        console.log('Initiated successfully:', initResult);
        
        const { transactionRef } = initResult;
        console.log('2. Simulating webhook with reference:', transactionRef);
        
        const webhookResult = await PaymentService.handlePaymentWebhook(transactionRef, 'SUCCESS');
        console.log('Webhook processed successfully:', webhookResult);
        
    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        await pool.end();
        console.log('Pool closed.');
    }
}

run();
