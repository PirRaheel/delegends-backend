const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserFirestore');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');


router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'customer',
      createdAt: new Date()
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully ',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin-only: Create employee accounts (Receptionist, Admin, Owner)
router.post('/create-employee', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate role - only staff roles allowed
    if (!['receptionist', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be receptionist, admin, or owner' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      createdAt: new Date()
    });

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/user/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, gender, birthMonth, birthDay, birthYear, marketingConsent, prepaymentRequired, note } = req.body;

    if (req.user.id !== id && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email) updates.email = email;
    if (gender) updates.gender = gender;
    if (birthMonth !== undefined) updates.birthMonth = birthMonth;
    if (birthDay !== undefined) updates.birthDay = birthDay;
    if (birthYear !== undefined) updates.birthYear = birthYear;
    if (marketingConsent !== undefined) updates.marketingConsent = marketingConsent;
    if (prepaymentRequired !== undefined) updates.prepaymentRequired = prepaymentRequired;
    if (note !== undefined) updates.note = note;
    
    const updatedUser = await User.update(id, updates);

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        birthMonth: updatedUser.birthMonth,
        birthDay: updatedUser.birthDay,
        birthYear: updatedUser.birthYear,
        marketingConsent: updatedUser.marketingConsent,
        prepaymentRequired: updatedUser.prepaymentRequired,
        note: updatedUser.note,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role by email (Admin only)
router.put('/user-by-email/:email', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['receptionist', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const updatedUser = await User.update(user.id, { role });

    res.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;