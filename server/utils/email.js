const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Booking Confirmation: ${eventTitle}`,
      html: `
        <div style="font-family: Arial; padding: 20px; text-align: center;">
          <h2 style="color: #6366f1;">Eventora</h2>
          <p>Dear ${userName},</p>
          <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
          <p>Thank you for choosing Eventora!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Booking email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending booking email:", error);
  }
};

const sendOTPEmail = async (email, otp, type) => {
  try {
    const title =
      type === "account_verification"
        ? "Verify your Eventora Account"
        : "Event Booking";
    const msg =
      type === "account_verification"
        ? `Your OTP code for account verification for Eventora is: ${otp}`
        : `Your OTP code for event booking is: ${otp}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: title,
      html: `  <div style="font-family: Arial; padding: 20px; text-align: center;">
    <h2 style="color: #6366f1;">${title}</h2>

    <p>${msg}</p>

    <h1 style="
      color: #6366f1;
      background: #f1f1ff;
      padding: 12px;
      letter-spacing: 5px;
    ">
      ${otp}
    </h1>

    <p style="color: #777; font-size: 14px;">
      Please do not share this OTP.
    </p>
  </div>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email} for ${type}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

module.exports = {sendBookingEmail ,sendOTPEmail };
