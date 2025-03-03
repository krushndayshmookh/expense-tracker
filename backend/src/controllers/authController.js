const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
// Use Resend for email functionality
const { Resend } = require("resend");

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

// Generate a reset token valid for 1 hour
const generateResetToken = (userId) => {
  return jwt.sign({ userId, purpose: "reset" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      user: {
        id: user._id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken(user._id);

    // The reset URL that will be sent to the user
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:8080"
    }/#/reset-password?token=${resetToken}`;

    // In development, we can just log the reset URL
    console.log("Reset URL:", resetUrl);

    try {
      // Send email using Resend
      const { data, error } = await resend.emails.send({
        from:
          process.env.EMAIL_FROM || "Expense Tracker <onboarding@rootkings.dev>",
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You requested a password reset for your Expense Tracker account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
            <p style="margin-top: 20px; color: #666;">This link is valid for 1 hour. If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Expense Tracker Team</p>
          </div>
        `,
      });

      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", data);
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't return an error to the client for security reasons
    }

    res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.purpose !== "reset") {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ valid: true, user: { id: user._id, email: user.email } });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.purpose !== "reset") {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user and update password
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    // Generate new auth token
    const authToken = generateToken(user._id);

    res.status(200).json({
      message: "Password has been reset successfully",
      user: {
        id: user._id,
        email: user.email,
      },
      token: authToken,
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
