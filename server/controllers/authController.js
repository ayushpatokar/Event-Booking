const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

//Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let userExists = await User.findOne({ email });

    // Already registered AND verified — this is a genuine duplicate, block it
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    if (userExists && !userExists.isVerified) {
      // They started registering before but never completed OTP verification
      // (refreshed mid-process, OTP expired, etc). Update their details and
      // resend a fresh OTP instead of blocking them with "already exists".
      userExists.name = name;
      userExists.password = hashedPassword;
      user = await userExists.save();
    } else {
      user = await User.create({ name, email, password: hashedPassword, role: 'user', isVerified: false });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${email}: ${otp}`);

    await OTP.deleteMany({ email, action: 'account_verification' });
    await OTP.create({ email, otp, action: 'account_verification' });
    await sendOTPEmail(email, otp, 'account_verification');

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials, Please Sign Up first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    if (!user.isVerified && user.role === "user") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await OTP.deleteMany({
        email,
        action: "account_verification",
      });

      await OTP.create({
        email,
        otp,
        action: "account_verification",
      });

      await sendOTPEmail(email, otp, "account_verification");

      return res.status(400).json({
        error: "Account not verified. A new OTP has been sent to your email.",
        needsVerification: true,
      });
    }

    res.json({
      message: "Login successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp, action: 'account_verification' });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP or OTP expired' });
    }

    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    await OTP.deleteMany({ email, action: 'account_verification' });
    res.json({
      message: 'Account verified successfully. You can now log in.',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser, verifyOtp };