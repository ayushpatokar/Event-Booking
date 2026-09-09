const Booking = require("../models/Bookings.js");
const OTP = require("../models/OTP");
const Event = require("../models/Event");
const { sendOTPEmail, sendBookingEmail } = require("../utils/email");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendBookingOTP = async (req, res) => {
  try {
    const otp = generateOTP();
    await OTP.findOneAndDelete({
      email: req.body.email,
      action: "event_booking",
    });
    await OTP.create({ email: req.body.email, otp, action: "event_booking" });
    await sendOTPEmail(req.body.email, otp, "event_booking");
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;

    const otpRecord = await OTP.findOne({
      email: req.user.email,
      otp,
      action: "event_booking",
    });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ error: "No available seats" });
    }

    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      eventId,
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ error: "You have already booked this event" });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      status: "pending",
      paymentStatus: "non_paid",
      amount: event.ticketPrice,
    });

    await OTP.deleteMany({ email: req.user.email, action: "event_booking" });

    res.status(201).json({
      message:
        "Booking successful. Please check your email for payment instructions.",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const paymentStatus = req.body.paymentStatus;
    if (!["paid", "non_paid"].includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("eventId")
      .populate("userId");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({ error: "Booking is already confirmed" });
    }

    const event = await Event.findById(booking.eventId._id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ error: "No available seats" });
    }

    booking.status = "confirmed";
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }
    await booking.save();
    event.availableSeats -= 1;
    await event.save();

    await sendBookingEmail(
      booking.userId.email,
      booking.userId.name,
      event.title,
    );

    res.json({ message: "Booking confirmed", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate(
      "eventId",
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("eventId")
      .populate("userId", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const wasConfirmed = booking.status === "confirmed";

    booking.status = "cancelled";
    await booking.save();

    if (wasConfirmed) {
      const event = await Event.findById(booking.eventId);
      if (event) {
        event.availableSeats += 1;
        await event.save();
      }
    }

    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};