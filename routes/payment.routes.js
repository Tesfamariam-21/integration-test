const express = require("express");
const jwt = require("jsonwebtoken");
const Payment = require("../models/payment.model");
const router = express.Router();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

router.post("/payment", authenticateToken, async (req, res) => {
  try {
    const { amount, status } = req.body;
    console.log(333333);
    console.log(amount, status);

    const payment = new Payment({
      userId: req.user.userId,
      amount,
      status,
      reference:
        Date.now().toString() + Math.random().toString(36).substring(7),
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error processing payment" });
  }
});

router.get("/payment/:id", authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      reference: req.params.id,
      userId: req.user.userId,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving payment" });
  }
});

module.exports = router;
