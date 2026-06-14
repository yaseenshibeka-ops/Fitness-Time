const pool = require('../config/database');
const crypto = require('crypto');

class PaymentService {
    static generateTransactionRef() {
        return 'TXN-' + Date.now().toString() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    static async initiatePayment({ userId, orderId, subscriptionId, paymentMethod, phoneNumber, amount }) {
        if (!orderId && !subscriptionId) {
            throw { statusCode: 400, message: 'Either orderId or subscriptionId must be provided' };
        }

        const transactionRef = this.generateTransactionRef();
        
        // Ensure status is correctly set based on payment method
        const initialStatus = paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending';

        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query(
                `INSERT INTO payments (user_id, order_id, subscription_id, payment_method, phone_number, amount, transaction_reference, payment_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, orderId || null, subscriptionId || null, paymentMethod, phoneNumber || null, amount, transactionRef, initialStatus]
            );
            var paymentId = result.insertId;
        } finally {
            connection.release();
        }

        // If Cash on Delivery, we can consider the payment flow initiated and awaiting manual confirmation
        if (paymentMethod === 'cash_on_delivery') {
            return {
                paymentId,
                transactionRef,
                status: 'pending',
                message: 'Cash on delivery selected. Payment pending upon delivery.'
            };
        }

        // Bank Transfer — show bank details for manual transfer
        if (paymentMethod === 'bank_transfer') {
            return {
                paymentId,
                transactionRef,
                status: 'pending',
                message: 'Please transfer the total amount to our bank account using the reference below.',
                bankDetails: {
                    bankName: 'Bank of Kigali',
                    accountName: 'FitTrack Rwanda Ltd',
                    accountNumber: '4002-1234567-89',
                    reference: transactionRef,
                }
            };
        }

        // PayPal — mock redirect URL
        if (paymentMethod === 'paypal') {
            return {
                paymentId,
                transactionRef,
                status: 'pending',
                message: 'You will be redirected to PayPal to complete your payment.',
                paypalUrl: `https://www.paypal.com/checkout?reference=${transactionRef}&amount=${amount}`,
            };
        }

        // Mock Mobile Money Flow (MTN/Airtel)
        // In a real app, we would call the external API here.
        // We will simulate a successful push to the user's phone.
        
        return {
            paymentId,
            transactionRef,
            status: 'pending',
            message: `Payment request sent to ${phoneNumber}. Please approve the prompt on your phone.`
        };
    }

    // This would be a webhook endpoint in a real scenario
    static async handlePaymentWebhook(transactionRef, externalStatus) {
        // Find payment
        const [payments] = await pool.query('SELECT * FROM payments WHERE transaction_reference = ?', [transactionRef]);
        if (payments.length === 0) throw { statusCode: 404, message: 'Transaction not found' };
        
        const payment = payments[0];
        
        let newStatus = 'failed';
        if (externalStatus === 'SUCCESS') newStatus = 'completed';
        
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Update payment record
            await connection.query(
                'UPDATE payments SET payment_status = ?, payment_date = NOW() WHERE payment_id = ?',
                [newStatus, payment.payment_id]
            );

            // If success, update related order or subscription
            if (newStatus === 'completed') {
                if (payment.order_id) {
                    await connection.query('UPDATE orders SET status = "processing" WHERE order_id = ?', [payment.order_id]);
                }
                
                if (payment.subscription_id) {
                    await connection.query('UPDATE subscriptions SET status = "active" WHERE subscription_id = ?', [payment.subscription_id]);
                }
            }

            await connection.commit();
            return { message: 'Webhook processed successfully' };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getUserPayments(userId) {
        const [payments] = await pool.query('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return payments;
    }
}

module.exports = PaymentService;
