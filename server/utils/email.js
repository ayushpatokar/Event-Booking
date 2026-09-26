const { Resend } = require("resend");
const dotenv = require("dotenv");
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  // Kept self-contained: the booking is already saved before this runs,
  // so a failed confirmation email shouldn't fail the whole request.
  try {
    await resend.emails.send({
      from: "Eventora <noreply@eventora.space>",
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
  // No try/catch here on purpose — if sending fails, we throw,
  // so the calling controller's catch block returns a real error
  // to the user instead of silently pretending it worked.
  const title =
    type === "account_verification"
      ? "Verify your Eventora Account"
      : "Event Booking";
  const msg =
    type === "account_verification"
      ? `Your OTP code for account verification for Eventora is: ${otp}`
      : `Your OTP code for event booking is: ${otp}`;

  const { error } = await resend.emails.send({
    from: "Eventora <noreply@eventora.space>",
    to: email,
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
  });

  if (error) {
    throw new Error(error.message || "Failed to send OTP email");
  }

  console.log(`OTP email sent to ${email} for ${type}`);
};

module.exports = { sendBookingEmail, sendOTPEmail };
