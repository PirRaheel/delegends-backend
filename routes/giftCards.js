const express = require('express');
const router = express.Router();
const GiftCard = require('../models/GiftCardFirestore');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create/Purchase a gift card
router.post('/purchase', async (req, res) => {
  try {
    const {
      amount,
      cardType,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      personalMessage,
      deliveryAddress,
      paymentMethodId
    } = req.body;

    // Validate fixed amounts (25, 50, 75, 100, 150, 200)
    const validAmounts = [25, 50, 75, 100, 150, 200];
    if (!validAmounts.includes(amount)) {
      return res.status(400).json({ 
        message: 'Invalid amount. Must be one of: 25, 50, 75, 100, 150, 200' 
      });
    }

    // Validate card type
    if (!['virtual', 'physical'].includes(cardType)) {
      return res.status(400).json({ message: 'Invalid card type' });
    }

    // Calculate total (add shipping for physical cards)
    const shippingCost = cardType === 'physical' ? 5 : 0;
    const totalAmount = amount + shippingCost;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Convert to cents
      currency: 'eur',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        type: 'gift_card',
        cardType,
        amount,
        recipientEmail
      }
    });

    // Generate unique gift card code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = GiftCard.generateCode();
      const existing = await GiftCard.findOne({ code });
      if (!existing) isUnique = true;
    }

    // Set expiry date (12 months from purchase)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Create gift card
    const giftCard = new GiftCard({
      code,
      amount,
      balance: amount,
      cardType,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      personalMessage,
      deliveryAddress: cardType === 'physical' ? deliveryAddress : undefined,
      expiryDate,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status === 'succeeded' ? 'paid' : 'pending'
    });

    await giftCard.save();

    // TODO: Send email to recipient with gift card details
    // TODO: If physical, trigger physical card production/shipping

    res.status(201).json({
      message: 'Gift card purchased successfully',
      giftCard: {
        code: giftCard.code,
        amount: giftCard.amount,
        cardType: giftCard.cardType,
        expiryDate: giftCard.expiryDate,
        recipientEmail: giftCard.recipientEmail
      },
      paymentStatus: paymentIntent.status
    });
  } catch (error) {
    console.error('Gift card purchase error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to purchase gift card' 
    });
  }
});

// Validate gift card code
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });
    
    if (!giftCard) {
      return res.status(404).json({ 
        valid: false,
        message: 'Gift card not found' 
      });
    }

    const isValid = giftCard.isValid();
    
    res.json({
      valid: isValid,
      balance: isValid ? giftCard.balance : 0,
      expiryDate: giftCard.expiryDate,
      status: giftCard.status,
      message: isValid ? 'Gift card is valid' : 'Gift card is not valid'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Use/redeem gift card for a booking
router.post('/redeem', authMiddleware, async (req, res) => {
  try {
    const { code, amount, bookingId, location } = req.body;

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });
    
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    if (!giftCard.isValid()) {
      return res.status(400).json({ 
        message: 'Gift card is not valid or has expired' 
      });
    }

    if (giftCard.balance < amount) {
      return res.status(400).json({ 
        message: 'Insufficient gift card balance',
        balance: giftCard.balance 
      });
    }

    await giftCard.use(amount, bookingId, location);

    res.json({
      message: 'Gift card redeemed successfully',
      amountUsed: amount,
      remainingBalance: giftCard.balance,
      status: giftCard.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get gift card details (Admin only)
router.get('/:code', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { code } = req.params;
    
    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() })
      .populate('usageHistory.bookingId');
    
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    res.json(giftCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all gift cards (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, cardType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (cardType) filter.cardType = cardType;

    const giftCards = await GiftCard.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(giftCards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel gift card (Admin only)
router.patch('/:code/cancel', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { code } = req.params;
    
    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });
    
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    giftCard.status = 'cancelled';
    await giftCard.save();

    res.json({ 
      message: 'Gift card cancelled successfully',
      giftCard 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
