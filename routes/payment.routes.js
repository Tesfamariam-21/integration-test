const express = require("express");
const jwt = require("jsonwebtoken");
const Payment = require("../models/payment.model");
const router = express.Router();

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
    const { amount } = req.body;

    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const payment = new Payment({
      userId: req.user.userId,
      amount,
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

router.put("/payment/:id", authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      reference: req.params.id,
      userId: req.user.userId,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "Pending") {
      return res.status(400).json({ message: "Payment cannot be processed" });
    }

    payment.status = "Success";
    await payment.save();

    res.json({ message: "Payment processed successfully", payment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error processing payment" });
  }
});

module.exports = router;
