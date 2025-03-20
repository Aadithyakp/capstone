const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const User = require('../models/User');

// Create a Stripe checkout session
router.post('/create-checkout-session', auth, async (req, res) => {
    try {
        const { plan } = req.body;

        if (!plan || plan !== 'premium') {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user already has an active premium subscription
        if (user.plan === 'premium' && user.status === 'active' && user.subscriptionEndDate > new Date()) {
            return res.status(400).json({ error: 'You already have an active premium subscription' });
        }

        // Define product details based on plan
        const productDetails = {
            premium: {
                name: 'Premium Plan',
                price: 2999, // $29.99 in cents
                description: 'Unlimited access to all gyms and classes'
            }
        };

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: productDetails[plan].name,
                            description: productDetails[plan].description,
                        },
                        unit_amount: productDetails[plan].price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment?error=${encodeURIComponent('Payment was cancelled')}`,
            customer_email: user.email,
            metadata: {
                userId: user._id.toString(),
                plan: plan
            }
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Stripe session error:', error);
        
        // Handle specific Stripe errors
        if (error.type === 'StripeCardError') {
            console.log(error.type);
            return res.status(400).json({ error: 'Your card was declined. Please try again with a different card.' });
            
        } else if (error.type === 'StripeInvalidRequestError') {
            console.log(error.type);
            return res.status(400).json({ error: 'Invalid payment request. Please try again.' });
        }
        console.log(error.type);
        res.status(500).json({ error: 'Failed to process payment. Please try again later.' });
    }
});

// Handle successful payment
router.get('/payment-success', auth, async (req, res) => {
    try {
        const { session_id } = req.query;
        
        if (!session_id) {
            console.log(error.type);
            return res.status(400).json({ error: 'Session ID is required' });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (!session) {
            console.log(error.type);
            return res.status(404).json({ error: 'Payment session not found' });
        }

        // Verify the session belongs to the current user
        if (session.metadata.userId !== req.user.id) {
            console.log(error.type);
            return res.status(403).json({ error: 'Unauthorized access to payment session' });
        }

        if (session.payment_status !== 'paid') {
            console.log(error.type);
            return res.status(400).json({ error: 'Payment has not been completed' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user subscription status
        user.status = 'active';
        user.plan = session.metadata.plan;
        user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        await user.save();

        res.json({ 
            success: true,
            message: 'Payment processed successfully',
            plan: user.plan,
            expiryDate: user.subscriptionEndDate
        });
    } catch (error) {
        console.error('Payment verification error:', error);

        if (error.type === 'StripeInvalidRequestError') {
            console.log(error.type);
            return res.status(400).json({ error: 'Invalid payment session' });
        } else if (error.code === 'resource_missing') {
            console.log(error.type);
            return res.status(404).json({ error: 'Payment session not found' });
        }
        console.log(error.type);
        res.status(500).json({ error: 'Failed to verify payment. Please contact support.' });
    }
});

// Webhook to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                
                const user = await User.findById(session.metadata.userId);
                if (!user) {
                    throw new Error('User not found');
                }

                // Update user subscription status
                user.status = 'active';
                user.plan = session.metadata.plan;
                user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                await user.save();

                console.log(`User ${user._id} subscription updated: plan=${user.plan}, status=${user.status}`);
                break;

            case 'payment_intent.payment_failed':
                const paymentIntent = event.data.object;
                console.error('Payment failed:', paymentIntent.id);
                
                // Handle failed payment
                if (paymentIntent.metadata.userId) {
                    const user = await User.findById(paymentIntent.metadata.userId);
                    if (user) {
                        // Reset user status if payment failed
                        user.status = 'inactive';
                        user.plan = 'free';
                        await user.save();
                        console.log(`User ${user._id} status reset due to failed payment`);
                    }
                }
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router;
