const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  family: 4,
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter failed to connect:", error.message);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    await transporter.sendMail({
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
    });
    console.log(`Booking email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending booking email:", error);
  }
};

const sendOTPEmail = async (email, otp, type) => {
  const title =
    type === "account_verification"
      ? "Verify your Eventora Account"
      : "Event Booking";
  const msg =
    type === "account_verification"
      ? `Your OTP code for account verification for Eventora is: ${otp}`
      : `Your OTP code for event booking is: ${otp}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: title,
    html: `  <div style="font-family: Arial; padding: 20px; text-align: center;">
    <h2 style="color: #6366f1;">${title}</h2>
    <p>${msg}</p>
    <h1 style="color: #6366f1; background: #f1f1ff; padding: 12px; letter-spacing: 5px;">
      ${otp}
    </h1>
    <p style="color: #777; font-size: 14px;">Please do not share this OTP.</p>
  </div>`,
  });

  console.log(`OTP email sent to ${email} for ${type}`);
};

module.exports = { sendBookingEmail, sendOTPEmail };